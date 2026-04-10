import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import { analyticsService } from "../services/analyticsService";

const palette = ["#2DAABF", "#4A2C1F", "#E8A87C", "#7A9E9F", "#C97C5D"];

function PieChart({ items }) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let current = 0;

  const slices = items.map((item, index) => {
    const startAngle = (current / total) * Math.PI * 2;
    current += item.value;
    const endAngle = (current / total) * Math.PI * 2;
    const x1 = 50 + 42 * Math.cos(startAngle - Math.PI / 2);
    const y1 = 50 + 42 * Math.sin(startAngle - Math.PI / 2);
    const x2 = 50 + 42 * Math.cos(endAngle - Math.PI / 2);
    const y2 = 50 + 42 * Math.sin(endAngle - Math.PI / 2);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return (
      <path
        key={item.label}
        d={`M 50 50 L ${x1} ${y1} A 42 42 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={palette[index % palette.length]}
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className="h-56 w-56">
      {slices}
      <circle cx="50" cy="50" r="20" fill="white" />
    </svg>
  );
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ roleBreakdown: [], statusBreakdown: [], monthlyUsers: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await analyticsService.getUserStats();
        setStats(response.data.data || { roleBreakdown: [], statusBreakdown: [], monthlyUsers: [] });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load analytics");
      }
    };

    load();
  }, []);

  const maxMonthly = Math.max(...stats.monthlyUsers.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Analytics" title="Performance analytics" description="A clearer view of account growth, role mix, and user status trends." />

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-brown)]">User growth</h2>
            <p className="mt-1 text-sm text-slate-500">New registrations over the last six months.</p>
          </div>

          <div className="mt-8 flex h-72 items-end gap-4">
            {stats.monthlyUsers.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex h-56 w-full items-end rounded-[24px] bg-slate-100 p-3">
                  <div className="w-full rounded-[18px] bg-[linear-gradient(180deg,var(--color-accent),#1e8ea5)]" style={{ height: `${Math.max((item.value / maxMonthly) * 100, 8)}%` }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">Role distribution</h2>
          <div className="mt-6 flex flex-col items-center gap-6">
            <PieChart items={stats.roleBreakdown} />
            <div className="grid w-full gap-3">
              {stats.roleBreakdown.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                    <span className="text-sm font-medium capitalize text-slate-700">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">Status distribution</h2>
          <div className="mt-6 flex flex-col items-center gap-6">
            <PieChart items={stats.statusBreakdown} />
            <div className="grid w-full gap-3">
              {stats.statusBreakdown.map((item, index) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: palette[index % palette.length] }} />
                    <span className="text-sm font-medium capitalize text-slate-700">{String(item.label || "").replaceAll("_", " ")}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">Breakdown bars</h2>
          <div className="mt-6 grid gap-4">
            {[...stats.roleBreakdown, ...stats.statusBreakdown].map((item, index) => (
              <div key={`${item.label}-${index}`}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="capitalize text-slate-700">{String(item.label || "").replaceAll("_", " ")}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full" style={{ width: `${Math.max(item.value * 16, 12)}px`, backgroundColor: palette[index % palette.length] }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
