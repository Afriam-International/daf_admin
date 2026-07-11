import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";

const permissionFields = [
  { key: "canManageUsers", label: "Manage Users" },
  { key: "canManageGallery", label: "Manage Gallery" },
  { key: "canViewDonations", label: "View Donations" },
  { key: "canViewAnalytics", label: "View Analytics" },
  { key: "canManageBlog", label: "Manage Blog" },
  { key: "canManageFeed", label: "Manage Social Feed" },
  { key: "canManageFaqs", label: "Manage FAQs" },
  { key: "canManageInfos", label: "Manage Info" },
  { key: "canManageDeletionRequests", label: "Manage Deletion Requests" },
  { key: "canViewActivityLog", label: "View Activity Log" },
];

export default function PermissionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await userService.getPermissions();
      setItems(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load permissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const filteredItems = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) => {
      const name = `${item.admin.firstname || ""} ${item.admin.lastname || ""}`.toLowerCase();
      const email = item.admin.email?.toLowerCase() || "";
      return name.includes(query) || email.includes(query);
    });
  }, [items, deferredSearch]);

  const handleToggle = async (adminId, key, value) => {
    try {
      await userService.updatePermissions(adminId, { [key]: value });
      setSuccess("Permissions updated successfully.");
      await loadPermissions();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update permissions");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Access"
        title="Roles and permissions"
        description="Superadmin can tune what each admin is allowed to do. Admins can view this configuration."
      />

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
        <PageLoader label="Loading permissions..." />
      ) : (
        <div className="space-y-4">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <section key={item.admin.id} className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-[var(--color-brown)]">{`${item.admin.firstname || ""} ${item.admin.lastname || ""}`.trim() || item.admin.email}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.admin.email}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {permissionFields.map((field) => (
                    <label key={field.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                      <span className="text-sm font-medium text-slate-700">{field.label}</span>
                      {item.permissions.isSuperadmin ? (
                        <span className="rounded-full bg-[var(--color-brown)]/10 px-3 py-1 text-xs font-semibold text-[var(--color-brown)]">Always On</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={Boolean(item.permissions[field.key])}
                          disabled={user?.role !== "superadmin"}
                          onChange={(event) => handleToggle(item.admin.id, field.key, event.target.checked)}
                          className="h-5 w-5 rounded border-slate-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                        />
                      )}
                    </label>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-[0_24px_60px_rgba(74,44,31,0.04)]">
              <h2 className="text-xl font-semibold text-[var(--color-brown)]">No admins found</h2>
              <p className="mt-2 text-sm text-slate-500">Try a different admin name or email in your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
