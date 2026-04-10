import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, setError: setAuthError } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await authService.login(form);
      const { accessToken, refreshToken, userInfo } = response.data;

      if (!["admin", "superadmin"].includes(userInfo.role)) {
        throw new Error("Only administrators can sign in here.");
      }

      login({
        accessToken,
        refreshToken,
        user: userInfo,
      });
      navigate("/admin");
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unable to sign in";
      setError(message);
      setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Email address</span>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Mail className="h-4 w-4 text-slate-400" />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="admin@daf.app"
            className="w-full bg-transparent text-sm text-slate-900 outline-none"
            required
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Lock className="h-4 w-4 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Enter your password"
            className="w-full bg-transparent text-sm text-slate-900 outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="text-slate-400"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Link to="/forgot-password" className="text-sm font-medium text-[var(--color-accent)]">
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2DAABF,#4A2C1F)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(45,170,191,0.28)] disabled:opacity-60"
      >
        {submitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
