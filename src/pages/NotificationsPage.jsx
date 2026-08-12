import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  Search,
  Send,
  Smartphone,
  Users,
  X,
  XCircle,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import { notificationService } from "../services/notificationService";
import { formatDateTime } from "../services/formatters";
import { toast } from "../utils/toast";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "deletion_requested", label: "Deletion requested" },
];


const emptyForm = {
  title: "",
  body: "",
  type: "custom",
  audience: "all",
};

const displayName = (user) => {
  const name = [user.firstname, user.lastname].filter(Boolean).join(" ").trim();
  return name || user.username || user.email;
};

const statusLabel = (status) =>
  STATUS_OPTIONS.find((option) => option.value === status)?.label || status;

const actionLabel = (action = "") =>
  String(action)
    .replace(/^notification\./, "")
    .replace(/_/g, " ");

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(74,44,31,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-brown)]">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState(["active"]);
  const [recipients, setRecipients] = useState([]);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  const onChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const needsUserPicker = form.audience === "one" || form.audience === "many";

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const response = await notificationService.getAnalytics({ days: 7 });
      setAnalytics(response.data?.data || null);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to load notification analytics.",
      );
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (!needsUserPicker) return;

    let cancelled = false;
    const loadRecipients = async () => {
      setLoadingRecipients(true);
      try {
        const response = await notificationService.getRecipients({
          page: 1,
          limit: 50,
          search: deferredSearch,
          status: statusFilter,
        });
        if (!cancelled) {
          setRecipients(response.data?.data || []);
          setRecipientTotal(response.data?.pagination?.total || 0);
        }
      } catch (err) {
        if (!cancelled) {
          setRecipients([]);
          setRecipientTotal(0);
          toast.error(
            err.response?.data?.message ||
              "Unable to load users. Check that the API is running.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingRecipients(false);
        }
      }
    };

    loadRecipients();
    return () => {
      cancelled = true;
    };
  }, [needsUserPicker, deferredSearch, statusFilter]);

  const selectedIds = useMemo(
    () => new Set(selectedUsers.map((user) => user.id)),
    [selectedUsers],
  );

  const overview = analytics?.overview || {
    appUsers: 0,
    pushReadyUsers: 0,
    usersWithoutPush: 0,
    coveragePercent: 0,
    sendsToday: 0,
    sendsInRange: 0,
    deliveredDevices: 0,
    failedDevices: 0,
  };

  const toggleUser = (user) => {
    setSelectedUsers((prev) => {
      if (prev.some((item) => item.id === user.id)) {
        return prev.filter((item) => item.id !== user.id);
      }
      if (form.audience === "one") {
        return [user];
      }
      return [...prev, user];
    });
  };

  const removeSelected = (userId) => {
    setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const toggleStatusTarget = (status) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((item) => item !== status);
      }
      return [...prev, status];
    });
  };

  const handleAudienceChange = (audience) => {
    onChange("audience", audience);
    setSelectedUsers([]);
    setSearch("");
    setStatusFilter("");
    if (audience === "status" && selectedStatuses.length === 0) {
      setSelectedStatuses(["active"]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLastResult(null);

    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and message are required.");
      return;
    }

    if (form.audience === "status" && selectedStatuses.length === 0) {
      toast.error("Select at least one status.");
      return;
    }

    if (needsUserPicker && selectedUsers.length === 0) {
      toast.error(
        form.audience === "one"
          ? "Select a user to send to."
          : "Select at least one user.",
      );
      return;
    }

    if (form.audience === "one" && selectedUsers.length !== 1) {
      toast.error("Select exactly one user.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        type: form.type || "custom",
        audience:
          form.audience === "all"
            ? "all"
            : form.audience === "status"
              ? "status"
              : "users",
        userIds: needsUserPicker
          ? selectedUsers.map((user) => user.id)
          : undefined,
        statuses: form.audience === "status" ? selectedStatuses : undefined,
      };

      const response = await notificationService.broadcast(payload);
      const result = response.data?.data;
      setLastResult(result || null);

      const targetLabel =
        form.audience === "all"
          ? "all users"
          : form.audience === "status"
            ? `status: ${selectedStatuses.map(statusLabel).join(", ")}`
            : form.audience === "one"
              ? displayName(selectedUsers[0])
              : `${selectedUsers.length} selected users`;

      toast.success(
        `Sent to ${targetLabel} · ${result?.successCount ?? 0} delivered` +
          (result?.failureCount ? `, ${result.failureCount} failed` : ""),
      );

      setForm((prev) => ({ ...emptyForm, audience: prev.audience }));
      if (form.audience === "all" || form.audience === "status") {
        setSelectedUsers([]);
      }
      loadAnalytics();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to send push notification.",
      );
    } finally {
      setBusy(false);
    }
  };

  const submitLabel =
    form.audience === "all"
      ? "Send to all users"
      : form.audience === "status"
        ? `Send to ${selectedStatuses.length || 0} status group(s)`
        : form.audience === "one"
          ? "Send to selected user"
          : `Send to ${selectedUsers.length || 0} users`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Engagement"
        title="Push notifications"
        description="Compose pushes, target by user or status, and track delivery coverage from one place."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="App users"
          value={loadingAnalytics ? "—" : overview.appUsers}
          hint={`${overview.coveragePercent}% push coverage`}
        />
        <StatCard
          icon={Smartphone}
          label="Push-ready devices"
          value={loadingAnalytics ? "—" : overview.pushReadyUsers}
          hint={`${overview.usersWithoutPush} users without a token`}
        />
        <StatCard
          icon={Send}
          label="Sends (7 days)"
          value={loadingAnalytics ? "—" : overview.sendsInRange}
          hint={`${overview.sendsToday} sent today`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Devices delivered"
          value={loadingAnalytics ? "—" : overview.deliveredDevices}
          hint={`${overview.failedDevices} failed in range`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.95fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <BellRing size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-brown)]">
                Compose notification
              </h2>
              <p className="text-sm text-slate-500">
                Keep titles short. Messages appear on both Android and iOS.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Audience
              </span>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { value: "all", label: "All users" },
                  { value: "one", label: "One user" },
                  { value: "many", label: "Selected users" },
                  { value: "status", label: "By status" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAudienceChange(option.value)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      form.audience === option.value
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-brown)]"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {form.audience === "status" ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  Send to every app user with these statuses
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => {
                    const checked = selectedStatuses.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleStatusTarget(option.value)}
                        className={`rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                          checked
                            ? "bg-[var(--color-accent)] text-white ring-[var(--color-accent)]"
                            : "bg-white text-slate-600 ring-slate-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {needsUserPicker ? (
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      {form.audience === "one"
                        ? "Find user"
                        : "Search and select users"}
                    </span>
                    <div className="relative">
                      <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by name, email, or username"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">
                      Status filter
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                    >
                      <option value="">All statuses</option>
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {selectedUsers.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                      >
                        {displayName(user)}
                        <button
                          type="button"
                          onClick={() => removeSelected(user.id)}
                          className="text-slate-400 hover:text-slate-700"
                          aria-label={`Remove ${displayName(user)}`}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                  {loadingRecipients ? (
                    <p className="px-4 py-3 text-sm text-slate-500">
                      Loading users...
                    </p>
                  ) : recipients.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-slate-500">
                      No users found
                      {statusFilter
                        ? ` with status "${statusLabel(statusFilter)}"`
                        : ""}
                      .
                    </p>
                  ) : (
                    recipients.map((user) => {
                      const checked = selectedIds.has(user.id);
                      return (
                        <label
                          key={user.id}
                          className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 hover:bg-slate-50"
                        >
                          <input
                            type={form.audience === "one" ? "radio" : "checkbox"}
                            name="notification-recipient"
                            checked={checked}
                            onChange={() => toggleUser(user)}
                            className="h-4 w-4"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-slate-800">
                              {displayName(user)}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              {user.email} · {statusLabel(user.status)}
                            </span>
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                              user.hasPushToken
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {user.hasPushToken ? "Push ready" : "No token"}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                {!loadingRecipients ? (
                  <p className="text-xs text-slate-500">
                    Showing {recipients.length} of {recipientTotal} users
                  </p>
                ) : null}
              </div>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Title
              </span>
              <input
                value={form.title}
                onChange={(event) => onChange("title", event.target.value)}
                maxLength={120}
                placeholder="DAF Announcement"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Message
              </span>
              <textarea
                value={form.body}
                onChange={(event) => onChange("body", event.target.value)}
                maxLength={500}
                rows={5}
                placeholder="Share an update with everyone using the app."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Type
              </span>
              <select
                value={form.type}
                onChange={(event) => onChange("type", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="custom">Custom</option>
                <option value="announcement">Announcement</option>
                <option value="reminder">Reminder</option>
              </select>
            </label>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Send size={16} />
                {busy ? "Sending..." : submitLabel}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-brown)]">
                  Recent sends
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Latest admin push activity from the last week.
                </p>
              </div>
              <button
                type="button"
                onClick={loadAnalytics}
                className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {loadingAnalytics ? (
                <p className="text-sm text-slate-500">Loading analytics...</p>
              ) : analytics?.recent?.length ? (
                analytics.recent.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {entry.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {actionLabel(entry.action)} ·{" "}
                          {entry.actorName || "System"} ·{" "}
                          {formatDateTime(entry.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-xs">
                        <p className="inline-flex items-center gap-1 font-medium text-emerald-700">
                          <CheckCircle2 size={12} />
                          {entry.metadata?.successCount ?? 0}
                        </p>
                        <p className="mt-1 inline-flex items-center gap-1 font-medium text-rose-600">
                          <XCircle size={12} />
                          {entry.metadata?.failureCount ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No notification sends logged yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
            <h3 className="text-base font-semibold text-[var(--color-brown)]">
              Audience mix (7 days)
            </h3>
            <div className="mt-4 space-y-2">
              {(analytics?.audienceBreakdown || []).length ? (
                analytics.audienceBreakdown.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                  >
                    <span className="capitalize text-slate-600">
                      {String(item.label).replace(/_/g, " ")}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No audience data yet.</p>
              )}
            </div>
          </div>

          {lastResult ? (
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              <h3 className="text-base font-semibold text-[var(--color-brown)]">
                Last send result
              </h3>
              <dl className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt>Users targeted</dt>
                  <dd className="font-medium text-slate-900">
                    {lastResult.recipientUserCount ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Devices targeted</dt>
                  <dd className="font-medium text-slate-900">
                    {lastResult.recipientTokenCount ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Delivered</dt>
                  <dd className="font-medium text-emerald-700">
                    {lastResult.successCount ?? 0}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Failed</dt>
                  <dd className="font-medium text-rose-700">
                    {lastResult.failureCount ?? 0}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
