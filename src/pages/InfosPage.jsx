import { useEffect, useMemo, useState } from "react";
import { Eye, FileText, ImagePlus, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import PageLoader from "../components/PageLoader";
import RichTextEditor from "../components/RichTextEditor";
import { getInfoIcon } from "../constants/infoIcons";
import { formatDateTime } from "../services/formatters";
import { infoService } from "../services/infoService";

const emptyForm = {
  title: "",
  description: "",
  images: [],
  retainedImages: [],
};

const stripHtml = (html = "") => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.replace(/\s+/g, " ").trim() || "";
};

const truncateText = (text = "", max = 180) => {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}...`;
};

function ImageUploadField({
  newImages,
  retainedImages,
  onNewImagesChange,
  onRetainedImagesChange,
}) {
  const newPreviews = useMemo(
    () =>
      newImages.map((file) => ({
        key: `new-${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: "new",
      })),
    [newImages],
  );

  const retainedPreviews = useMemo(
    () =>
      retainedImages.map((image, index) => ({
        key: `kept-${image.url}-${index}`,
        name: `Image ${index + 1}`,
        url: image.url,
        type: "retained",
        image,
      })),
    [retainedImages],
  );

  const allPreviews = [...retainedPreviews, ...newPreviews];

  useEffect(
    () => () => {
      newPreviews.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [newPreviews],
  );

  const removeNewImage = (key) => {
    onNewImagesChange(
      newImages.filter(
        (file) => `new-${file.name}-${file.size}-${file.lastModified}` !== key,
      ),
    );
  };

  const removeRetainedImage = (key) => {
    onRetainedImagesChange(
      retainedImages.filter(
        (image, index) => `kept-${image.url}-${index}` !== key,
      ),
    );
  };

  const addImages = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    onNewImagesChange([...newImages, ...incoming]);
  };

  return (
    <div className="space-y-4">
      <span className="block text-sm font-medium text-slate-700">
        Images <span className="font-normal text-slate-400">(optional)</span>
      </span>

      {allPreviews.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {allPreviews.map((item) => (
            <div
              key={item.key}
              className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50"
            >
              <img src={item.url} alt={item.name} className="h-52 w-full object-cover" />
              <button
                type="button"
                onClick={() =>
                  item.type === "new"
                    ? removeNewImage(item.key)
                    : removeRetainedImage(item.key)
                }
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    item.type === "new"
                      ? "bg-(--color-accent)/10 text-(--color-accent)"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {item.type === "new" ? "New" : "Saved"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <label className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-(--color-accent)/40 hover:bg-(--color-accent)/5">
        <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-white text-(--color-accent) shadow-sm">
          <ImagePlus className="h-7 w-7" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-800">
            {allPreviews.length ? "Add more images" : "Upload images"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            PNG or JPG. You can select multiple files at once.
          </p>
        </div>
        <span className="rounded-2xl bg-white px-5 py-2.5 text-sm font-semibold text-(--color-accent) shadow-sm">
          Browse files
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            addImages(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
    </div>
  );
}

function InfoViewModal({ info, onClose }) {
  if (!info) return null;

  const Icon = getInfoIcon(info.icon);
  const plainDescription = stripHtml(info.description);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-(--color-accent)/10 text-(--color-accent)">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-(--color-brown)">{info.title}</h3>
              <p className="mt-2 text-sm text-slate-500">
                Updated {formatDateTime(info.updatedAt)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Description
          </p>
          <div
            className="info-rich-content max-h-[480px] overflow-y-auto text-sm text-slate-700"
            dangerouslySetInnerHTML={{
              __html: info.description || `<p>${plainDescription || "No description added."}</p>`,
            }}
          />
        </div>

        {info.images?.length ? (
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Images
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {info.images.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="overflow-hidden rounded-2xl border border-slate-200"
                >
                  <img
                    src={image.url}
                    alt={`${info.title} ${index + 1}`}
                    className="h-56 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoFormModal({
  open,
  title,
  form,
  busy,
  editingInfo,
  onClose,
  onChange,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose?.();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold text-(--color-brown)">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create or update information shown in the mobile app Info page. Icons are assigned
              automatically based on the title.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Title</span>
            <input
              value={form.title}
              onChange={(event) => onChange("title", event.target.value)}
              placeholder="Citizenship and Documentation"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </label>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Description</span>
            <RichTextEditor
              value={form.description}
              onChange={(value) => onChange("description", value)}
              placeholder="Write the information users will see in the app. You can add links, lists, and contact details."
              minHeight={360}
            />
          </div>

          <ImageUploadField
            newImages={form.images}
            retainedImages={form.retainedImages}
            onNewImagesChange={(images) => onChange("images", images)}
            onRetainedImagesChange={(retainedImages) =>
              onChange("retainedImages", retainedImages)
            }
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-2xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving..." : editingInfo ? "Update Info" : "Create Info"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InfosPage() {
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewInfo, setViewInfo] = useState(null);
  const [editingInfo, setEditingInfo] = useState(null);
  const [infoToDelete, setInfoToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadInfos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await infoService.getInfos();
      setInfos(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load infos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInfos();
  }, []);

  const filteredInfos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return infos;

    return infos.filter((info) => {
      const plainDescription = stripHtml(info.description);
      return [info.title, plainDescription].some((value) =>
        String(value || "").toLowerCase().includes(query),
      );
    });
  }, [infos, search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingInfo(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setError("");
    setSuccess("");
    setEditingInfo(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (info) => {
    setError("");
    setSuccess("");
    setEditingInfo(info);
    setForm({
      title: info.title || "",
      description: info.description || "",
      images: [],
      retainedImages: info.images || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: form.title,
        description: form.description,
        images: form.images,
        ...(editingInfo ? { retainedImages: form.retainedImages } : {}),
      };

      if (editingInfo) {
        await infoService.updateInfo(editingInfo.id, payload);
        setSuccess("Info updated successfully.");
      } else {
        await infoService.createInfo(payload);
        setSuccess("Info created successfully.");
      }
      await loadInfos();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save info");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!infoToDelete) return;
    setDeletingId(infoToDelete.id);
    setError("");
    setSuccess("");

    try {
      await infoService.deleteInfo(infoToDelete.id);
      setSuccess("Info deleted successfully.");
      setInfoToDelete(null);
      await loadInfos();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete info");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resources"
        title="Info"
        description="Manage dynamic information content shown in the DAF mobile app Info page."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(45,170,191,0.24)]"
          >
            <Plus className="h-4 w-4" />
            New Info
          </button>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Search Info</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or description"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
      </section>

      {error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {loading ? (
        <PageLoader label="Loading info..." />
      ) : filteredInfos.length ? (
        <div className="grid gap-4">
          {filteredInfos.map((info) => {
            const plainDescription = stripHtml(info.description);
            const Icon = getInfoIcon(info.icon);

            return (
              <article
                key={info.id}
                className="cursor-pointer rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)] transition hover:border-(--color-accent)/20"
                onClick={() => setViewInfo(info)}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-(--color-accent)/10 text-(--color-accent)">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-(--color-accent)/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
                        <FileText className="h-3.5 w-3.5" />
                        Info
                      </div>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-(--color-brown)">
                      {info.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                      {truncateText(plainDescription) || "No description added yet."}
                    </p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      Updated {formatDateTime(info.updatedAt)}
                      {info.images?.length
                        ? ` • ${info.images.length} image${info.images.length === 1 ? "" : "s"}`
                        : ""}
                    </p>
                  </div>

                  <div
                    className="flex shrink-0 items-center gap-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setViewInfo(info)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(info)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setInfoToDelete(info)}
                      className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-[0_24px_60px_rgba(74,44,31,0.04)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
            <FileText className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-(--color-brown)">No info entries found</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add your first info entry to populate the mobile app Info page.
          </p>
        </div>
      )}

      <InfoFormModal
        open={isModalOpen}
        title={editingInfo ? "Edit Info" : "Create Info"}
        form={form}
        busy={saving}
        editingInfo={editingInfo}
        onClose={resetForm}
        onChange={(key, value) =>
          setForm((current) => ({
            ...current,
            [key]: value,
          }))
        }
        onSubmit={handleSubmit}
      />

      <InfoViewModal info={viewInfo} onClose={() => setViewInfo(null)} />

      <ConfirmModal
        open={Boolean(infoToDelete)}
        title="Delete Info"
        message={`This will remove "${infoToDelete?.title || "this entry"}" from the admin dashboard and the mobile app.`}
        confirmLabel={deletingId ? "Deleting..." : "Delete Info"}
        busy={Boolean(deletingId)}
        onClose={() => {
          if (!deletingId) setInfoToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
