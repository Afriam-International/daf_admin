import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  ExternalLink,
  Facebook,
  ImagePlus,
  Instagram,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import PageLoader from "../components/PageLoader";
import { feedService } from "../services/feedService";
import { formatDateTime } from "../services/formatters";

const feedTypeOptions = [
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
];

const filterOptions = [
  { label: "All Posts", value: "all" },
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
];

const emptyForm = {
  type: "facebook",
  title: "",
  body: "",
  postUrl: "",
  image: null,
};

const getTypeMeta = (type) => {
  if (type === "instagram") {
    return {
      label: "Instagram",
      icon: Instagram,
      badge: "bg-rose-100 text-rose-700",
      button: "Open Instagram Post",
    };
  }

  return {
    label: "Facebook",
    icon: Facebook,
    badge: "bg-blue-100 text-blue-700",
    button: "Open Facebook Post",
  };
};

function FeedFormModal({ open, title, form, busy, editingFeed, onClose, onChange, onSubmit }) {
  const [hideExistingImage, setHideExistingImage] = useState(false);
  const previewUrl = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    return "";
  }, [form.image]);

  useEffect(() => {
    setHideExistingImage(false);
  }, [open, editingFeed?.id]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose?.();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[32px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-[var(--color-brown)]">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">Create or update a social feed card that links directly to the original post.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Feed Type</span>
              <select
                value={form.type}
                onChange={(event) => onChange("type", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                {feedTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Post Title</span>
              <input
                value={form.title}
                onChange={(event) => onChange("title", event.target.value)}
                placeholder="DAF community spotlight"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Post URL</span>
              <input
                value={form.postUrl}
                onChange={(event) => onChange("postUrl", event.target.value)}
                placeholder={form.type === "instagram" ? "https://instagram.com/..." : "https://facebook.com/..."}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Feature Image</span>
              {previewUrl || (editingFeed?.imageUrl && !form.image && !hideExistingImage) ? (
                <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
                  <div className="relative">
                    <img
                      src={previewUrl || editingFeed?.imageUrl}
                      alt={form.title || editingFeed?.title || "Selected preview"}
                      className="h-56 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onChange("image", null);
                        if (!previewUrl) setHideExistingImage(true);
                      }}
                      className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/35 text-white backdrop-blur"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-4 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{form.image?.name || "Current image"}</p>
                      <p className="mt-1 text-xs text-slate-500">Remove it if you want to choose a different image.</p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      <ImagePlus className="h-4 w-4 text-[var(--color-teal)]" />
                      Change
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => onChange("image", event.target.files?.[0] || null)} />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 transition hover:border-[var(--color-teal)]/40 hover:bg-[var(--color-teal)]/5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[var(--color-teal)] shadow-sm">
                      <ImagePlus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Upload cover image</p>
                      <p className="mt-1 text-xs text-slate-500">PNG or JPG works best.</p>
                    </div>
                  </div>
                  <span className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-[var(--color-teal)]">Browse</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => onChange("image", event.target.files?.[0] || null)} />
                </label>
              )}
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Post Body</span>
              <textarea
                value={form.body}
                onChange={(event) => onChange("body", event.target.value)}
                rows="7"
                placeholder="Write the summary or full post copy you want the app to display before people open the original social post."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="rounded-2xl bg-[var(--color-teal)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Saving..." : editingFeed ? "Update post" : "Create post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeedViewModal({ feed, onClose }) {
  if (!feed) return null;

  const meta = getTypeMeta(feed.type);
  const TypeIcon = meta.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[34px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.2)]">
        <div className="grid min-h-[560px] lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative flex min-h-[280px] items-end overflow-hidden bg-[linear-gradient(160deg,#4A2C1F_0%,#2DAABF_100%)]">
            {feed.imageUrl ? (
              <img src={feed.imageUrl} alt={feed.title} className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/10 to-transparent" />
            <div className="relative z-10 flex w-full items-start justify-between gap-3 p-6">
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${meta.badge}`}>
                <TypeIcon className="h-4 w-4" />
                {meta.label}
              </div>
              <button type="button" onClick={onClose} className="rounded-2xl border border-white/30 bg-black/20 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                Close
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-col p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4" />
                {formatDateTime(feed.createdAt)}
              </span>
            </div>

            <div className="mt-5">
              <h3 className="text-3xl font-semibold tracking-tight text-[var(--color-brown)]">{feed.title}</h3>
            </div>

            <div className="mt-6 rounded-[26px] border border-slate-100 bg-slate-50 p-5">
              <p className="max-h-[300px] overflow-y-auto whitespace-pre-wrap pr-2 text-sm leading-7 text-slate-700">
                {feed.body || "No body content was added for this post."}
              </p>
            </div>

            <div className="mt-6 rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Source link</p>
              <p className="mt-2 break-all text-sm text-slate-600">{feed.postUrl}</p>
            </div>

            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <a
                href={feed.postUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-teal)] px-5 py-3 text-sm font-semibold text-white"
              >
                {meta.button}
                <ExternalLink className="h-4 w-4" />
              </a>
              <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialFeedPage() {
  const [feeds, setFeeds] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingFeed, setEditingFeed] = useState(null);
  const [viewFeed, setViewFeed] = useState(null);
  const [targetFeed, setTargetFeed] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const deferredSearch = useDeferredValue(search);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const response = await feedService.getFeeds();
      setFeeds(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load feed posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  const filteredFeeds = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return feeds.filter((feed) => {
      const title = feed.title?.toLowerCase() || "";
      const body = feed.body?.toLowerCase() || "";
      const type = feed.type?.toLowerCase() || "";
      const matchesSearch = !query || title.includes(query) || body.includes(query) || type.includes(query);
      const matchesFilter = activeFilter === "all" || type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [feeds, deferredSearch, activeFilter]);

  const closeComposer = () => {
    if (busy) return;
    setComposerOpen(false);
    setEditingFeed(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setEditingFeed(null);
    setForm(emptyForm);
    setComposerOpen(true);
  };

  const openEditModal = (feed) => {
    setEditingFeed(feed);
    setForm({
      type: feed.type || "facebook",
      title: feed.title || "",
      body: feed.body || "",
      postUrl: feed.postUrl || "",
      image: null,
    });
    setComposerOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        type: form.type,
        title: form.title,
        body: form.body,
        postUrl: form.postUrl,
        image: form.image,
      };

      if (editingFeed) {
        await feedService.updateFeed(editingFeed.id, payload);
        setSuccess("Feed post updated successfully.");
      } else {
        await feedService.createFeed(payload);
        setSuccess("Feed post created successfully.");
      }

      closeComposer();
      await loadFeeds();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save feed post");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!targetFeed) return;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await feedService.deleteFeed(targetFeed.id);
      setTargetFeed(null);
      setSuccess("Feed post deleted successfully.");
      await loadFeeds();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete feed post");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Social Feed"
        title="Social feed posts"
        description="Create curated Facebook and Instagram posts that the mobile app can render directly from the DAF backend."
        actions={
          <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-teal)] px-4 py-3 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" />
            New Feed Post
          </button>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <div className="flex flex-wrap gap-3">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setActiveFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === option.value
                  ? "bg-[var(--color-teal)] text-white shadow-[0_16px_40px_rgba(45,170,191,0.25)]"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Search Feed</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, body, or feed type"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
      </section>

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}
      {success ? <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">{success}</div> : null}

      {loading ? (
        <PageLoader label="Loading social feed posts..." />
      ) : filteredFeeds.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredFeeds.map((feed) => {
            const meta = getTypeMeta(feed.type);
            const TypeIcon = meta.icon;

            return (
              <article key={feed.id} className="overflow-hidden rounded-[30px] border border-white/70 bg-white/95 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
                <div className="flex h-full flex-col">
                  <div className="relative h-60 overflow-hidden bg-[linear-gradient(150deg,#4A2C1F_0%,#2DAABF_100%)]">
                    {feed.imageUrl ? <img src={feed.imageUrl} alt={feed.title} className="h-full w-full object-cover" /> : null}
                    <div className="absolute left-4 top-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${meta.badge}`}>
                        <TypeIcon className="h-4 w-4" />
                        {meta.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold text-[var(--color-brown)]">{feed.title}</h3>
                        <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays className="h-4 w-4" />
                          {formatDateTime(feed.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 line-clamp-4 text-sm leading-7 text-slate-600">{feed.body || "No body content available for this feed post."}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setViewFeed(feed)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      <button type="button" onClick={() => openEditModal(feed)} className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-teal)]/20 px-4 py-2 text-sm font-medium text-[var(--color-teal)]">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <a href={feed.postUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                        <ExternalLink className="h-4 w-4" />
                        Open
                      </a>
                      <button type="button" onClick={() => setTargetFeed(feed)} className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-700">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-[0_24px_60px_rgba(74,44,31,0.04)]">
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">No social feed posts found</h2>
          <p className="mt-2 text-sm text-slate-500">Try a different search or filter, or create a new Facebook or Instagram post entry.</p>
        </div>
      )}

      <FeedFormModal
        open={composerOpen}
        title={editingFeed ? "Edit feed post" : "Create feed post"}
        form={form}
        busy={busy}
        editingFeed={editingFeed}
        onClose={closeComposer}
        onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
        onSubmit={handleSubmit}
      />

      <FeedViewModal feed={viewFeed} onClose={() => setViewFeed(null)} />

      <ConfirmModal
        open={Boolean(targetFeed)}
        title="Delete feed post"
        message={targetFeed ? `Delete "${targetFeed.title}"? Its image will also be removed.` : ""}
        confirmLabel="Delete Post"
        tone="danger"
        busy={busy}
        onClose={() => setTargetFeed(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
