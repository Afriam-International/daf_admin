import {
  Activity,
  BarChart3,
  BookOpenText,
  Gift,
  Images,
  KeyRound,
  LayoutDashboard,
  Newspaper,
  Settings,
  Shield,
  Trash2,
  Users,
} from "lucide-react";

export const adminNav = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, roles: ["admin", "superadmin"] },
  { label: "Analytics", to: "/admin/analytics", icon: BarChart3, roles: ["superadmin"], permission: "canViewAnalytics" },
  { label: "Users", to: "/admin/users", icon: Users, roles: ["admin", "superadmin"], permission: "canManageUsers" },
  { label: "Admins", to: "/admin/admins", icon: Shield, roles: ["superadmin"] },
  { label: "Deletion Requests", to: "/admin/deletion-requests", icon: Trash2, roles: ["admin", "superadmin"], permission: "canManageDeletionRequests" },
  { label: "Donations", to: "/admin/donations", icon: Gift, roles: ["superadmin"], permission: "canViewDonations" },
  { label: "Gallery", to: "/admin/gallery", icon: Images, roles: ["admin", "superadmin"], permission: "canManageGallery" },
  { label: "Social Feed", to: "/admin/social-feed", icon: Newspaper, roles: ["admin", "superadmin"], permission: "canManageFeed" },
  { label: "Blog", to: "/admin/blog", icon: BookOpenText, roles: ["admin", "superadmin"], permission: "canManageBlog" },
  { label: "Roles & Permissions", to: "/admin/permissions", icon: KeyRound, roles: ["superadmin"] },
  { label: "Activity Log", to: "/admin/activity-logs", icon: Activity, roles: ["superadmin"], permission: "canViewActivityLog" },
  { label: "Settings", to: "/admin/settings", icon: Settings, roles: ["admin", "superadmin"] },
];
