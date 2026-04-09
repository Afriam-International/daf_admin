import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ role = null }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--color-bg)]">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--color-teal)]" />
          Loading your workspace
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];

  if (
    allowedRoles.length &&
    !allowedRoles.includes(user?.role) &&
    !(user?.role === "superadmin" && allowedRoles.includes("admin"))
  ) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
