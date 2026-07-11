import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AdminLayout from "./layouts/AdminLayout";
import GuestRoute from "./routes/GuestRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminOverviewPage from "./pages/AdminOverviewPage";
import UsersPage from "./pages/UsersPage";
import AdminsPage from "./pages/AdminsPage";
import BlogPage from "./pages/BlogPage";
import DeletionRequestsPage from "./pages/DeletionRequestsPage";
import DonationsPage from "./pages/DonationsPage";
import GalleryPage from "./pages/GalleryPage";
import SocialFeedPage from "./pages/SocialFeedPage";
import FaqsPage from "./pages/FaqsPage";
import InfosPage from "./pages/InfosPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PermissionsPage from "./pages/PermissionsPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useAuth } from "./hooks/useAuth";

function AccessRoute({ roles, children }) {
  const { user } = useAuth();
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute role={["admin", "superadmin"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminOverviewPage />} />
            <Route path="analytics" element={<AccessRoute roles="superadmin"><AnalyticsPage /></AccessRoute>} />
            <Route path="users" element={<AccessRoute roles="superadmin"><UsersPage /></AccessRoute>} />
            <Route path="admins" element={<AccessRoute roles="superadmin"><AdminsPage /></AccessRoute>} />
            <Route path="deletion-requests" element={<DeletionRequestsPage />} />
            <Route path="donations" element={<AccessRoute roles="superadmin"><DonationsPage /></AccessRoute>} />
            <Route path="gallery" element={<GalleryPage />} />
            <Route path="social-feed" element={<SocialFeedPage />} />
            <Route path="faqs" element={<FaqsPage />} />
            <Route path="infos" element={<InfosPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="permissions" element={<AccessRoute roles="superadmin"><PermissionsPage /></AccessRoute>} />
            <Route path="activity-logs" element={<AccessRoute roles="superadmin"><ActivityLogsPage /></AccessRoute>} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
