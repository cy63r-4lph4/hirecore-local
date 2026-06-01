"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Bug,
  ChevronDown,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  User,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";

type NavLink = {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!ref.current || ref.current.contains(target)) return;
      handler();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [enabled, handler, ref]);
}

const publicLinks: NavLink[] = [
  {
    href: "/tasks",
    label: "Browse Tasks",
    icon: BriefcaseBusiness,
  },
  {
    href: "/workers",
    label: "Find Workers",
    icon: UsersRound,
  },
  {
    href: "/how-it-works",
    label: "How It Works",
    icon: HelpCircle,
  },
  {
    href: "/policies",
    label: "Policies",
    icon: ShieldCheck,
  },
  {
    href: "/bug-report",
    label: "Report Bug",
    icon: Bug,
  },
];

const authedLinks: NavLink[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, authenticated, loading, logout } = useAuth();

  const closeMobileMenu = useCallback(() => setMenuOpen(false), []);
  const closeUserMenu = useCallback(() => setUserMenuOpen(false), []);

  useOutsideClick(mobileMenuRef, closeMobileMenu, menuOpen);
  useOutsideClick(userMenuRef, closeUserMenu, userMenuOpen);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const userName = user?.fullName || user?.email || "User";
  const userEmail = user?.email || "";

  return (
    <nav
      className={cn(
        "fixed left-1/2 top-4 z-50 w-[95%] max-w-7xl -translate-x-1/2 rounded-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        scrolled
          ? "glass-nav shadow-[0_18px_45px_rgba(0,0,0,0.16)]"
          : "glass-nav",
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-b from-white/20 via-transparent to-transparent opacity-40" />

      <div className="relative flex h-17.5 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <Image
            src="/hirecore-local.svg"
            alt="HireCore Logo"
            width={38}
            height={38}
            priority
          />

          <span className="text-lg font-semibold tracking-tight text-nav-foreground/90 transition group-hover:text-nav-foreground">
            Hire<span className="text-primary">Core</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium text-nav-foreground/70 transition hover:text-nav-foreground"
            >
              {link.label}

              {isActive(link.href) && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 h-0.5 w-full bg-primary"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-soft text-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <Sun
              className={cn(
                "absolute h-4 w-4 transition-all",
                theme === "dark"
                  ? "scale-0 rotate-90 opacity-0"
                  : "scale-100 rotate-0 opacity-100",
              )}
            />

            <Moon
              className={cn(
                "absolute h-4 w-4 transition-all",
                theme === "dark"
                  ? "scale-100 rotate-0 opacity-100"
                  : "scale-0 -rotate-90 opacity-0",
              )}
            />
          </button>

          {!loading && !authenticated && (
            <Link href="/auth" className="hidden sm:block">
              <Button
                size="sm"
                className="rounded-full bg-primary px-5 text-primary-foreground shadow-[0_6px_20px_hsl(var(--primary)/0.35)] transition hover:scale-[1.03] hover:bg-primary/90"
              >
                Sign in
              </Button>
            </Link>
          )}

          {!loading && authenticated && (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button
                  size="sm"
                  className="rounded-full bg-primary px-5 text-primary-foreground shadow-[0_6px_20px_hsl(var(--primary)/0.35)] transition hover:scale-[1.03] hover:bg-primary/90"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>

              <div ref={userMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((open) => !open)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-2 rounded-full border border-border bg-surface-soft py-1 pl-1 pr-3 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden max-w-28 truncate font-medium lg:block">
                    {userName}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-card/95 p-2 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95"
                  >
                    <div className="p-3">
                      <p className="truncate text-sm font-semibold">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>

                    <div className="my-1 h-px bg-border" />

                    {authedLinks.map((link) => {
                      const Icon = link.icon;

                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          role="menuitem"
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground",
                            isActive(link.href)
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          {link.label}
                        </Link>
                      );
                    })}

                    <div className="my-1 h-px bg-border" />

                    <button
                      type="button"
                      onClick={logout}
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-destructive transition hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <div ref={mobileMenuRef} className="md:hidden">
            <button
              type="button"
              aria-label="Toggle mobile menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-soft text-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {menuOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-2xl animate-in fade-in zoom-in-95">
                {authenticated && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-sm font-bold text-primary-foreground">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 text-left">
                      <p className="truncate text-sm font-semibold">
                        {userName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                    Explore
                  </p>

                  {publicLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground",
                          isActive(link.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        {link.label}
                      </Link>
                    );
                  })}

                  <div className="my-2 h-px bg-border" />

                  {!loading && !authenticated && (
                    <Link
                      href="/auth"
                      className="rounded-xl bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Sign in
                    </Link>
                  )}

                  {!loading && authenticated && (
                    <>
                      <p className="px-3 pb-1 pt-2 text-[11px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                        Account
                      </p>

                      {authedLinks.map((link) => {
                        const Icon = link.icon;

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-accent hover:text-accent-foreground",
                              isActive(link.href)
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {Icon && <Icon className="h-4 w-4" />}
                            {link.label}
                          </Link>
                        );
                      })}

                      <button
                        type="button"
                        onClick={logout}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-destructive transition hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}