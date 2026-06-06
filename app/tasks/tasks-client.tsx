"use client";

import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  Briefcase,
  Loader2,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { useJobs } from "@/hooks/useJobs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AssignmentType, Job, JobsQuery } from "@/lib/api/jobs";

import { TaskCard } from "./components/TaskCard";
import { TaskCardSkeleton } from "./components/TaskCardSkeleton";
import { EmptyState } from "./components/EmptyState";
import { TrustFeature } from "./components/TrustFeature";
import {
  getEmployerName,
  getEmployerTrust,
} from "./utils/task-formatters";

const ASSIGNMENT_FILTERS = [
  { value: "all", label: "All tasks" },
  { value: "OPEN", label: "Open marketplace" },
  { value: "HIRECORE_ASSIGNED", label: "HireCore assigned" },
] as const;

type AssignmentFilter = (typeof ASSIGNMENT_FILTERS)[number]["value"];

export default function TasksClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const keyword = searchParams.get("q") ?? "";
  const assignmentType = (searchParams.get("type") ??
    "all") as AssignmentFilter;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [draftSearch, setDraftSearch] = useState(keyword);

  useEffect(() => {
    setDraftSearch(keyword);
  }, [keyword]);

  const query = useMemo<JobsQuery>(
    () => ({
      status: "OPEN",
      keyword: keyword || undefined,
      assignmentType:
        assignmentType === "all"
          ? undefined
          : (assignmentType as AssignmentType),
      page,
      limit: 12,
    }),
    [keyword, assignmentType, page],
  );

  const { jobs = [], meta, loading, error } = useJobs(query);

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 320, behavior: "smooth" });
    }

    const queryString = params.toString();

    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
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
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -left-64 -top-64 h-150 w-150 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-32 top-0 h-125 w-125 rounded-full bg-secondary/20 blur-[100px]" />
        <div className="absolute left-1/2 top-96 h-75 w-75 -translate-x-1/2 rounded-full bg-primary/5 blur-[80px]" />
      </div>

      <section className="relative z-10 px-4 pb-20 pt-32 sm:px-6 lg:pt-40">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-primary">
            <ShieldCheck className="h-4 w-4" />
            Trusted local work
          </div>

          <h1 className="mx-auto max-w-4xl text-center text-5xl font-black leading-[1.08] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Find verified work <span className="text-primary">near you.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-8 text-muted-foreground sm:text-lg">
            Browse local tasks with clear pay, location signals, and HireCore
            trust checks before you apply.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-10 max-w-3xl">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/85 p-2 shadow-(--shadow-card) backdrop-blur-2xl transition focus-within:border-primary/40 focus-within:shadow-(--glow-primary)">
              <div className="relative flex-1">
                <Search
                  className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />

                <Input
                  value={draftSearch}
                  onChange={(event) => setDraftSearch(event.target.value)}
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
                className="h-12 shrink-0 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-(--glow-primary) transition hover:bg-primary/90 disabled:opacity-60"
              >
                {isBusy && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                )}
                Search
              </Button>
            </div>

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

      <section className="relative z-10 px-4 pb-32 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <TrustFeature
              icon={ShieldCheck}
              title="Reviewed tasks"
              text="Listings are checked so workers do not walk into blind opportunities."
            />

            <TrustFeature
              icon={BadgeCheck}
              title="Profile-based applications"
              text="Applications are connected to worker profiles and platform history."
            />

            <TrustFeature
              icon={MapPin}
              title="Local-first matching"
              text="Location, transport, and punctuality matter in every local task."
            />
          </div>

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <SlidersHorizontal
                className="h-4 w-4 text-muted-foreground"
                aria-hidden
              />

              <p className="text-sm text-muted-foreground">
                {isBusy ? (
                  "Updating opportunities…"
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
                Clear:{" "}
                <span className="font-bold text-foreground">"{keyword}"</span>
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="mb-8 rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {isBusy ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <TaskCardSkeleton key={index} />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {jobs.map((job: Job) => (
                <TaskCard
                  key={job.id}
                  job={job}
                  employerTrust={getEmployerTrust(job)}
                  employerName={getEmployerName(job)}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}

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

          {!isBusy && jobs.length > 0 && (
            <div className="mt-10 rounded-[2rem] border border-border bg-card/70 p-6 text-center shadow-(--shadow-card) backdrop-blur-xl">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Briefcase className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-black">
                More local opportunities are coming
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                HireCore Local is still growing its task network. Check back
                often for new work around Accra and nearby communities.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}