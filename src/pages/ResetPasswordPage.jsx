import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { authService } from "../services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Reset token is missing from the link.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await authService.resetPassword({ token, newPassword: form.password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-teal)]">
          Password updated
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-[var(--color-brown)]">
          You can sign in again
        </h2>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Your password has been reset successfully.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex rounded-2xl bg-[var(--color-teal)] px-5 py-3 text-sm font-semibold text-white"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-teal)]">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-teal)]">
        New password
      </p>
      <h2 className="mt-2 text-3xl font-semibold text-[var(--color-brown)]">
        Set a fresh password
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Use a strong password with uppercase, lowercase, number, and special character.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <KeyRound className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              required
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Confirm password</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="w-full bg-transparent text-sm text-slate-900 outline-none"
              required
            />
          </div>
        </label>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-[var(--color-brown)] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Updating..." : "Reset password"}
        </button>
      </form>
    </div>
  );
}
