"use client";

import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  BadgeCheck,
  Briefcase,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  Loader2,
  ArrowRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssignmentType, Job, JobsQuery } from "@/lib/api/jobs";

// ─── Constants ────────────────────────────────────────────────────────────────

const ASSIGNMENT_FILTERS = [
  { value: "all", label: "All tasks" },
  { value: "OPEN", label: "Open marketplace" },
  { value: "HIRECORE_ASSIGNED", label: "HireCore assigned" },
] as const;

type AssignmentFilter = (typeof ASSIGNMENT_FILTERS)[number]["value"];

// ─── Pure Utility Functions ───────────────────────────────────────────────────

function formatPay(value: unknown): string {
  if (value === null || value === undefined) return "GHS —";
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return `GHS ${String(value)}`;
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatAssignmentType(value?: string | null): string {
  if (!value) return "Task";
  if (value === "OPEN") return "Open marketplace";
  if (value === "HIRECORE_ASSIGNED") return "HireCore assigned";
  return value.replaceAll("_", " ");
}

function getEmployerTrust(job: Job): number | null {
  return job.employer?.employerProfile?.trustScore ?? null;
}

function getEmployerName(job: Job): string {
  return (
    job.employer?.employerProfile?.companyName ||
    job.employer?.fullName ||
    "Employer"
  );
}

function getTrustLabel(score: number | null): string {
  if (score === null) return "New employer";
  if (score >= 600) return "Strong trust";
  if (score >= 350) return "Trusted";
  if (score >= 180) return "Rising trust";
  return "Foundation trust";
}

function getTrustBadgeText(score: number | null): string {
  return score === null ? "— trust" : `${score} trust`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns an employer-name initial abbreviation (up to 2 chars).
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TaskDiscoveryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Sync state from URL (single source of truth)
  const keyword = searchParams.get("q") ?? "";
  const assignmentType = (searchParams.get("type") ?? "all") as AssignmentFilter;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  // Draft state for the search input (buffered before submission)
  const [draftSearch, setDraftSearch] = useState(keyword);

  // Sync draftSearch when URL changes externally (e.g. browser Back)
  useEffect(() => {
    setDraftSearch(keyword);
  }, [keyword]);

  // Build the API query object, memoised on URL params
  const query = useMemo<JobsQuery>(
    () => ({
      status: "OPEN",
      keyword: keyword || undefined,
      assignmentType:
        assignmentType === "all" ? undefined : (assignmentType as AssignmentType),
      page,
      limit: 12,
    }),
    [keyword, assignmentType, page],
  );

  const { jobs = [], meta, loading, error } = useJobs(query);

  // Batch URL updates
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Scroll must happen outside startTransition (it's a DOM side-effect)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 320, behavior: "smooth" });
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateQueryParams({ q: draftSearch.trim(), page: "1" });
  };

  const handleAssignmentChange = (value: AssignmentFilter) => {
    updateQueryParams({ type: value, page: "1" });
  };

  const clearSearch = () => {
    setDraftSearch("");
    updateQueryParams({ q: null, page: "1" });
  };

  const total = meta?.total ?? jobs.length;
  const totalPages = meta?.totalPages ?? 1;
  const isBusy = loading || isPending;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">

      {/* ── Ambient background (uses primary so it adapts to theme) ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -left-64 -top-64 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 top-0 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[100px]" />
        <div className="absolute left-1/2 top-96 h-[300px] w-[700px] -translate-x-1/2 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      {/* ── Hero ── */}
      <section className="relative z-10 px-4 pb-24 pt-32 sm:px-6 lg:pt-40">
        <div className="mx-auto max-w-5xl">

          {/* Badge pill */}
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden />
            Live local work
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-center text-5xl font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Find verified work{" "}
            <span className="text-primary">near you.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
            Browse trusted local tasks ranked with employer trust signals, pay,
            and location — before you apply.
          </p>

          {/* ── Search bar ── */}
          <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-2 shadow-[var(--shadow-card)] backdrop-blur-2xl transition focus-within:border-primary/40 focus-within:shadow-[var(--glow-primary)]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                  placeholder="Search tasks, skills, locations…"
                  aria-label="Search tasks"
                  className="h-12 w-full rounded-xl border-0 bg-transparent pl-11 pr-4 focus-visible:ring-0"
                />
              </div>

              {draftSearch && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="rounded-xl p-2 text-muted-foreground transition hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <Button
                type="submit"
                disabled={isBusy}
                className="h-12 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-[var(--glow-primary)] transition hover:bg-primary/90 disabled:opacity-60"
              >
                {isBusy ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Search
              </Button>
            </div>

            {/* Assignment type pills */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {ASSIGNMENT_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleAssignmentChange(item.value)}
                  className={cn(
                    "shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    assignmentType === item.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ── Results ── */}
      <section className="relative z-10 px-4 pb-32 sm:px-6">
        <div className="mx-auto max-w-7xl">

          {/* Result meta row */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
              <p className="text-sm text-muted-foreground">
                {isBusy ? (
                  "Updating…"
                ) : (
                  <>
                    <span className="font-bold text-foreground">{total}</span>{" "}
                    {total === 1 ? "opportunity" : "opportunities"} found
                  </>
                )}
              </p>
            </div>

            {keyword && !isBusy && (
              <button
                type="button"
                onClick={clearSearch}
                className="flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted/30 hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear: <span className="font-bold text-foreground">"{keyword}"</span>
              </button>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div
              role="alert"
              className="mb-8 rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {/* Grid */}
          {isBusy ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job: Job) => {
                const employerTrust = getEmployerTrust(job);
                const employerName = getEmployerName(job);
                return (
                  <TaskCard
                    key={job.id}
                    job={job}
                    employerTrust={employerTrust}
                    employerName={employerName}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState />
          )}

          {/* Pagination */}
          {!isBusy && totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateQueryParams({ page: String(page - 1) })}
                className="rounded-full"
              >
                Previous
              </Button>

              <span className="text-sm font-semibold text-muted-foreground">
                {page} / {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => updateQueryParams({ page: String(page + 1) })}
                className="rounded-full"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────

interface TaskCardProps {
  job: Job;
  employerTrust: number | null;
  employerName: string;
}

function TaskCard({ job, employerTrust, employerName }: TaskCardProps) {
  const initials = getInitials(employerName);

  return (
    <Link
      href={`/tasks/${job.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/80 p-5 shadow-[var(--shadow-card)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
    >
      {/* Top row: icon + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase className="h-5 w-5" aria-hidden />
        </div>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          {formatAssignmentType(job.assignmentType)}
        </span>
      </div>

      {/* Title + description */}
      <div className="mt-5">
        <h3 className="line-clamp-2 text-lg font-black leading-snug tracking-tight transition-colors group-hover:text-primary">
          {job.title}
        </h3>
        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {job.description}
        </p>
      </div>

      {/* Employer trust block */}
      <div className="mt-5 rounded-xl border border-border bg-background/70 p-3">
        <div className="flex items-center gap-3">
          {/* Avatar circle */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Posted by
            </p>
            <p className="truncate text-sm font-bold text-foreground">
              {employerName}
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            {getTrustBadgeText(employerTrust)}
          </div>
        </div>
        <p className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <BadgeCheck className="h-3.5 w-3.5 text-primary" aria-hidden />
          {getTrustLabel(employerTrust)}
        </p>
      </div>

      {/* Vitals */}
      <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{job.locationName || "Location not provided"}</span>
        </li>
        <li className="flex items-center gap-2">
          <Wallet className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">{formatPay(job.pay)}</span>
        </li>
        <li className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="capitalize">{job.status?.toLowerCase()}</span>
        </li>
      </ul>

      {/* Benefits */}
      {job.benefits && job.benefits.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job.benefits.slice(0, 3).map((benefit: string) => (
            <span
              key={benefit}
              className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[11px] text-muted-foreground"
            >
              {benefit}
            </span>
          ))}
        </div>
      )}

      {/* Already applied banner */}
      {job.viewer?.hasApplied && (
        <div className="mt-4 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary">
          ✓ You've already applied
        </div>
      )}

      {/* Footer CTA */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-primary transition-all group-hover:gap-3">
          View details
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
        <ShieldCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TaskCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading task"
      className="flex min-h-[400px] flex-col justify-between rounded-2xl border border-border bg-card/80 p-5 shadow-[var(--shadow-card)]"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
          <div className="h-6 w-28 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-5 h-6 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-2.5 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-5 h-20 animate-pulse rounded-xl bg-muted" />
        <div className="mt-5 space-y-2.5">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-16 text-center shadow-[var(--shadow-card)]">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Briefcase className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="text-xl font-black">No tasks found</h3>
      <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
        Try different search terms or switch to a different assignment type.
      </p>
    </div>
  );
}