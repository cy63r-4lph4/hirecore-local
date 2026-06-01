import type { ReactNode } from "react";
import DashboardLayoutClient from "../layout-client";

const navItems = [
  {
    href: "/dashboard/employer",
    label: "Overview",
    iconName: "layout",
  },
  {
    href: "/workers",
    label: "Find Workers",
    iconName: "users",
  },
  {
    href: "/tasks/new",
    label: "Post Task",
    iconName: "createTask",
  },
  {
    href: "/dashboard/employer/tasks",
    label: "My Tasks",
    iconName: "tasks",
  },
  {
    href: "/dashboard/employer/applications",
    label: "Applications",
    iconName: "applications",
  },
  {
    href: "/profile",
    label: "Profile",
    iconName: "employer",
  },
] as const;

export default function EmployerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayoutClient
      navItems={navItems}
      title="Employer Dashboard"
      subtitle="Tasks, applicants, worker discovery, and employer trust"
    >
      {children}
    </DashboardLayoutClient>
  );
}