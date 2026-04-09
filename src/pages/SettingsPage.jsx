import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { authService } from "../services/authService";
import { userService } from "../services/userService";
import { useAuth } from "../hooks/useAuth";

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        contact: user.contact || "",
      });
    }
  }, [user]);

  const submitProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await userService.updateProfile(profileForm);
      updateUser(response.data.data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile");
    }
  };

  const submitPassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    try {
      await authService.changePassword({
        newPassword: passwordForm.newPassword,
      });
      setMessage("Password changed successfully.");
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Profile and security"
        description="Update admin details and set a new password."
      />

      {message ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <form
          onSubmit={submitProfile}
          className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]"
        >
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">Admin profile</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">First name</span>
              <input
                value={profileForm.firstname}
                onChange={(event) => setProfileForm((current) => ({ ...current, firstname: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Last name</span>
              <input
                value={profileForm.lastname}
                onChange={(event) => setProfileForm((current) => ({ ...current, lastname: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Contact</span>
              <input
                value={profileForm.contact}
                onChange={(event) => setProfileForm((current) => ({ ...current, contact: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex rounded-2xl bg-[var(--color-teal)] px-5 py-3 text-sm font-semibold text-white"
          >
            Save profile
          </button>
        </form>

        <form
          onSubmit={submitPassword}
          className="rounded-[30px] border border-white/70 bg-white/85 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]"
        >
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">Change password</h2>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">New password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setShowNewPassword((current) => !current)} className="text-slate-400">
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</span>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="w-full bg-transparent text-sm outline-none"
                />
                <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="text-slate-400">
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 inline-flex rounded-2xl bg-[var(--color-brown)] px-5 py-3 text-sm font-semibold text-white"
          >
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}
