import { useEffect, useMemo, useState } from "react";
import { HelpCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ConfirmModal from "../components/ConfirmModal";
import PageLoader from "../components/PageLoader";
import { faqService } from "../services/faqService";
import { formatDateTime } from "../services/formatters";

const emptyForm = {
  question: "",
  answer: "",
};

function FaqFormModal({
  open,
  title,
  form,
  busy,
  editingFaq,
  onClose,
  onChange,
  onSubmit,
}) {
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
            <h3 className="text-xl font-semibold text-[var(--color-brown)]">
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Add or update the question and answer shown in the mobile app FAQ
              page.
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
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Question
            </span>
            <input
              value={form.question}
              onChange={(event) => onChange("question", event.target.value)}
              placeholder="What is the Diaspora African Forum (DAF)?"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Answer
            </span>
            <textarea
              value={form.answer}
              onChange={(event) => onChange("answer", event.target.value)}
              rows="8"
              placeholder="Write the answer exactly how you want it to appear in the app."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none"
            />
          </label>

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
              className="rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {busy ? "Saving..." : editingFaq ? "Update FAQ" : "Create FAQ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FaqsPage() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqToDelete, setFaqToDelete] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadFaqs = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await faqService.getFaqs();
      setFaqs(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return faqs;

    return faqs.filter((faq) =>
      [faq.question, faq.answer].some((value) =>
        String(value || "").toLowerCase().includes(query),
      ),
    );
  }, [faqs, search]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingFaq(null);
    setIsModalOpen(false);
  };

  const openCreateModal = () => {
    setSuccess("");
    setError("");
    setEditingFaq(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setSuccess("");
    setError("");
    setEditingFaq(faq);
    setForm({
      question: faq.question || "",
      answer: faq.answer || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingFaq) {
        await faqService.updateFaq(editingFaq.id, form);
        setSuccess("FAQ updated successfully.");
      } else {
        await faqService.createFaq(form);
        setSuccess("FAQ created successfully.");
      }

      await loadFaqs();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;

    setDeletingId(faqToDelete.id);
    setError("");
    setSuccess("");

    try {
      await faqService.deleteFaq(faqToDelete.id);
      setSuccess("FAQ deleted successfully.");
      setFaqToDelete(null);
      await loadFaqs();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete FAQ");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resources"
        title="FAQs"
        description="Manage the question and answer pairs shown in the DAF mobile app."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(45,170,191,0.24)]"
          >
            <Plus className="h-4 w-4" />
            New FAQ
          </button>
        }
      />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Search FAQs
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by question or answer"
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
        <PageLoader label="Loading FAQs..." />
      ) : filteredFaqs.length ? (
        <div className="grid gap-4">
          {filteredFaqs.map((faq) => (
            <article
              key={faq.id}
              className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    <HelpCircle className="h-4 w-4" />
                    FAQ
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-[var(--color-brown)]">
                    {faq.question}
                  </h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </p>
                  <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                    Updated {formatDateTime(faq.updatedAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(faq)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setFaqToDelete(faq)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-[0_24px_60px_rgba(74,44,31,0.04)]">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-[var(--color-brown)]">
            No FAQs found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Add your first FAQ to start populating the mobile app.
          </p>
        </div>
      )}

      <FaqFormModal
        open={isModalOpen}
        title={editingFaq ? "Edit FAQ" : "Create FAQ"}
        form={form}
        busy={saving}
        editingFaq={editingFaq}
        onClose={resetForm}
        onChange={(key, value) =>
          setForm((current) => ({
            ...current,
            [key]: value,
          }))
        }
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={Boolean(faqToDelete)}
        title="Delete FAQ"
        message={`This will remove "${faqToDelete?.question || "this FAQ"}" from the admin dashboard and the mobile app.`}
        confirmLabel={deletingId ? "Deleting..." : "Delete FAQ"}
        busy={Boolean(deletingId)}
        onClose={() => {
          if (!deletingId) setFaqToDelete(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
