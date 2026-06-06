import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import type { Job } from "@/lib/api/jobs";
import {
  extractNearbyAreas,
  extractSkillBullets,
  formatAssignmentType,
  formatPay,
  formatPostedDate,
  getInitials,
  getTaskCardSummary,
  getTrustBadgeText,
  getTrustLabel,
  isHireCoreManaged,
} from "../utils/task-formatters";

interface TaskCardProps {
  job: Job;
  employerTrust: number | null;
  employerName: string;
}

export function TaskCard({ job, employerTrust, employerName }: TaskCardProps) {
  const initials = getInitials(employerName);
  const hireCoreManaged = isHireCoreManaged(job);
  const summary = getTaskCardSummary(job);
  const nearbyAreas = extractNearbyAreas(job.description);
  const skills = extractSkillBullets(job.description).slice(0, 3);

  return (
    <Link
      href={`/tasks/${job.id}`}
      className="group relative flex min-h-105 flex-col justify-between overflow-hidden rounded-[1.75rem] border border-border bg-card/85 p-5 shadow-(--shadow-card) backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-(--shadow-lift)"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-primary/10 to-transparent opacity-0 transition group-hover:opacity-100"
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
            <Briefcase className="h-5 w-5" aria-hidden />
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-3 py-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary/80">
              Pay
            </p>

            <p className="mt-0.5 text-sm font-black text-primary">
              {formatPay(job.pay)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="line-clamp-2 text-xl font-black leading-snug tracking-[-0.03em] transition-colors group-hover:text-primary">
            {job.title}
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
            {formatAssignmentType(job.assignmentType)}
          </span>

          {hireCoreManaged && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-bold text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" />
              HireCore managed
            </span>
          )}

          {job.viewer?.hasApplied && (
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
              Applied
            </span>
          )}
        </div>

        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] font-semibold text-muted-foreground"
              >
                <Sparkles className="h-3 w-3 text-primary" />
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="truncate">
              {job.locationName || "Location not provided"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>Posted {formatPostedDate(job.createdAt)}</span>
          </div>
        </div>

        {nearbyAreas.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {nearbyAreas.slice(0, 4).map((area) => (
              <span
                key={area}
                className="rounded-full border border-border bg-background/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground"
              >
                Near {area}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-border bg-background/70 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
              {hireCoreManaged ? "HC" : initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {hireCoreManaged ? "Task source" : "Posted by"}
              </p>

              <p className="truncate text-sm font-bold text-foreground">
                {hireCoreManaged ? "HireCore Local" : employerName}
              </p>
            </div>

            <div className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
              {getTrustBadgeText(job, employerTrust)}
            </div>
          </div>

          <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
            {getTrustLabel(job, employerTrust)}
          </p>
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between border-t border-border pt-5">
        <span className="flex items-center gap-1.5 text-sm font-bold text-primary transition-all group-hover:gap-3">
          View details
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        </span>

        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Wallet className="h-4 w-4 text-primary" />
          Open
        </div>
      </div>
    </Link>
  );
}
