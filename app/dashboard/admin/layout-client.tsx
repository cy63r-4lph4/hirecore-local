// app/dashboard/layout-client.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  UserCheck,
  Users,
  X,
  Sun,
  Moon,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import Image from "next/image";

const iconMap: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  tasks: ClipboardList,
  applications: UserCheck,
  users: Users,
  shield: Shield,
  admin: Shield,
};

export default function AdminLayoutClient({
  children,
  navItems,
  profile,
  dashboardType,
}: any) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar - Added max-w for small screens */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] border-r border-border bg-card/30 backdrop-blur-xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-10">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/hirecore-local.svg"
                alt="HireCore Logo"
                width={32}
                height={32}
              />
              <span className="text-xl font-black tracking-tight">
                HireCore<span className="text-primary">.</span>
              </span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-2 text-muted-foreground"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">
              Operations
            </p>
            {navItems.map((item: any) => {
              const Icon = iconMap[item.iconName];

              const active =
                item.exact === true
                  ? pathname === item.href
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-border/50">
            <button
              onClick={() => router.push("/")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-destructive transition hover:bg-destructive/10"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Critical min-w-0 for responsiveness */}
      <div className="flex flex-1 flex-col min-w-0 relative">
        <header className="sticky top-0 z-30 h-20 flex items-center justify-between border-b border-border bg-background/50 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 -ml-2"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-3 rounded-2xl border border-border bg-surface-soft px-4 h-11 w-64 lg:w-80">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                placeholder="Command search..."
                className="bg-transparent text-sm outline-none w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-soft transition-all hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun size={18} className="text-yellow-400" />
              ) : (
                <Moon size={18} className="text-primary" />
              )}
            </button>

            <div className="h-6 w-px bg-border mx-1" />

            <Avatar className="h-9 w-9 md:h-10 md:w-10 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 w-full mx-auto max-w-7xl overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
