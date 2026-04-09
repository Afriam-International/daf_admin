import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const joinClasses = (...values) => values.filter(Boolean).join(" ");

export default function DashboardShell({ nav }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[var(--color-bg)]">
      <div className="flex h-full w-full">
        <aside className="hidden h-screen w-80 shrink-0 border-r border-black/5 lg:block">
          <Sidebar nav={nav} />
        </aside>

        <div
          className={joinClasses(
            "fixed inset-0 z-40 bg-slate-950/35 p-4 lg:hidden",
            mobileOpen ? "block" : "hidden",
          )}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setMobileOpen(false);
            }
          }}
        >
          <div className="h-full w-full max-w-xs overflow-hidden rounded-[32px] shadow-2xl">
            <Sidebar nav={nav} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar onOpenSidebar={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
