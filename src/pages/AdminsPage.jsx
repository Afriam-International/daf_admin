import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Shield, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import UserEditModal from "../components/UserEditModal";
import UserViewModal from "../components/UserViewModal";
import PageLoader from "../components/PageLoader";
import { userService } from "../services/userService";
import { formatDateTime } from "../services/formatters";
import { useAuth } from "../hooks/useAuth";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Disabled", value: "disabled" },
];

export default function AdminsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [permissionsMap, setPermissionsMap] = useState({});
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [targetAdmin, setTargetAdmin] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  if (user?.role !== "superadmin") {
    return <Navigate to="/admin/users" replace />;
  }

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const [adminsResponse, permissionsResponse] = await Promise.all([
        userService.getAllUsers({ page: 1, limit: 100, role: "admin" }),
        userService.getPermissions(),
      ]);
      const adminList = adminsResponse.data.data || [];
      setAdmins(adminList);

      const nextPermissions = {};
      (permissionsResponse.data.data || []).forEach((item) => {
        nextPermissions[item.admin.id] = item.permissions;
      });
      setPermissionsMap(nextPermissions);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return admins;

    return admins.filter((admin) => {
      const name = `${admin.firstname || ""} ${admin.lastname || ""}`.toLowerCase();
      const email = admin.email?.toLowerCase() || "";
      return name.includes(query) || email.includes(query);
    });
  }, [admins, deferredSearch]);

  const handleCreateAdmin = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await userService.createAdmin(form);
      setForm({ firstname: "", lastname: "", email: "", contact: "", password: "" });
      setSuccess("Admin created successfully.");
      await loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create admin");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!targetAdmin) return;
    setBusy(true);

    try {
      await userService.deleteUser(targetAdmin.id);
      setTargetAdmin(null);
      setSuccess("Admin removed successfully.");
      await loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove admin");
    } finally {
      setBusy(false);
    }
  };

  const handleEditAdmin = async (payload) => {
    if (!selectedAdmin) return;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        userService.updateUser(selectedAdmin.id, {
          firstname: payload.firstname,
          lastname: payload.lastname,
          email: payload.email,
          contact: payload.contact,
          status: payload.status,
        }),
        userService.updatePermissions(selectedAdmin.id, payload.permissions),
      ]);

      setSelectedAdmin(null);
      setSuccess("Admin updated successfully.");
      await loadAdmins();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update admin");
    } finally {
      setBusy(false);
    }
  };

  const openViewModal = async (admin) => {
    try {
      const response = await userService.getUserById(admin.id);
      setViewAdmin(response.data.data || admin);
    } catch {
      setViewAdmin(admin);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admins" title="Admin accounts" description="Only superadmin can add, remove, view, and edit admin accounts and their permissions." />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <form className="grid gap-4 lg:grid-cols-5" onSubmit={handleCreateAdmin}>
          <input value={form.firstname} onChange={(e) => setForm((c) => ({ ...c, firstname: e.target.value }))} placeholder="First name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <input value={form.lastname} onChange={(e) => setForm((c) => ({ ...c, lastname: e.target.value }))} placeholder="Last name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email address" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <input value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} placeholder="Contact" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <div className="flex gap-3">
            <input value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} placeholder="Temporary password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Search Admins</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by admin name or email"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
      </section>

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{success}</div> : null}

      {loading ? (
        <PageLoader label="Loading admins..." />
      ) : (
        <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <h2 className="text-xl font-semibold text-[var(--color-brown)]">Admin team</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Permissions</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.length ? (
                  filteredAdmins.map((admin) => {
                    const permissionCount = Object.entries(permissionsMap[admin.id] || {}).filter(([key, value]) => key.startsWith("can") && value).length;
                    return (
                      <tr key={admin.id} className="border-t border-slate-100">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--color-brown)]/10 text-[var(--color-brown)]">
                              <Shield className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{`${admin.firstname || ""} ${admin.lastname || ""}`.trim()}</p>
                              <p className="text-sm text-slate-500">{admin.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">{admin.status}</span></td>
                        <td className="px-6 py-4 text-sm text-slate-600">{permissionCount} enabled</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(admin.createdAt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => openViewModal(admin)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            <button type="button" onClick={() => setSelectedAdmin(admin)} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-teal)]/20 px-4 py-2 text-sm font-medium text-[var(--color-teal)]">
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button type="button" onClick={() => setTargetAdmin(admin)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">No admins found for this search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <ConfirmModal open={Boolean(targetAdmin)} title="Remove admin" message={targetAdmin ? `Remove ${targetAdmin.email} from the admin team?` : ""} confirmLabel="Remove Admin" tone="danger" busy={busy} onClose={() => setTargetAdmin(null)} onConfirm={handleDeleteAdmin} />
      <UserEditModal open={Boolean(selectedAdmin)} title="Edit admin" user={selectedAdmin} includePermissions permissions={selectedAdmin ? permissionsMap[selectedAdmin.id] : null} busy={busy} statusOptions={statusOptions} onClose={() => setSelectedAdmin(null)} onSubmit={handleEditAdmin} />
      <UserViewModal open={Boolean(viewAdmin)} title="Admin information" user={viewAdmin} permissions={viewAdmin ? permissionsMap[viewAdmin.id] : null} onClose={() => setViewAdmin(null)} />
    </div>
  );
}
