import { TrendingDown, TrendingUp } from "lucide-react";

const accents = {
  teal: {
    shell: "from-[#e5f7fa] via-white to-[#f3fbfd]",
    icon: "bg-[var(--color-teal)] text-white",
  },
  brown: {
    shell: "from-[#f7efe9] via-white to-[#fffaf7]",
    icon: "bg-[var(--color-brown)] text-white",
  },
  accent: {
    shell: "from-[#f5ebff] via-white to-[#fcf8ff]",
    icon: "bg-[var(--color-accent)] text-white",
  },
  sand: {
    shell: "from-[#f8f4ef] via-white to-[#f9f7f3]",
    icon: "bg-slate-900 text-white",
  },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  helper,
  accent = "teal",
}) {
  const palette = accents[accent] || accents.teal;

  return (
    <div
      className={`rounded-[28px] border border-white/70 bg-gradient-to-br ${palette.shell} p-5 shadow-[0_24px_60px_rgba(74,44,31,0.08)]`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${palette.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          {typeof trend === "number" ? (
            <>
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-rose-600" />
              )}
              <span className={trend >= 0 ? "text-emerald-700" : "text-rose-700"}>
                {Math.abs(trend)}%
              </span>
            </>
          ) : (
            <span className="text-slate-400">No trend yet</span>
          )}
        </div>
        <p className="text-xs text-slate-500">{helper}</p>
      </div>
    </div>
  );
}
