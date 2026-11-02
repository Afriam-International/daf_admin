import { X } from "lucide-react";

export default function ModalFrame({
  open,
  title,
  subtitle,
  onClose,
  children,
  wide = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <div
        className={`relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_60px_rgba(74,44,31,0.16)] ${
          wide ? "max-w-4xl" : "max-w-2xl"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Compose
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[var(--color-brown)]">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
