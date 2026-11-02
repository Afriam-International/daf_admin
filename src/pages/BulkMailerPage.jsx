import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Mail,
  Send,
  XCircle,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import ModalFrame from "../components/ModalFrame";
import SendProgressPanel from "../components/SendProgressPanel";
import {
  BreakdownBarChart,
  ChartCard,
  SharePieChart,
} from "../components/MetricCharts";
import { mailerService } from "../services/mailerService";
import { formatDateTime } from "../services/formatters";
import { toast } from "../utils/toast";

const emptyForm = {
  subject: "",
  fromName: "Diaspora African Forum",
  recipients: "",
  message: "",
  isHtml: false,
  csvFile: null,
};

const CHUNK = 10;

const parseRecipientEmails = (text = "") =>
  String(text)
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^(?:(.+?)\s*[<\(])?([^\s<>()]+@[^\s<>()]+)(?:[>\)])?$/);
      if (match) {
        return {
          email: match[2].trim().toLowerCase(),
          firstname: match[1] ? match[1].replace(/["']/g, "").trim() : null,
        };
      }
      return { email: part.toLowerCase(), firstname: null };
    })
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email));

export default function BulkMailerPage() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [history, setHistory] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    done: false,
  });
  const [lastResult, setLastResult] = useState(null);

  const recipientPreviewCount = useMemo(() => {
    return parseRecipientEmails(form.recipients).length + (form.csvFile ? 1 : 0);
  }, [form.recipients, form.csvFile]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    try {
      const response = await mailerService.getStatus();
      setStatus(response.data.data);
    } catch (error) {
      setStatus({
        configured: false,
        message:
          error.response?.data?.message ||
          "Unable to check mailer configuration.",
      });
    } finally {
      setLoadingStatus(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await mailerService.getHistory({ days: 30 });
      setHistory(response.data?.data || null);
    } catch {
      setHistory(null);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadStatus();
    loadHistory();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeCompose = () => {
    if (sending) return;
    setComposeOpen(false);
    setProgress({ total: 0, sent: 0, failed: 0, pending: 0, done: false });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!status?.configured) {
      toast.error("Bulk email has not been configured on the server.");
      return;
    }
    if (!form.subject.trim()) {
      toast.error("Subject is required.");
      return;
    }
    if (!form.message.trim()) {
      toast.error("Message is required.");
      return;
    }
    if (!form.recipients.trim() && !form.csvFile) {
      toast.error("Add recipients or upload a CSV file.");
      return;
    }

    const parsed = parseRecipientEmails(form.recipients);

    // CSV uploads stay as a single request (server parses the file).
    if (form.csvFile) {
      const body = new FormData();
      body.append("subject", form.subject.trim());
      body.append("fromName", form.fromName.trim() || "DAF Admin");
      body.append("message", form.message);
      body.append("isHtml", form.isHtml ? "true" : "false");
      body.append("recipients", form.recipients);
      body.append("csvFile", form.csvFile);

      setSending(true);
      setLastResult(null);
      setProgress({
        total: Math.max(parsed.length, 1),
        sent: 0,
        failed: 0,
        pending: Math.max(parsed.length, 1),
        done: false,
      });

      try {
        const response = await mailerService.sendBulk(body);
        const data = response.data?.data || {};
        setLastResult(data);
        setProgress({
          total: data.recipientCount || Math.max(parsed.length, 1),
          sent: data.sent || 0,
          failed: data.failed || 0,
          pending: 0,
          done: true,
        });
        if (response.data.success) {
          toast.success(response.data.message || "Emails sent.");
          setForm((prev) => ({ ...prev, recipients: "", csvFile: null }));
        } else {
          toast.error(response.data.message || "Send finished with errors.");
        }
        loadHistory();
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to send bulk email. Check configuration and try again.",
        );
        if (error.response?.data?.code === "MAILER_NOT_CONFIGURED") {
          loadStatus();
        }
        setProgress((prev) => ({
          ...prev,
          failed: prev.total,
          pending: 0,
          done: true,
        }));
      } finally {
        setSending(false);
      }
      return;
    }

    if (!parsed.length) {
      toast.error("No valid recipient emails found.");
      return;
    }

    setSending(true);
    setLastResult(null);
    setProgress({
      total: parsed.length,
      sent: 0,
      failed: 0,
      pending: parsed.length,
      done: false,
    });

    let sent = 0;
    let failed = 0;
    const errors = [];

    try {
      for (let i = 0; i < parsed.length; i += CHUNK) {
        const chunk = parsed.slice(i, i + CHUNK);
        const body = new FormData();
        body.append("subject", form.subject.trim());
        body.append("fromName", form.fromName.trim() || "DAF Admin");
        body.append("message", form.message);
        body.append("isHtml", form.isHtml ? "true" : "false");
        body.append("recipientList", JSON.stringify(chunk));
        body.append("quiet", i + CHUNK < parsed.length ? "true" : "false");

        try {
          const response = await mailerService.sendBulk(body);
          const data = response.data?.data || {};
          sent += Number(data.sent || 0);
          failed += Number(data.failed || 0);
          if (Array.isArray(data.errors)) errors.push(...data.errors);
        } catch (error) {
          failed += chunk.length;
          errors.push({
            email: chunk[0]?.email,
            message: error.response?.data?.message || "Chunk failed",
          });
        }

        setProgress({
          total: parsed.length,
          sent,
          failed,
          pending: Math.max(parsed.length - sent - failed, 0),
          done: false,
        });
      }

      const statusValue =
        failed === 0 ? "success" : sent === 0 ? "failed" : "partial";
      setLastResult({
        status: statusValue,
        recipientCount: parsed.length,
        sent,
        failed,
        errors: errors.slice(0, 50),
      });
      setProgress({
        total: parsed.length,
        sent,
        failed,
        pending: 0,
        done: true,
      });

      if (failed === 0) {
        toast.success(`Sent ${sent} email(s) successfully.`);
        setForm((prev) => ({ ...prev, recipients: "", csvFile: null }));
      } else if (sent === 0) {
        toast.error(`All ${failed} email(s) failed to send.`);
      } else {
        toast.warning(`Sent ${sent}; ${failed} failed.`);
      }
      loadHistory();
    } finally {
      setSending(false);
    }
  };

  const overview = history?.overview || { campaigns: 0, sent: 0, failed: 0 };
  const chartData = [
    { label: "sent", value: overview.sent || 0 },
    { label: "failed", value: overview.failed || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Engagement"
        title="Bulk Mailer"
        description="Track Gmail campaigns and open the composer when you are ready to send."
        actions={
          <button
            type="button"
            onClick={() => {
              setLastResult(null);
              setProgress({
                total: 0,
                sent: 0,
                failed: 0,
                pending: 0,
                done: false,
              });
              setComposeOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Send size={16} />
            Send email
          </button>
        }
      />

      {loadingStatus ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          Checking mailer configuration…
        </div>
      ) : (
        <div
          className={`rounded-2xl border p-5 ${
            status?.configured
              ? "border-emerald-200 bg-emerald-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-start gap-3">
            {status?.configured ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  status?.configured ? "text-emerald-900" : "text-amber-900"
                }`}
              >
                {status?.configured ? "Gmail ready" : "Gmail not configured"}
              </p>
              <p
                className={`mt-1 text-sm ${
                  status?.configured ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {status?.message}
                {status?.fromEmailMasked
                  ? ` · From ${status.fromEmailMasked}`
                  : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(74,44,31,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Campaigns (30d)
          </p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-brown)]">
            {loadingHistory ? "—" : overview.campaigns}
          </p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(74,44,31,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Emails sent
          </p>
          <p className="mt-2 text-3xl font-semibold text-emerald-700">
            {loadingHistory ? "—" : overview.sent}
          </p>
        </div>
        <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(74,44,31,0.06)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Failed
          </p>
          <p className="mt-2 text-3xl font-semibold text-rose-700">
            {loadingHistory ? "—" : overview.failed}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Delivery mix" subtitle="Sent vs failed over the last 30 days">
          <SharePieChart data={chartData} />
        </ChartCard>
        <ChartCard title="Delivery totals" subtitle="Absolute counts">
          <BreakdownBarChart data={chartData} />
        </ChartCard>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[var(--color-brown)]">
              Recent email campaigns
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Logged Gmail bulk sends from the admin dashboard.
            </p>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {loadingHistory ? (
            <p className="text-sm text-slate-500">Loading history…</p>
          ) : history?.recent?.length ? (
            history.recent.map((entry) => (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {entry.metadata?.subject || entry.description}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {entry.actorName || "Admin"} ·{" "}
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs">
                    <p className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 size={12} />
                      {entry.metadata?.sent ?? 0}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1 font-medium text-rose-600">
                      <XCircle size={12} />
                      {entry.metadata?.failed ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No email campaigns logged yet.</p>
          )}
        </div>
      </div>

      <ModalFrame
        open={composeOpen}
        wide
        title="Send email"
        subtitle="Gmail only. Paste addresses or upload a CSV with an Email column."
        onClose={closeCompose}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {(sending || progress.done) && progress.total > 0 ? (
            <SendProgressPanel
              title="Sending emails…"
              total={progress.total}
              sent={progress.sent}
              failed={progress.failed}
              pending={progress.pending}
              done={progress.done}
            />
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Subject
              </span>
              <input
                value={form.subject}
                onChange={(event) => updateField("subject", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                maxLength={160}
                disabled={sending}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                From name
              </span>
              <input
                value={form.fromName}
                onChange={(event) => updateField("fromName", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                disabled={sending}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Recipients ({recipientPreviewCount} detected)
            </span>
            <textarea
              value={form.recipients}
              onChange={(event) => updateField("recipients", event.target.value)}
              rows={5}
              placeholder="name@email.com, another@email.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              disabled={sending}
            />
          </label>

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
            <FileUp size={18} className="text-slate-500" />
            <span className="text-sm text-slate-600">
              {form.csvFile
                ? form.csvFile.name
                : "Upload CSV (optional, Email column)"}
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              disabled={sending}
              onChange={(event) =>
                updateField("csvFile", event.target.files?.[0] || null)
              }
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Message
            </span>
            <textarea
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              rows={7}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none"
              disabled={sending}
            />
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isHtml}
              disabled={sending}
              onChange={(event) => updateField("isHtml", event.target.checked)}
            />
            Message is HTML
          </label>

          {lastResult ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Last run: {lastResult.sent || 0} sent · {lastResult.failed || 0}{" "}
              failed · {lastResult.recipientCount || 0} targeted
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeCompose}
              disabled={sending}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={sending || !status?.configured}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Mail size={16} />
              {sending ? "Sending…" : "Send with Gmail"}
            </button>
          </div>
        </form>
      </ModalFrame>
    </div>
  );
}
