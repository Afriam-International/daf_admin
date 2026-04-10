export default function PageLoader({ label = "Loading..." }) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/90 px-6 py-12 text-center shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--color-accent)]" />
      <p className="mt-4 text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}
