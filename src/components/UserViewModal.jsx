import { CalendarDays, Globe2, Mail, MapPin, Shield, Smartphone } from "lucide-react";
import { formatDateTime } from "../services/formatters";

export default function UserViewModal({ open, title, user, permissions = null, onClose }) {
  if (!open || !user) return null;

  const capitalize = (str = "") => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");
  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email;
  const statusLabel = user.status ? String(capitalize(user.status)).replaceAll("_", " ") : "-";
  const roleLabel = capitalize(user.role) || "-";

  const identityFields = [
    { label: "Email address", value: user.email || "-", icon: Mail },
    { label: "Username", value: user.username || "-", icon: Shield },
    { label: "Contact", value: user.contact || "-", icon: Smartphone },
    { label: "Signup method", value: capitalize(user.signUpMethod) || "-", icon: Globe2 },
  ];

  const demographicFields = [
    { label: "Country", value: user.country || "-" },
    { label: "Country code", value: user.countryCode || "-" },
    { label: "Region", value: user.region || "-" },
    { label: "City", value: user.city || "-" },
    { label: "Language", value: user.preferredLanguage || "-" },
    { label: "Provider locale", value: user.providerLocale || "-" },
    { label: "Timezone", value: user.timezone || "-" },
    { label: "IP address", value: user.ipAddress || "-" },
  ];

  const timelineFields = [
    { label: "Created", value: user.createdAt ? formatDateTime(user.createdAt) : "-" },
    { label: "Updated", value: user.updatedAt ? formatDateTime(user.updatedAt) : "-" },
    { label: "Last login", value: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "-" },
    { label: "Password reset", value: user.passwordResetAt ? formatDateTime(user.passwordResetAt) : "-" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[34px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="overflow-hidden rounded-t-[34px] bg-[linear-gradient(135deg,#4A2C1F_0%,#2DAABF_100%)] p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-[24px] bg-white/15 text-xl font-semibold backdrop-blur">
                {fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/70">{title}</p>
                <h3 className="mt-2 text-2xl font-semibold">{fullName}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    {roleLabel}
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white">
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>

            <button type="button" onClick={onClose} className="rounded-2xl border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              Close
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <section className="rounded-[28px] border border-slate-100 bg-slate-50/80 p-5">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[var(--color-teal)]" />
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Identity</h4>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {identityFields.map((field) => {
                const Icon = field.icon;
                return (
                  <div key={field.label} className="rounded-[24px] border border-white bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-teal)]/10 text-[var(--color-teal)]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{field.label}</p>
                        <p className="mt-1 text-sm font-medium text-slate-900">{field.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[var(--color-teal)]" />
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Demographics</h4>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {demographicFields.map((field) => (
                <div key={field.label} className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{field.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{field.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[var(--color-teal)]" />
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Timeline</h4>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {timelineFields.map((field) => (
                <div key={field.label} className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{field.label}</p>
                  <p className="mt-2 text-sm font-medium text-slate-900">{field.value}</p>
                </div>
              ))}
            </div>
          </section>

          {permissions ? (
            <section className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-[var(--color-teal)]" />
                <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Permissions</h4>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.entries(permissions)
                  .filter(([key]) => key.startsWith("can"))
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4">
                      <span className="text-sm font-medium text-slate-700">{key.replace(/^can/, "").replace(/([A-Z])/g, " $1").trim()}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${value ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                        {value ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
