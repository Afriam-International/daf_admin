import DashboardShell from "./DashboardShell";
import { adminNav } from "../routes/nav";

export default function AdminLayout() {
  return <DashboardShell nav={adminNav} />;
}
