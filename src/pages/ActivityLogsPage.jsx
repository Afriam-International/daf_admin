import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import { userService } from "../services/userService";
import { formatDateTime } from "../services/formatters";

const dayOptions = [
  { label: "All Time", value: "" },
  { label: "Last 7 Days", value: "7" },
  { label: "Last 14 Days", value: "14" },
  { label: "Last 30 Days", value: "30" },
  { label: "Last 90 Days", value: "90" },
];

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");
  const [days, setDays] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await userService.getActivityLogs({ page: 1, limit: 100, days });
        setLogs(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load activity logs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [days]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit Trail"
        title="Activity log"
        description="A running record of important admin and account actions across the dashboard."
        actions={
          <select value={days} onChange={(event) => setDays(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
            {dayOptions.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        }
      />

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <PageLoader label="Loading activity log..." />
      ) : (
      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <div className="space-y-4">
          {logs.length ? (
            logs.map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{log.description}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{log.action.replaceAll(".", " ")}</p>
                  </div>
                  <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                </div>
                {log.actorName ? <p className="mt-3 text-sm text-slate-600">By {log.actorName} ({log.actorRole})</p> : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No activity has been recorded for this period.</p>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
