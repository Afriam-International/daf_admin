import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#C47A4A", "#4A2C1F", "#8B5E3C", "#D4A574", "#6B7280", "#059669", "#DC2626"];

export function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)] ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[var(--color-brown)]">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="h-64 w-full">{children}</div>
    </div>
  );
}

export function BreakdownBarChart({ data = [], dataKey = "value", nameKey = "label" }) {
  const rows = (data || []).map((item) => ({
    ...item,
    [nameKey]: String(item[nameKey] || "unknown").replace(/_/g, " "),
  }));

  if (!rows.length) {
    return <p className="flex h-full items-center justify-center text-sm text-slate-500">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={dataKey} radius={[10, 10, 0, 0]} fill="#C47A4A" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TrendAreaChart({ data = [], dataKey = "value", nameKey = "label" }) {
  const rows = data || [];
  if (!rows.length) {
    return <p className="flex h-full items-center justify-center text-sm text-slate-500">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="dafTrend" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C47A4A" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#C47A4A" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="#C47A4A"
          fill="url(#dafTrend)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SharePieChart({ data = [], dataKey = "value", nameKey = "label" }) {
  const rows = (data || []).map((item) => ({
    ...item,
    [nameKey]: String(item[nameKey] || "unknown").replace(/_/g, " "),
  }));

  if (!rows.length) {
    return <p className="flex h-full items-center justify-center text-sm text-slate-500">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={rows}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
        >
          {rows.map((entry, index) => (
            <Cell key={`${entry[nameKey]}-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
