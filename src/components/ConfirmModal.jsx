export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  busy = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const confirmClasses =
    tone === "danger"
      ? "bg-rose-600 text-white"
      : "bg-[var(--color-teal)] text-white";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <h3 className="text-xl font-semibold text-[var(--color-brown)]">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold ${confirmClasses} disabled:opacity-60`}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
