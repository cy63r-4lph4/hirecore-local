"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Search,
  UsersRound,
  X,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useWorkers } from "@/hooks/useWorkers";
import { WorkerCard, WorkerCardSkeleton } from "@/components/shared/worker-card";

type DiscoveryFilters = {
  available: boolean;
  verified: boolean;
  workforce: boolean;
};

const FILTER_OPTIONS: Array<{
  key: keyof DiscoveryFilters;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "available",
    label: "Available now",
    icon: BriefcaseBusiness,
  },
  {
    key: "verified",
    label: "Verified",
    icon: BadgeCheck,
  },
  {
    key: "workforce",
    label: "HireCore workforce",
    icon: UsersRound,
  },
];

export default function WorkerDiscoveryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 1. Single Source of Truth: Read directly from URL search parameters
  const keyword = searchParams.get("q") ?? "";
  const location = searchParams.get("loc") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  
  const filters = useMemo<DiscoveryFilters>(() => ({
    available: searchParams.get("available") === "true",
    verified: searchParams.get("verified") === "true",
    workforce: searchParams.get("workforce") === "true",
  }), [searchParams]);

  // Buffers for uncontrolled input changes until submitted
  const [draftKeyword, setDraftKeyword] = useState(keyword);
  const [draftLocation, setDraftLocation] = useState(location);

  // Keep input buffers synchronized if browser history actions change the URL
  useEffect(() => {
    setDraftKeyword(keyword);
    setDraftLocation(location);
  }, [keyword, location]);

  // 2. Fetch workers matching URL state boundaries
  const { workers = [], meta, loading, error } = useWorkers({
    keyword: keyword || undefined,
    location: location || undefined,
    available: filters.available ? true : undefined,
    verified: filters.verified ? true : undefined,
    workforce: filters.workforce ? true : undefined,
    page,
    limit: 12,
  });

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const hasSearchState = Boolean(keyword) || Boolean(location) || activeFilterCount > 0;
  const isSearchingOrLoading = loading || isPending;

  // 3. Centralized router engine to batch filter modifications smoothly
  const updateQueryParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === "false") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
      
      // Target viewport adjustment to keep results focused without fully resetting header
      const targetElement = document.getElementById("results-anchor");
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 350, behavior: "smooth" });
      }
    });
  };

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQueryParams({
      q: draftKeyword.trim(),
      loc: draftLocation.trim(),
      page: "1",
    });
  }

  function toggleFilter(key: keyof DiscoveryFilters) {
    updateQueryParams({
      [key]: !filters[key] ? "true" : null,
      page: "1",
    });
  }

  function clearDiscoveryState() {
    setDraftKeyword("");
    setDraftLocation("");
    
    // Wipe clean all search attributes
    const parametersToClear: Record<string, null> = { q: null, loc: null, page: null };
    FILTER_OPTIONS.forEach(({ key }) => {
      parametersToClear[key] = null;
    });
    
    updateQueryParams(parametersToClear);
  }

  const totalWorkers = meta?.total ?? workers.length;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Header Deck */}
      <section className="border-b border-border/70 relative">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-32 sm:px-6 lg:px-8 lg:pt-40">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
                <UsersRound className="h-3.5 w-3.5 text-primary" />
                Worker discovery
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Find people worth trusting with the work.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Search verified local workers by skill, location, availability, and HireCore workforce status. No noise. Just useful signals.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-sm hidden lg:block">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Better worker matching</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Narrow results before opening profiles, instead of browsing blind.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Console */}
          <form
            onSubmit={handleSearch}
            className="mt-10 rounded-[2rem] border border-border bg-card p-3 shadow-sm focus-within:border-primary/40 transition-colors duration-200"
          >
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={draftKeyword}
                  onChange={(event) => setDraftKeyword(event.target.value)}
                  placeholder="Search by name, skill, or worker bio..."
                  className="h-14 rounded-2xl border-border bg-background pl-11 text-sm focus-visible:ring-primary"
                  aria-label="Search by keyword"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={draftLocation}
                  onChange={(event) => setDraftLocation(event.target.value)}
                  placeholder="Location"
                  className="h-14 rounded-2xl border-border bg-background pl-11 text-sm focus-visible:ring-primary"
                  aria-label="Filter by location"
                />
              </div>

              <Button
                type="submit"
                disabled={isSearchingOrLoading}
                className="h-14 rounded-2xl px-7 text-sm font-semibold disabled:opacity-70 transition-opacity"
              >
                {isSearchingOrLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Search workers
              </Button>
            </div>

            {/* Quick Action Badges */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/80 pt-3">
              {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => {
                const active = filters[key];

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleFilter(key)}
                    className={cn(
                      "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}

              {hasSearchState && (
                <button
                  type="button"
                  onClick={clearDiscoveryState}
                  className="ml-auto inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Target Anchor for smooth viewport positioning on page change */}
      <div id="results-anchor" className="scroll-mt-6" />

      {/* Main Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Worker network</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isSearchingOrLoading
                ? "Updating network roster..."
                : `${totalWorkers} ${totalWorkers === 1 ? "worker" : "workers"} found`}
            </p>
          </div>

          {/* Active Query Breadcrumb Badges */}
          {hasSearchState && (
            <div className="flex flex-wrap gap-2 text-xs">
              {keyword && (
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                  Search: <strong className="text-foreground">"{keyword}"</strong>
                </span>
              )}

              {location && (
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                  Location: <strong className="text-foreground">"{location}"</strong>
                </span>
              )}

              {activeFilterCount > 0 && (
                <span className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground">
                  {activeFilterCount} active {activeFilterCount === 1 ? "filter" : "filters"}
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-3xl border border-destructive/20 bg-destructive/10 p-5 text-sm text-destructive">
            {error}
          </div>
        )}

        {isSearchingOrLoading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <WorkerCardSkeleton key={index} />
            ))}
          </div>
        ) : workers.length > 0 ? (
          <>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {workers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between rounded-3xl border border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span>
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={page <= 1}
                    onClick={() => updateQueryParams({ page: String(page - 1) })}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    className="rounded-full"
                    disabled={page >= totalPages}
                    onClick={() => updateQueryParams({ page: String(page + 1) })}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty Search Fallback */
          <div className="rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-5 text-xl font-black tracking-tight">No workers matched that search</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Loosen the filters, try a broader location query, or search by a more general skill category.
            </p>

            {hasSearchState && (
              <Button
                variant="outline"
                onClick={clearDiscoveryState}
                className="mt-6 rounded-full"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}