import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export default function SendProgressPanel({
  title = "Sending…",
  total = 0,
  sent = 0,
  failed = 0,
  pending = 0,
  done = false,
}) {
  const safeTotal = Math.max(Number(total) || 0, 0);
  const safeSent = Math.max(Number(sent) || 0, 0);
  const safeFailed = Math.max(Number(failed) || 0, 0);
  const safePending =
    pending != null
      ? Math.max(Number(pending) || 0, 0)
      : Math.max(safeTotal - safeSent - safeFailed, 0);
  const completed = safeSent + safeFailed;
  const percent = safeTotal ? Math.min(100, Math.round((completed / safeTotal) * 100)) : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--color-brown)]">
          {done ? "Send complete" : title}
        </p>
        <p className="text-xs font-medium text-slate-500">
          {completed}/{safeTotal || "—"} · {percent}%
        </p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
          <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            <CheckCircle2 size={12} /> Sent
          </p>
          <p className="mt-1 text-xl font-semibold text-emerald-800">{safeSent}</p>
        </div>
        <div className="rounded-xl bg-rose-50 px-3 py-2 text-center">
          <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
            <XCircle size={12} /> Failed
          </p>
          <p className="mt-1 text-xl font-semibold text-rose-800">{safeFailed}</p>
        </div>
        <div className="rounded-xl bg-amber-50 px-3 py-2 text-center">
          <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
            <Clock3 size={12} /> Pending
          </p>
          <p className="mt-1 text-xl font-semibold text-amber-800">{safePending}</p>
        </div>
      </div>
    </div>
  );
}
