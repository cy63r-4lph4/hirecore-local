// app/dashboard/layout-client.tsx
"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import Image from "next/image";

import {
  LayoutDashboard,
  UsersRound,
  Briefcase,
  FileCheck2,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  Bell,
  UploadCloud,
  UserRound,
  Building2,
  FilePlus2,
  Search,
  ClipboardList,
} from "lucide-react";

const iconMap = {
  layout: LayoutDashboard,
  users: UsersRound,
  user: UserRound,
  employer: Building2,
  tasks: Briefcase,
  createTask: FilePlus2,
  search: Search,
  applications: FileCheck2,
  workforce: ClipboardList,
  shield: ShieldCheck,
  settings: Settings,
  upload: UploadCloud,
};

export type DashboardNavItem = {
  href: string;
  label: string;
  iconName: keyof typeof iconMap;
};
export default function DashboardLayoutClient({
  children,
  navItems,
  title,
}: {
  children: ReactNode;
  navItems: readonly DashboardNavItem[];
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Dynamic Ambient Background (Matches Homepage) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] h-[30%] w-[30%] rounded-full bg-secondary/5 blur-[100px]" />
      </div>

      {/* Modern Integrated Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-border bg-card/30 backdrop-blur-xl lg:flex flex-col">
        <div className="flex h-20 items-center px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/hirecore-local.svg"
              alt="HireCore Logo"
              width={32}
              height={32}
            />
            <span className="text-lg font-black tracking-tight">
              HireCore<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 pt-4">
          <p className="mb-4 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
            System Overview
          </p>
          {navItems.map((item) => {
            const Icon = iconMap[item.iconName];
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "" : "group-hover:scale-110 transition-transform",
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-background/50 px-8 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black tracking-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">
                  {user?.fullName?.split(" ")[0]}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface-soft font-black text-primary">
                {user?.fullName?.[0]}
              </div>
            </div>
            <button className="lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl p-8">{children}</div>
      </main>
    </div>
  );
}
