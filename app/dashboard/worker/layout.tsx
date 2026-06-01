import type { ReactNode } from "react";
import DashboardLayoutClient from "../layout-client";

const navItems = [
  {
    href: "/dashboard/worker",
    label: "Overview",
    iconName: "layout",
  },
  {
    href: "/tasks",
    label: "Browse Tasks",
    iconName: "tasks",
  },
  {
    href: "/my-applications",
    label: "My Applications",
    iconName: "applications",
  },
  {
    href: "/apply-workforce",
    label: "Workforce",
    iconName: "workforce",
  },
  {
    href: "/profile",
    label: "Profile",
    iconName: "user",
  },
] as const;

export default function WorkerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayoutClient
      navItems={navItems}
      title="Worker Dashboard"
      subtitle="Applications, tasks, trust, and workforce progress"
    >
      {children}
    </DashboardLayoutClient>
  );
}