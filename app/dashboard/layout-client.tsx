// app/dashboard/layout-client.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

import {
  LayoutDashboard,
  UsersRound,
  Briefcase,
  FileCheck2,
  ShieldCheck,
  Settings,
  LogOut,
  Menu,
  X,
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

type DashboardLayoutClientProps = {
  children: ReactNode;
  navItems: readonly DashboardNavItem[];
  title: string;
  subtitle?: string;
};

export default function DashboardLayoutClient({
  children,
  navItems,
  title,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const mobileMenuId = useId();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const openMobileMenu = () => setMobileMenuOpen(true);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const userInitial = user?.fullName?.trim()?.[0]?.toUpperCase() ?? "U";
  const userFirstName = user?.fullName?.trim()?.split(" ")?.[0] ?? "User";
  const userRole = user?.role?.replace("_", " ") ?? "Dashboard";

  return (
    <div className="relative flex min-h-dvh w-full max-w-full overflow-x-clip bg-background text-foreground transition-colors duration-300">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl sm:h-96 sm:w-96" />
        <div className="absolute bottom-20 right-0 h-72 w-72 rounded-full bg-secondary/5 blur-3xl sm:h-96 sm:w-96" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-border bg-card/30 backdrop-blur-xl lg:flex">
        <div className="flex h-20 shrink-0 items-center px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/hirecore-local.svg"
              alt="HireCore Logo"
              width={32}
              height={32}
              className="h-8 w-auto shrink-0"
              priority
            />

            <span className="truncate text-lg font-black tracking-tight">
              HireCore<span className="text-primary">.</span>
            </span>
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-4 pt-4">
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
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-w-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      <button
        type="button"
        aria-label="Close dashboard menu"
        onClick={closeMobileMenu}
        tabIndex={mobileMenuOpen ? 0 : -1}
        className={cn(
          "fixed inset-0 z-50 bg-black/45 transition-opacity duration-300 lg:hidden",
          mobileMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
      />

      {/* Mobile Sidebar */}
      <aside
        id={mobileMenuId}
        aria-hidden={!mobileMenuOpen}
        className={cn(
          "fixed left-0 top-0 z-[60] flex h-dvh w-[min(20rem,86vw)] max-w-[86vw] transform-gpu flex-col border-r border-border bg-background shadow-2xl transition-transform duration-300 ease-out will-change-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex min-w-0 items-center gap-2.5"
          >
            <Image
              src="/hirecore-local.svg"
              alt="HireCore Logo"
              width={34}
              height={34}
              className="h-8 w-auto shrink-0"
              priority
            />

            <span className="truncate text-lg font-black tracking-tight">
              HireCore<span className="text-primary">.</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMobileMenu}
            className="shrink-0 rounded-xl border border-border bg-card/60 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-5">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
            System Overview
          </p>

          {navItems.map((item) => {
            const Icon = iconMap[item.iconName];
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-border p-3">
          <div className="mb-3 flex min-w-0 items-center gap-3 rounded-xl bg-card/60 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft font-black text-primary">
              {userInitial}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold">
                {user?.fullName ?? "User"}
              </p>
              <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-wider text-primary">
                {userRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              closeMobileMenu();
              logout();
            }}
            className="flex w-full min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative flex min-w-0 max-w-full flex-1 flex-col overflow-x-clip">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 px-3 backdrop-blur-md sm:h-20 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={openMobileMenu}
              className="shrink-0 rounded-xl border border-border bg-card/60 p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              aria-controls={mobileMenuId}
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="min-w-0 truncate text-base font-black tracking-tight sm:text-xl">
              {title}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              type="button"
              className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            <div className="hidden h-6 w-px bg-border sm:block" />

            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="max-w-28 truncate text-sm font-bold leading-none">
                  {userFirstName}
                </p>
                <p className="mt-1 max-w-28 truncate text-[10px] font-bold uppercase tracking-wider text-primary">
                  {userRole}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft font-black text-primary sm:h-10 sm:w-10">
                {userInitial}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl min-w-0 p-3 sm:p-6 lg:p-8">
          <div className="w-full min-w-0">{children}</div>
        </div>
      </main>
    </div>
  );
}