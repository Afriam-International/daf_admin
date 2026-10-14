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
import { mailerService } from "../services/mailerService";
import { toast } from "../utils/toast";

const emptyForm = {
  subject: "",
  fromName: "Diaspora African Forum",
  recipients: "",
  message: "",
  isHtml: false,
  csvFile: null,
};

export default function BulkMailerPage() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [sending, setSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const recipientPreviewCount = useMemo(() => {
    const fromText = form.recipients
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .filter(Boolean).length;
    return fromText + (form.csvFile ? 1 : 0);
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

  useEffect(() => {
    loadStatus();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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

    const body = new FormData();
    body.append("subject", form.subject.trim());
    body.append("fromName", form.fromName.trim() || "DAF Admin");
    body.append("message", form.message);
    body.append("isHtml", form.isHtml ? "true" : "false");
    body.append("recipients", form.recipients);
    if (form.csvFile) body.append("csvFile", form.csvFile);

    setSending(true);
    setLastResult(null);
    try {
      const response = await mailerService.sendBulk(body);
      setLastResult(response.data.data);
      if (response.data.success) {
        toast.success(response.data.message || "Emails sent.");
        setForm((prev) => ({
          ...prev,
          recipients: "",
          csvFile: null,
        }));
      } else {
        toast.error(response.data.message || "Send finished with errors.");
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to send bulk email. Check configuration and try again.";
      toast.error(message);
      if (error.response?.data?.code === "MAILER_NOT_CONFIGURED") {
        loadStatus();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Mailer"
        description="Compose and send email campaigns to pasted addresses or a CSV list."
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
                {status?.configured
                  ? "Mailer configured"
                  : "Mailer not configured"}
              </p>
              <p
                className={`mt-1 text-sm ${
                  status?.configured ? "text-emerald-800" : "text-amber-800"
                }`}
              >
                {status?.message}
              </p>
              {status?.configured && status?.fromEmailMasked ? (
                <p className="mt-1 text-xs text-emerald-700">
                  Sending as {status.fromEmailMasked} via {status.host}:
                  {status.port}
                </p>
              ) : (
                <p className="mt-2 text-xs text-amber-800">
                  Set <code>GMAIL_USER</code> and <code>GMAIL_APP_PASSWORD</code>{" "}
                  (or <code>EMAIL_HOST_USER</code> /{" "}
                  <code>EMAIL_HOST_PASSWORD</code>) on the API server, then
                  restart.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"
      >
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              placeholder="DAF community update"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              From name
            </label>
            <input
              type="text"
              value={form.fromName}
              onChange={(e) => updateField("fromName", e.target.value)}
              placeholder="Diaspora African Forum"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Recipients
            </label>
            <textarea
              rows={4}
              value={form.recipients}
              onChange={(e) => updateField("recipients", e.target.value)}
              placeholder="one@email.com, two@email.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Separate emails with commas or new lines.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Message
            </label>
            <textarea
              rows={10}
              value={form.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Write your email body. Use {{firstname}} to personalize when CSV includes a Firstname column."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.isHtml}
                onChange={(e) => updateField("isHtml", e.target.checked)}
              />
              Message contains HTML
            </label>
          </div>

          <button
            type="submit"
            disabled={sending || !status?.configured}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending…" : "Send bulk email"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-brown)]">
              <FileUp className="h-5 w-5" />
              <h3 className="font-semibold">CSV upload</h3>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Optional. Include columns like <code>Email</code> /{" "}
              <code>Email Address</code> and optionally{" "}
              <code>Firstname</code>.
            </p>
            <input
              type="file"
              accept=".csv,text/csv"
              className="mt-4 block w-full text-sm"
              onChange={(e) =>
                updateField("csvFile", e.target.files?.[0] || null)
              }
            />
            {form.csvFile ? (
              <p className="mt-2 text-xs text-slate-600">
                Selected: {form.csvFile.name}
              </p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--color-brown)]">
              <Mail className="h-5 w-5" />
              <h3 className="font-semibold">Campaign tips</h3>
            </div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Max 500 recipients per send.</li>
              <li>Emails are sent in small batches to reduce Gmail throttling.</li>
              <li>Sends are written to the Activity Log.</li>
              <li>
                Preview count from pasted list:{" "}
                <strong>{recipientPreviewCount}</strong>
                {form.csvFile ? " (+ CSV)" : ""}
              </li>
            </ul>
          </div>

          {lastResult ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-[var(--color-brown)]">
                Last send result
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-semibold">
                    {lastResult.recipientCount}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-700">Sent</p>
                  <p className="text-lg font-semibold text-emerald-800">
                    {lastResult.sent}
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3">
                  <p className="text-xs text-rose-700">Failed</p>
                  <p className="text-lg font-semibold text-rose-800">
                    {lastResult.failed}
                  </p>
                </div>
              </div>
              {lastResult.errors?.length ? (
                <div className="mt-4 space-y-2">
                  {lastResult.errors.slice(0, 8).map((error) => (
                    <div
                      key={`${error.email}-${error.message}`}
                      className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-800"
                    >
                      <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        <strong>{error.email}</strong>: {error.message}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
