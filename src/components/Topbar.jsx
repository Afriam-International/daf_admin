import { Bell, LogOut, Menu, Settings } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Topbar({ onOpenSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = `${user?.firstname?.[0] || ""}${user?.lastname?.[0] || ""}`.trim();

  return (
    <div className="sticky top-0 z-20 border-b border-white/70 bg-[rgba(245,245,245,0.72)] backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
            onClick={onOpenSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Welcome back, {user?.firstname || "Admin"}
            </p>
            <p className="text-xs text-slate-500">
              Manage users, campaigns, donations, and access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 sm:inline-flex">
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate("/admin/settings")}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--color-accent)] text-sm font-semibold text-white">
              {initials || "AD"}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-900">
                {`${user?.firstname || ""} ${user?.lastname || ""}`.trim() || user?.email}
              </p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                {user?.role || "admin"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 text-sm font-medium text-rose-700"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
