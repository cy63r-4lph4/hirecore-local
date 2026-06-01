"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorker } from "@/hooks/useWorker";

function getInitials(name?: string | null) {
  const source = name?.trim() || "Worker";

  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(date?: string | Date | null) {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate);
}

function getTrustTier(score: number | null) {
  if (score === null || score === undefined) {
    return {
      label: "Unknown",
      description: "Trust score is not available yet.",
    };
  }

  if (score >= 800) {
    return {
      label: "Elite",
      description: "A deeply trusted worker signal.",
    };
  }

  if (score >= 600) {
    return {
      label: "Strong",
      description: "A strong worker trust signal.",
    };
  }

  if (score >= 350) {
    return {
      label: "Trusted",
      description: "A dependable and growing worker profile.",
    };
  }

  if (score >= 180) {
    return {
      label: "Rising",
      description: "A profile building stronger credibility.",
    };
  }

  return {
    label: "Foundation",
    description: "A fresh trust profile still gathering signal.",
  };
}

function TrustScoreBadge({ score }: { score: number | null }) {
  const tier = getTrustTier(score);

  if (score === null || score === undefined) {
    return (
      <div className="rounded-2xl border border-border bg-background px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Trust score
        </p>

        <p className="mt-1 text-xl font-black tracking-tight text-foreground">
          —
        </p>

        <p className="mt-1 text-xs text-muted-foreground">{tier.label}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Trust score
      </p>

      <p className="mt-1 text-xl font-black tracking-tight text-foreground">
        {score}
        <span className="ml-1 text-xs font-bold text-muted-foreground">
          /1000
        </span>
      </p>

      <p className="mt-1 text-xs font-semibold text-primary">{tier.label}</p>
    </div>
  );
}

export default function WorkerProfilePage() {
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const { worker, loading, error } = useWorker(userId);

  if (loading) {
    return <WorkerProfileSkeleton />;
  }

  if (error || !worker) {
    return (
      <main className="min-h-screen bg-background px-4 pb-24 pt-32 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <BackToWorkersLink />

          <div className="mt-8 rounded-[2rem] border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
              <UserRound className="h-7 w-7 text-muted-foreground" />
            </div>

            <h1 className="mt-6 text-2xl font-black tracking-tight">
              Worker profile unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              {error || "We could not find this worker profile."}
            </p>

            <Button asChild className="mt-7 rounded-full">
              <Link href="/workers">Return to workers</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const trustTier = getTrustTier(worker.trustScore);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-32 sm:px-6 lg:px-8 lg:pt-40">
          <BackToWorkersLink />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] border border-border bg-muted text-3xl font-black tracking-tight text-foreground">
                    {getInitials(worker.fullName)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-3xl font-black tracking-[-0.045em] sm:text-4xl">
                        {worker.fullName}
                      </h1>

                      {worker.isVerified && (
                        <BadgeCheck className="h-6 w-6 shrink-0 text-primary" />
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {worker.location || "Location not provided"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        Joined {formatDate(worker.joinedAt)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {worker.isAvailable && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                          <BriefcaseBusiness className="h-3.5 w-3.5" />
                          Available for work
                        </span>
                      )}

                      {worker.isVerified && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified worker
                        </span>
                      )}

                      {worker.isWorkforceMember && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                          <UsersRound className="h-3.5 w-3.5" />
                          HireCore workforce
                        </span>
                      )}

                      {worker.accountTypes.includes("EMPLOYER") && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          Also an employer
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustScoreBadge score={worker.trustScore} />

                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Verification
                  </p>

                  <p className="mt-1 text-xl font-black tracking-tight text-foreground">
                    {worker.isVerified ? "Verified" : "Pending"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-background px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Availability
                  </p>

                  <p className="mt-1 text-xl font-black tracking-tight text-foreground">
                    {worker.isAvailable ? "Open" : "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-base font-black tracking-tight">
                    Worker signals
                  </h2>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Fast trust read before deeper review.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <SignalRow
                  icon={CheckCircle2}
                  label="Verified"
                  value={worker.isVerified ? "Yes" : "No"}
                  active={worker.isVerified}
                />

                <SignalRow
                  icon={BriefcaseBusiness}
                  label="Available"
                  value={worker.isAvailable ? "Yes" : "No"}
                  active={worker.isAvailable}
                />

                <SignalRow
                  icon={UsersRound}
                  label="Workforce member"
                  value={worker.isWorkforceMember ? "Yes" : "No"}
                  active={worker.isWorkforceMember}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Trust interpretation
                </p>

                <p className="mt-3 text-lg font-black tracking-tight text-foreground">
                  {trustTier.label}
                </p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {trustTier.description}
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Profile activity
                </p>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Created</span>

                    <span className="font-semibold text-foreground">
                      {formatDate(worker.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Updated</span>

                    <span className="font-semibold text-foreground">
                      {formatDate(worker.updatedAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Verified</span>

                    <span className="font-semibold text-foreground">
                      {worker.verifiedAt
                        ? formatDate(worker.verifiedAt)
                        : "Not yet"}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <article className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                  <UserRound className="h-5 w-5 text-foreground" />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight">
                    About this worker
                  </h2>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Public bio and work positioning.
                  </p>
                </div>
              </div>

              <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">
                {worker.bio ||
                  "This worker has not added a public bio yet. Their profile is live, but the story is still waiting to be written."}
              </p>
            </article>

            <article className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted">
                  <BriefcaseBusiness className="h-5 w-5 text-foreground" />
                </div>

                <div>
                  <h2 className="text-xl font-black tracking-tight">Skills</h2>

                  <p className="mt-0.5 text-sm text-muted-foreground">
                    What they publicly claim they can do.
                  </p>
                </div>
              </div>

              {worker.skills.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {worker.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-background px-5 py-6 text-sm text-muted-foreground">
                  No public skills listed yet.
                </div>
              )}
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-black tracking-tight">
                Quick profile summary
              </h2>

              <div className="mt-5 space-y-4 text-sm">
                <SummaryRow
                  label="Worker name"
                  value={worker.fullName || "Unnamed worker"}
                />

                <SummaryRow
                  label="Location"
                  value={worker.location || "Not provided"}
                />

                <SummaryRow
                  label="Trust score"
                  value={
                    worker.trustScore !== null
                      ? String(worker.trustScore)
                      : "Not available"
                  }
                />

                <SummaryRow
                  label="Workforce status"
                  value={
                    worker.isWorkforceMember
                      ? "HireCore workforce"
                      : "Independent worker"
                  }
                />
              </div>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}

function BackToWorkersLink() {
  return (
    <Link
      href="/workers"
      className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to workers
    </Link>
  );
}

function SignalRow({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            active
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>

        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>

      <span
        className={cn(
          "text-sm font-bold",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/70 pb-4 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>

      <span className="max-w-[55%] text-right font-semibold text-foreground">
        {value}
      </span>
    </div>
  );
}

function WorkerProfileSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/70">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-32 sm:px-6 lg:px-8 lg:pt-40">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-[2rem] border border-border bg-card p-6 sm:p-8">
              <div className="flex gap-5">
                <div className="h-24 w-24 animate-pulse rounded-[2rem] bg-muted" />

                <div className="flex-1 space-y-3 pt-2">
                  <div className="h-9 w-64 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-56 animate-pulse rounded bg-muted" />

                  <div className="flex gap-2">
                    <div className="h-7 w-28 animate-pulse rounded-full bg-muted" />
                    <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-24 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            </div>

            <div className="h-[420px] animate-pulse rounded-[2rem] border border-border bg-card" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-card" />
            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-card" />
          </div>

          <div className="h-80 animate-pulse rounded-[2rem] border border-border bg-card" />
        </div>
      </section>
    </main>
  );
}