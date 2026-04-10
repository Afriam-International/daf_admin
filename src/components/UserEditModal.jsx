import { useEffect, useState } from "react";

const permissionFields = [
  { key: "canManageUsers", label: "Manage Users" },
  { key: "canManageGallery", label: "Manage Gallery" },
  { key: "canViewDonations", label: "View Donations" },
  { key: "canViewAnalytics", label: "View Analytics" },
  { key: "canManageBlog", label: "Manage Blog" },
  { key: "canManageFeed", label: "Manage Social Feed" },
  { key: "canManageFaqs", label: "Manage FAQs" },
  { key: "canManageDeletionRequests", label: "Manage Deletion Requests" },
  { key: "canViewActivityLog", label: "View Activity Log" },
];

export default function UserEditModal({
  open,
  title,
  user,
  includePermissions = false,
  permissions = null,
  busy = false,
  statusOptions = [],
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    status: "active",
  });
  const [permissionState, setPermissionState] = useState({});

  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        contact: user.contact || "",
        status: user.status || "active",
      });
    }
  }, [user]);

  useEffect(() => {
    if (permissions) {
      const nextState = {};
      permissionFields.forEach(({ key }) => {
        nextState[key] = Boolean(permissions[key]);
      });
      setPermissionState(nextState);
    } else {
      setPermissionState({});
    }
  }, [permissions]);

  if (!open || !user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-brown)]">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{user.email}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Close
          </button>
        </div>

        <form
          className="mt-6 space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ ...form, permissions: permissionState });
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.firstname} disabled={!includePermissions} onChange={(e) => setForm((c) => ({ ...c, firstname: e.target.value }))} placeholder="First name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            <input value={form.lastname} disabled={!includePermissions} onChange={(e) => setForm((c) => ({ ...c, lastname: e.target.value }))} placeholder="Last name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            <input value={form.email} disabled={!includePermissions} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="Email address" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none md:col-span-2" />
            <input value={form.contact} disabled={!includePermissions} onChange={(e) => setForm((c) => ({ ...c, contact: e.target.value }))} placeholder="Contact" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none" />
            <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value }))} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none">
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {includePermissions ? (
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Permissions</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {permissionFields.map((field) => (
                  <label key={field.key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <span className="text-sm text-slate-700">{field.label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(permissionState[field.key])}
                      onChange={(event) =>
                        setPermissionState((current) => ({
                          ...current,
                          [field.key]: event.target.checked,
                        }))
                      }
                      className="h-5 w-5 rounded border-slate-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
