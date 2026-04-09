import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const joinClasses = (...values) => values.filter(Boolean).join(" ");

export default function Sidebar({ nav, onNavigate }) {
  const { user } = useAuth();
  const allowedNav = nav.filter((item) => {
    const roleAllowed = !item.roles || item.roles.includes(user?.role);
    const permissionAllowed =
      user?.role === "superadmin" ||
      !item.permission ||
      user?.permissions?.[item.permission] !== false;

    return roleAllowed && permissionAllowed;
  });

  return (
    <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#4A2C1F_0%,#382117_100%)] text-white">
      <div className="shrink-0 border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white/10 p-1">
            <img src="/assets/app_logo.jpg" alt="DAF logo" className="h-full w-full rounded-xl object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-white/70">DAF</p>
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
          Control Center
        </p>
        <nav className="mt-3 flex flex-col gap-1.5">
          {allowedNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  joinClasses(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white",
                    isActive && "bg-[var(--color-teal)] text-white shadow-[0_16px_40px_rgba(45,170,191,0.3)]",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 p-4">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-center text-xs text-white/60">
          DAF Admin Console
        </div>
      </div>
    </div>
  );
}
