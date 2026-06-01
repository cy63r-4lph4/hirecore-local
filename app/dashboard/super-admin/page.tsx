// src/app/dashboard/super-admin/page.tsx

"use client";

import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Database,
  FileCheck2,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  UploadCloud,
  UsersRound,
  Workflow,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

function formatNumber(value?: number | null) {
  return new Intl.NumberFormat("en-GH").format(value ?? 0);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  description,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  description: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-4xl border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]">
      <div className="absolute -right-8 -top-8 opacity-[0.04] transition group-hover:opacity-[0.08]">
        <Icon className="h-32 w-32" />
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 stroke-[1.5]" />
        </div>

        <span className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-tight text-primary">
          {trend}
        </span>
      </div>

      <div className="relative mt-6">
        <p className="text-3xl font-black italic tracking-tighter">{value}</p>

        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>

        <p className="mt-3 text-xs font-medium leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusChip({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "success" | "danger" | "primary";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "success" &&
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
        tone === "warning" &&
          "border-amber-500/20 bg-amber-500/10 text-amber-500",
        tone === "danger" &&
          "border-destructive/20 bg-destructive/10 text-destructive",
        tone === "primary" && "border-primary/20 bg-primary/10 text-primary",
        tone === "default" && "border-border bg-background/60",
      )}
    >
      <p className="text-2xl font-black italic tracking-tighter">
        {formatNumber(value)}
      </p>

      <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] opacity-75">
        {label}
      </p>
    </div>
  );
}

function RecentRow({
  title,
  subtitle,
  meta,
  href,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-4 border-b border-border/50 pb-4 last:border-0"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70 text-primary transition group-hover:scale-105 group-hover:border-primary/30">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-black italic tracking-tight text-foreground transition-colors group-hover:text-primary">
            {title}
          </p>

          <p className="truncate text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 sm:inline">
          {meta}
        </span>

        <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition group-hover:opacity-100" />
      </div>
    </Link>
  );
}

