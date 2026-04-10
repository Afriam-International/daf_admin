import { useDeferredValue, useEffect, useState } from "react";
import { Download, Eye, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import UserEditModal from "../components/UserEditModal";
import UserViewModal from "../components/UserViewModal";
import FileUploadModal from "../components/FileUploadModal";
import PageLoader from "../components/PageLoader";
import { userService } from "../services/userService";
import { formatDateTime } from "../services/formatters";

const filterStatusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Disabled", value: "disabled" },
];

const formStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Disabled", value: "disabled" },
  { label: "Requested Deletion", value: "deletion_requested" },
];

const badgeStyles = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-amber-100 text-amber-700",
  disabled: "bg-slate-200 text-slate-700",
  deletion_requested: "bg-rose-100 text-rose-700",
};

const sampleCsv = [
  "firstname,lastname,email,contact,country,state,city,",
  "Ama,Mensah,ama@example.com,+233000000000,Ghana,Greater Accra,Accra",
].join("\n");

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmState, setConfirmState] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const deferredSearch = useDeferredValue(filters.search);

  const loadUsers = async (page = 1) => {
    setLoading(true);
    setError("");

    try {
      const response = await userService.getAllUsers({
        page,
        limit: 10,
        role: "user",
        status: filters.status,
        search: deferredSearch,
      });

      setUsers(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(1);
  }, [deferredSearch, filters.status]);

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await userService.createUser(form);
      setForm({
        firstname: "",
        lastname: "",
        email: "",
        contact: "",
        password: "",
      });
      setSuccess("User created successfully.");
      await loadUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create user");
    }
  };

  const openDeleteModal = (user) => {
    setConfirmState({
      user,
      title: "Delete user",
      message: `This will mark ${user.firstname} ${user.lastname} as deleted. Do you want to continue?`,
      confirmLabel: "Delete User",
      tone: "danger",
    });
  };

  const openViewModal = async (user) => {
    try {
      const response = await userService.getUserById(user.id);
      setViewUser(response.data.data || user);
    } catch {
      setViewUser(user);
    }
  };

  const handleConfirm = async () => {
    if (!confirmState) return;
    setBusyId(confirmState.user.id);
    setError("");
    setSuccess("");

    try {
      await userService.deleteUser(confirmState.user.id);
      setSuccess("User deleted successfully.");
      setConfirmState(null);
      await loadUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to complete action");
    } finally {
      setBusyId("");
    }
  };

  const handleSaveEdit = async (payload) => {
    if (!selectedUser) return;
    setBusyId(selectedUser.id);
    setError("");
    setSuccess("");

    try {
      await userService.updateUser(selectedUser.id, {
        firstname: payload.firstname,
        lastname: payload.lastname,
        email: payload.email,
        contact: payload.contact,
        status: payload.status,
      });
      setSelectedUser(null);
      setSuccess("User updated successfully.");
      await loadUsers(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user");
    } finally {
      setBusyId("");
    }
  };

  const handleExportUsers = async () => {
    try {
      const rows = [];
      let page = 1;
      let totalPages = 1;

      do {
        const response = await userService.getAllUsers({
          page,
          limit: 100,
          role: "user",
          status: filters.status,
          search: deferredSearch,
        });

        rows.push(...(response.data.data || []));
        totalPages = response.data.pagination?.totalPages || 1;
        page += 1;
      } while (page <= totalPages);

      const csv = [
        ["First Name", "Last Name", "Email", "Contact", "Status", "Country", "Country Code", "Region", "City", "Language", "Locale", "Timezone", "IP Address", "Signup Method", "Created At", "Last Login At"].join(","),
        ...rows.map((item) =>
          [
            item.firstname || "",
            item.lastname || "",
            item.email || "",
            item.contact || "",
            item.status || "",
            item.country || "",
            item.countryCode || "",
            item.region || "",
            item.city || "",
            item.preferredLanguage || "",
            item.providerLocale || "",
            item.timezone || "",
            item.ipAddress || "",
            item.signUpMethod || "",
            item.createdAt || "",
            item.lastLoginAt || "",
          ]
            .map((value) => `"${String(value).replaceAll('"', '""')}"`)
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "daf-users.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to export users");
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "daf-users-sample.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportProgress(0);
    setError("");
    setSuccess("");

    try {
      const response = await userService.importUsers(file, (progressEvent) => {
        const total = progressEvent.total || 1;
        setImportProgress((progressEvent.loaded / total) * 100);
      });
      const { created = 0, updated = 0 } = response.data.data || {};
      setSuccess(`Import completed. Created ${created} users and updated ${updated} users.`);
      setImportOpen(false);
      await loadUsers(1);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to import users");
    } finally {
      setImporting(false);
      setImportProgress(0);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Users"
        title="App users"
        description="Add users, import or export user records, view demographics, and edit account information."
        actions={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleDownloadSample} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
              <Download className="h-4 w-4" />
              Sample CSV
            </button>
            <button type="button" onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-accent)]/20 bg-white px-4 py-3 text-sm font-semibold text-[var(--color-accent)]">
              <Upload className="h-4 w-4" />
              Import Users
            </button>
            <button type="button" onClick={handleExportUsers} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brown)] px-4 py-3 text-sm font-semibold text-white">
              <Download className="h-4 w-4" />
              Export Users
            </button>
          </div>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <form className="grid gap-4 lg:grid-cols-5" onSubmit={handleCreateUser}>
          <input value={form.firstname} onChange={(e) => setForm((c) => ({ ...c, firstname: e.target.value }))} placeholder="First name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <input value={form.lastname} onChange={(e) => setForm((c) => ({ ...c, lastname: e.target.value }))} placeholder="Last name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email address" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <input value={form.contact} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} placeholder="Contact" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
          <div className="flex gap-3">
            <input value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} placeholder="Temporary password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Search Users</span>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search by name, email, or username" className="w-full bg-transparent text-sm outline-none" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              {filterStatusOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{success}</div> : null}

      {loading ? (
        <PageLoader label="Loading users..." />
      ) : (
        <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-brown)]">User directory</h2>
              <p className="mt-1 text-sm text-slate-500">{pagination.total || 0} user records</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Country</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{`${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badgeStyles[user.status] || "bg-slate-100 text-slate-700"}`}>
                          {String(user.status || "").replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.country || user.countryCode || "-"}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => openViewModal(user)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button type="button" onClick={() => setSelectedUser(user)} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-accent)]/20 px-4 py-2 text-sm font-medium text-[var(--color-accent)]">
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button type="button" onClick={() => openDeleteModal(user)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            <p>Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button type="button" disabled={pagination.page <= 1} onClick={() => loadUsers(pagination.page - 1)} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">Previous</button>
              <button type="button" disabled={pagination.page >= pagination.totalPages} onClick={() => loadUsers(pagination.page + 1)} className="rounded-2xl border border-slate-200 px-4 py-2 disabled:opacity-40">Next</button>
            </div>
          </div>
        </section>
      )}

      <ConfirmModal open={Boolean(confirmState)} title={confirmState?.title} message={confirmState?.message} confirmLabel={confirmState?.confirmLabel} tone={confirmState?.tone} busy={Boolean(busyId)} onClose={() => setConfirmState(null)} onConfirm={handleConfirm} />
      <UserEditModal open={Boolean(selectedUser)} title="Edit user" user={selectedUser} busy={Boolean(busyId)} statusOptions={formStatusOptions} onClose={() => setSelectedUser(null)} onSubmit={handleSaveEdit} />
      <UserViewModal open={Boolean(viewUser)} title="User information" user={viewUser} onClose={() => setViewUser(null)} />
      <FileUploadModal open={importOpen} title="Import users" description="Upload a CSV with the provided headers to create or update user records." fileLabel="Choose CSV file" accept=".csv,text/csv" progress={importProgress} busy={importing} onClose={() => setImportOpen(false)} onFileChange={handleImportFile} />
    </div>
  );
}
