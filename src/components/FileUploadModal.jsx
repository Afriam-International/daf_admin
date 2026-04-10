import { ImagePlus, UploadCloud, X } from "lucide-react";

export default function FileUploadModal({
  open,
  title,
  description,
  fileLabel = "Select file",
  accept = "*",
  progress = 0,
  busy = false,
  previewUrl = "",
  selectedFileName = "",
  onClose,
  onFileChange,
  onClearSelection,
  onSubmit,
  submitLabel = "Upload",
  disableSubmit = false,
}) {
  if (!open) return null;

  const hasPreview = Boolean(previewUrl);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-brown)]">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Close
          </button>
        </div>

        {hasPreview ? (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
            <div className="relative">
              <img src={previewUrl} alt={selectedFileName || "Selected preview"} className="h-64 w-full object-cover" />
              <button
                type="button"
                onClick={onClearSelection}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{selectedFileName || "Selected image"}</p>
                <p className="mt-1 text-xs text-slate-500">Remove it if you want to choose a different image.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                <ImagePlus className="h-4 w-4 text-[var(--color-accent)]" />
                Change
                <input type="file" accept={accept} onChange={onFileChange} className="hidden" />
              </label>
            </div>
          </div>
        ) : (
          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-accent)]/5">
            <UploadCloud className="h-10 w-10 text-[var(--color-accent)]" />
            <p className="mt-4 text-sm font-semibold text-slate-800">{fileLabel}</p>
            <p className="mt-1 text-xs text-slate-500">Click to browse and upload</p>
            <input type="file" accept={accept} onChange={onFileChange} className="hidden" />
          </label>
        )}

        {busy ? (
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Uploading</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="mt-2 h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${Math.max(progress, 6)}%` }} />
            </div>
          </div>
        ) : null}

        {onSubmit ? (
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              Cancel
            </button>
            <button
              type="button"
              disabled={busy || disableSubmit}
              onClick={onSubmit}
              className="rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? "Uploading..." : submitLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