export default function SuperAdminPage() {
  const { summary, loading, error, refetch } = useSuperAdminSummary();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />

        <p className="animate-pulse text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">
          Syncing Governance Console...
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-[2.5rem] border border-destructive/20 bg-destructive/10 p-8">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 shrink-0 text-destructive" />

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive">
              Console Fault
            </p>

            <h2 className="mt-1 text-3xl font-black italic uppercase tracking-tighter">
              Dashboard Offline
            </h2>

            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {error || "The summary endpoint returned no data."}
            </p>

            <Button
              type="button"
              onClick={() => void refetch()}
              className="mt-5 h-12 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const users = summary.users ?? {};
  const jobs = summary.jobs ?? {};
  const applications = summary.applications ?? {};
  const workforce = summary.workforce ?? {};
  const uploads = summary.uploads ?? {};
  const security = summary.security ?? {};
  const trust = summary.trust ?? {};
  const recent = summary.recent ?? {};

  return (
    <div className="space-y-8 pb-12">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Executive Command
          </p>

          <h1 className="mt-1 text-4xl font-black italic uppercase tracking-tighter sm:text-5xl">
            Governance <span className="text-primary">Console</span>
          </h1>

          <p className="mt-2 max-w-3xl text-sm font-medium leading-7 text-muted-foreground">
            Live visibility across identities, task moderation, applications,
            workforce onboarding, uploads, trust posture, and privileged access.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => void refetch()}
          variant="outline"
          className="h-12 w-fit rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Telemetry
        </Button>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Users"
          value={formatNumber(users.total)}
          icon={UsersRound}
          trend={`${formatNumber(users.dualProfileUsers)} dual`}
          description={`${formatNumber(users.workers)} workers · ${formatNumber(
            users.employers,
          )} employers registered on the platform.`}
        />

        <MetricCard
          label="Open Tasks"
          value={formatNumber(jobs.open)}
          icon={BriefcaseBusiness}
          trend={`${formatNumber(jobs.pendingApproval)} pending`}
          description={`${formatNumber(
            jobs.total,
          )} total tasks across the marketplace registry.`}
        />

        <MetricCard
          label="Applications"
          value={formatNumber(applications.total)}
          icon={FileCheck2}
          trend={`${formatNumber(applications.pending)} pending`}
          description={`${formatNumber(
            applications.accepted,
          )} accepted · ${formatNumber(applications.rejected)} rejected.`}
        />

        <MetricCard
          label="Workforce"
          value={formatNumber(workforce.members)}
          icon={ShieldCheck}
          trend={`${formatNumber(workforce.underReview)} review`}
          description={`${formatNumber(
            workforce.totalApplications,
          )} workforce applications submitted.`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl sm:p-8 xl:col-span-2">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Action Queues
              </p>

              <h3 className="mt-1 text-2xl font-black italic uppercase tracking-tight">
                Operational Pressure
              </h3>

              <p className="mt-1 text-sm font-medium text-muted-foreground">
                The places where admin action matters most.
              </p>
            </div>

            <Link
              href="/dashboard/super-admin/workforce/applications"
              className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
            >
              Review Workforce
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatusChip
              label="Jobs Pending"
              value={jobs.pendingApproval ?? 0}
              tone="warning"
            />

            <StatusChip
              label="Apps Pending"
              value={applications.pending ?? 0}
              tone="primary"
            />

            <StatusChip
              label="Workforce Review"
              value={workforce.underReview ?? 0}
              tone="warning"
            />

            <StatusChip
              label="Email Verified"
              value={users.emailVerified ?? 0}
              tone="success"
            />

            <StatusChip
              label="Phone Verified"
              value={users.phoneVerified ?? 0}
              tone="success"
            />

            <StatusChip
              label="Admin Verified"
              value={users.adminVerified ?? 0}
              tone="primary"
            />
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">
              Live Pulse
            </p>

            <h3 className="mt-2 text-2xl font-black italic uppercase tracking-tighter">
              System Pulse
            </h3>

            <p className="mt-2 text-sm font-medium leading-relaxed opacity-80">
              Core marketplace data is online. Deeper infrastructure health can
              connect to monitoring endpoints later.
            </p>

            <div className="mt-8 space-y-4 text-sm font-black uppercase tracking-wider">
              <PulseRow
                label="Sessions"
                value={formatNumber(security.activeSessions)}
              />
              <PulseRow label="Uploads" value={formatNumber(uploads.total)} />
              <PulseRow label="Profiles" value={formatNumber(users.total)} />
            </div>
          </div>

          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Reputation
              </p>

              <h3 className="text-xl font-black italic uppercase tracking-tight">
                Trust Telemetry
              </h3>
            </div>
          </div>

          <TrustMetric
            label="Worker Average"
            value={trust.workerAverage ?? 0}
            max={1000}
          />

          <TrustMetric
            label="Employer Average"
            value={trust.employerAverage ?? 0}
            max={1000}
          />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <StatusChip
              label="Worker Max"
              value={trust.workerMax ?? 0}
              tone="primary"
            />

            <StatusChip
              label="Employer Max"
              value={trust.employerMax ?? 0}
              tone="primary"
            />
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <UploadCloud className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Storage
              </p>

              <h3 className="text-xl font-black italic uppercase tracking-tight">
                Upload Assets
              </h3>
            </div>
          </div>

          <div className="grid gap-3">
            <MiniAssetRow
              label="Profile Images"
              value={uploads.profileImages}
            />

            <MiniAssetRow
              label="Job Attachments"
              value={uploads.jobApplicationAttachments}
            />

            <MiniAssetRow
              label="Workforce Attachments"
              value={uploads.workforceApplicationAttachments}
            />

            <MiniAssetRow
              label="Document Uploads"
              value={uploads.workforceDocumentUploads}
            />
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Database className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Data Core
              </p>

              <h3 className="text-xl font-black italic uppercase tracking-tight">
                Composition
              </h3>
            </div>
          </div>

          <div className="grid gap-3">
            <MiniAssetRow label="Users" value={users.total} />
            <MiniAssetRow label="Jobs" value={jobs.total} />
            <MiniAssetRow label="Applications" value={applications.total} />

            <MiniAssetRow
              label="Workforce Apps"
              value={workforce.totalApplications}
            />
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl sm:p-8 xl:col-span-2">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Latest Signals
              </p>

              <h3 className="text-xl font-black italic uppercase tracking-tight">
                Recent Platform Activity
              </h3>
            </div>

            <Link
              href="/dashboard/super-admin/security"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
            >
              Security Center <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {(recent.users ?? []).slice(0, 3).map((user: any) => (
              <RecentRow
                key={user.id}
                title={user.fullName}
                subtitle={`${user.email} · ${user.role}`}
                meta={formatDate(user.createdAt)}
                href={`/dashboard/super-admin/users/${user.id}`}
                icon={UsersRound}
              />
            ))}

            {(recent.jobs ?? []).slice(0, 3).map((job: any) => (
              <RecentRow
                key={job.id}
                title={job.title}
                subtitle={`${job.status} · ${
                  job.locationName || "No location"
                }`}
                meta={formatDate(job.createdAt)}
                href={`/dashboard/super-admin/tasks/${job.id}`}
                icon={BriefcaseBusiness}
              />
            ))}

            {(recent.workforceApplications ?? [])
              .slice(0, 3)
              .map((application: any) => {
                const worker =
                  application.workerProfile?.user?.fullName ||
                  application.worker?.fullName ||
                  "Worker application";

                return (
                  <RecentRow
                    key={application.id}
                    title={worker}
                    subtitle={`Workforce status · ${application.status}`}
                    meta={formatDate(application.createdAt)}
                    href={`/dashboard/super-admin/workforce/applications/${application.id}`}
                    icon={BadgeCheck}
                  />
                );
              })}
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl sm:p-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Jump Points
          </p>

          <h3 className="mt-1 text-xl font-black italic uppercase tracking-tight">
            Governance Shortcuts
          </h3>

          <div className="mt-6 grid gap-3">
            <Shortcut
              href="/dashboard/super-admin/admins"
              icon={ShieldCheck}
              label="Manage Admins"
            />

            <Shortcut
              href="/dashboard/super-admin/tasks"
              icon={BriefcaseBusiness}
              label="Moderate Tasks"
            />

            <Shortcut
              href="/dashboard/super-admin/applications"
              icon={FileText}
              label="Review Applications"
            />

            <Shortcut
              href="/dashboard/super-admin/workforce"
              icon={Workflow}
              label="Workforce Registry"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function PulseRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-primary-foreground/20 pb-2">
      <span>{label}</span>

      <span className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
        {value}
      </span>
    </div>
  );
}

function TrustMetric({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = `${Math.min(100, Math.max(0, (value / max) * 100))}%`;

  return (
    <div className="mb-5 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>

        <p className="text-sm font-black italic">{value}/1000</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width }} />
      </div>
    </div>
  );
}

function MiniAssetRow({
  label,
  value,
}: {
  label: string;
  value?: number | null;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3">
      <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">
        {label}
      </span>

      <span className="text-sm font-black italic text-foreground">
        {formatNumber(value)}
      </span>
    </div>
  );
}

function Shortcut({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-border bg-background/60 px-4 py-3 transition hover:border-primary/30 hover:bg-primary/5"
    >
      <span className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </span>

      <ArrowUpRight className="h-4 w-4 text-primary opacity-0 transition group-hover:opacity-100" />
    </Link>
  );
}
