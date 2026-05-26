// src/app/dashboard/super-admin/security/page.tsx

"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Globe,
  LockKeyhole,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  User,
  Wifi,
  Zap,
} from "lucide-react";

import { useSuperAdminSessions } from "@/hooks/super-admin/use-super-admin-security";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SuperAdminSession } from "@/lib/api/super-admin/security";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

function formatDateTime(value?: string | null) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getRoleTone(role?: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "border-purple-500/20 bg-purple-500/10 text-purple-500";
    case "ADMIN":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function getRoleLabel(role?: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    case "USER":
      return "User";
    default:
      return "Unknown";
  }
}

function SessionCard({ session }: { session: SuperAdminSession }) {
  const isActive = Boolean(session.isActive);
  const userName = session.user?.fullName || "Unknown user";
  const userEmail = session.user?.email || "No email";
  const role = session.user?.role;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <LockKeyhole className="h-6 w-6 stroke-[1.5]" />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              isActive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                : "border-border bg-muted/50 text-muted-foreground",
            )}
          >
            {isActive ? "Active" : "Expired"}
          </Badge>

          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              getRoleTone(role),
            )}
          >
            {getRoleLabel(role)}
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Session Principal
          </p>

          <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
            {userName}
          </h2>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">
            {userEmail}
          </p>
        </div>

        <div className="grid gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Globe className="h-3.5 w-3.5 text-primary" />
            {session.ipAddress || "No IP address"}
          </p>

          <p className="line-clamp-2 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Cpu className="h-3.5 w-3.5 shrink-0 text-primary" />
            <span className="line-clamp-1">
              {session.userAgent || "No user agent"}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Created {formatDateTime(session.createdAt)}
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Expires {formatDateTime(session.expiresAt)}
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Session
        </span>
      </div>
    </div>
  );
}

export default function SuperAdminSecurityPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
    }),
    [page, search],
  );

  const { sessions, meta, loading, error, refetch } =
    useSuperAdminSessions(queryParams);

  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSuperAdminSummary();

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchSummary()]);
  };

  const activeSessions =
    meta?.activeSessions ?? summary?.security.activeSessions ?? 0;
  const totalSessions = meta?.total ?? 0;
  const expiredVisibleSessions: number = sessions.filter(
    (session: SuperAdminSession) => session.isActive === false
  ).length;
  interface AdminVisibleSession {
    user?: {
      role?: string;
    };
  }

  const adminVisibleSessions: number = sessions.filter(
    (session: AdminVisibleSession) =>
      session.user?.role === "ADMIN" || session.user?.role === "SUPER_ADMIN",
  ).length;

  const items = [
    {
      title: "Auth Gateway",
      description: "JWT and refresh-session visibility are online.",
      icon: LockKeyhole,
      metric: `${activeSessions} Active`,
      healthy: activeSessions >= 0,
    },
    {
      title: "Database Cluster",
      description: "Security telemetry is being read from PostgreSQL.",
      icon: Database,
      metric: `${totalSessions} Sessions`,
      healthy: !error,
    },
    {
      title: "Access Control",
      description: "Admin routes remain guarded by RBAC and throttling.",
      icon: ShieldCheck,
      metric: `${adminVisibleSessions} Admin Seen`,
      healthy: !error,
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            System Integrity
          </p>

          <h1 className="mt-1 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
            Sentinel <span className="text-primary">Monitor</span>
          </h1>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Monitor active sessions, privileged access traces, authentication
            surface health, and user-agent activity across the HireCore system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-6">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>

            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              System Live
            </span>
          </div>

          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={loading || summaryLoading}
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw
              size={14}
              className={cn(
                "mr-2",
                (loading || summaryLoading) && "animate-spin",
              )}
            />
            Sync
          </Button>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[2.5rem] border border-border bg-card/30 p-8 backdrop-blur-xl transition-all hover:border-primary/40 hover:bg-card/50"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
                <Icon size={120} />
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Icon className="h-7 w-7" />
              </div>

              <div className="mt-6">
                <h2 className="text-xl font-black italic tracking-tight uppercase">
                  {item.title}
                </h2>

                <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground/80">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[10px] font-black uppercase tracking-widest",
                    item.healthy
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                      : "border-destructive/20 bg-destructive/10 text-destructive",
                  )}
                >
                  <Activity className="h-3 w-3" />
                  {item.healthy ? "Healthy" : "Warning"}
                </div>

                <span className="text-[10px] font-bold italic text-muted-foreground/50">
                  {item.metric}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-8 backdrop-blur-xl">
        <h3 className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          <Zap size={14} className="fill-primary text-primary" />
          Security Session Telemetry
        </h3>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Active Sessions",
              val: activeSessions,
              icon: Wifi,
              detail: "Not expired",
            },
            {
              label: "Total Sessions",
              val: totalSessions,
              icon: Server,
              detail: "Matching query",
            },
            {
              label: "Expired Visible",
              val: expiredVisibleSessions,
              icon: Clock,
              detail: "Current page",
            },
            {
              label: "Privileged Seen",
              val: adminVisibleSessions,
              icon: ShieldAlert,
              detail: "Admin/Super Admin",
            },
          ].map((stat, index) => (
            <div
              key={index}
              className="flex flex-col gap-1 border-l border-border pl-6 first:border-0 md:first:border-l lg:first:border-0"
            >
              <div className="flex items-center gap-2 text-muted-foreground/50">
                <stat.icon size={14} />

                <span className="text-[10px] font-black uppercase tracking-widest">
                  {stat.label}
                </span>
              </div>

              <p className="text-2xl font-black italic uppercase tracking-tighter text-primary">
                {stat.val}
              </p>

              <p className="text-[10px] font-medium text-muted-foreground">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by user, email, IP, or user-agent..."
              className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Visible Sessions
            </p>
            <p className="mt-1 text-sm font-black italic text-primary">
              {meta?.total ?? 0}
            </p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Session Results
          </p>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0} Entries
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              Syncing Sentinel...
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-bold italic text-destructive">{error}</p>
          </div>
        ) : null}

        {!loading && !error && sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No session records found.
            </p>
          </div>
        ) : null}

        {!loading && !error && sessions.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sessions.map((session: SuperAdminSession) => (
              <SessionCard key={session.id} session={session} />
            ))}
            </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={loading || !meta || page >= Math.max(1, meta.totalPages)}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20 md:flex-row">
        <div className="relative z-10">
          <h4 className="text-2xl font-black italic uppercase leading-none tracking-tighter">
            Protocols Hardened
          </h4>

          <p className="mt-2 max-w-md text-sm font-medium italic leading-relaxed opacity-90">
            Session records are visible, privileged access is traceable, and
            expired credentials are being separated from active operators.
          </p>
        </div>

        <div className="relative z-10">
          <Button
            variant="secondary"
            className="h-12 rounded-xl px-8 font-black uppercase tracking-widest"
            onClick={refreshAll}
            disabled={loading || summaryLoading}
          >
            Run Audit
          </Button>
        </div>

        <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>
    </div>
  );
}