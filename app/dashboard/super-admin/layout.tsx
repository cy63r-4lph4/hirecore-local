// app/dashboard/super-admin/layout.tsx
import type { ReactNode } from "react";
import DashboardLayoutClient from "../layout-client";

const navItems = [
  { href: "/dashboard/super-admin", label: "Overview", iconName: "layout" },
  { href: "/dashboard/super-admin/users", label: "Users", iconName: "users" },
  {
    href: "/dashboard/super-admin/admins",
    label: "Admins",
    iconName: "shield",
  },
  { href: "/dashboard/super-admin/tasks", label: "Tasks", iconName: "tasks" },
  {
    href: "/dashboard/super-admin/applications",
    label: "Applications",
    iconName: "applications",
  },
  {
    href: "/dashboard/super-admin/workforce",
    label: "Workforce",
    iconName: "users",
  },
  {
    href: "/dashboard/super-admin/uploads",
    label: "Uploads",
    iconName: "upload",
  },
  {
    href: "/dashboard/super-admin/security",
    label: "Security",
    iconName: "shield",
  },
] as const;

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardLayoutClient
      navItems={navItems}
      title="Super Admin"
      subtitle="System governance and control"
    >
      {children}
    </DashboardLayoutClient>
  );
}
