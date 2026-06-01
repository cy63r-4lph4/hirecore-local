"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Clock,
  Gift,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { getJob } from "@/lib/api/jobs";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ApplicationModal } from "@/components/applications/ApplicationModal";

function formatPay(value: unknown) {
  if (value === null || value === undefined) return "GHS —";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return `GHS ${String(value)}`;
  }

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatAssignmentType(value?: string | null) {
  if (!value) return "Task";

  if (value === "OPEN") return "Open marketplace";
  if (value === "HIRECORE_ASSIGNED") return "HireCore assigned";

  return value.replaceAll("_", " ");
}

function formatVisibility(value?: string | null) {
  if (!value) return "Not specified";

  return value.replaceAll("_", " ").toLowerCase();
}

function getEmployerTrust(job: any): number | null {
  return job?.employer?.employerProfile?.trustScore ?? null;
}

function getEmployerName(job: any) {
  return (
    job?.employer?.employerProfile?.companyName ||
    job?.employer?.fullName ||
    "Employer"
  );
}

function getTrustLabel(score: number | null) {
  if (score === null || score === undefined) return "New employer";
  if (score >= 600) return "Strong trust";
  if (score >= 350) return "Trusted employer";
  if (score >= 180) return "Rising trust";
  return "Foundation trust";
}

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const jobId = params?.id;

  const { authenticated, user, loading: authLoading } = useAuth();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);

  const loadJob = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    setLoadError(null);

    try {
      const data = await getJob(jobId);
      setJob(data);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "This opportunity may have been removed or closed.";

      setJob(null);
      setLoadError(Array.isArray(message) ? message.join(", ") : message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    void loadJob();
  }, [loadJob]);

  const isOpen = job?.status === "OPEN";
  const hasApplied = Boolean(job?.viewer?.hasApplied);
  const isWorker = Boolean(user?.capabilities?.isWorker || user?.workerProfile);
  const isEmployer = Boolean(
    user?.capabilities?.isEmployer || user?.employerProfile,
  );

  const isJobOwner = Boolean(
    user?.id && job?.employer?.id && user.id === job.employer.id,
  );

  const employerTrust = useMemo(() => getEmployerTrust(job), [job]);
  const employerName = useMemo(() => getEmployerName(job), [job]);

  const applyDisabledReason = useMemo(() => {
    if (!isOpen) return "This task is no longer open.";
    if (hasApplied) return "You have already applied to this task.";
    if (isJobOwner) return "You cannot apply to your own task.";
    if (authenticated && !isWorker) {
      return "Only worker profiles can apply to tasks.";
    }

    return null;
  }, [isOpen, hasApplied, isJobOwner, authenticated, isWorker]);

  const handleApplyClick = () => {
    if (!jobId) return;

    if (!authenticated) {
      router.push(`/auth?redirect=/tasks/${jobId}`);
      return;
    }

    if (applyDisabledReason) return;

    setApplicationOpen(true);
  };

  if (loading || authLoading) {
    return <TaskDetailSkeleton />;
  }

  if (!job) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md rounded-[2rem] border border-border bg-card/80 p-8 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <Briefcase className="h-6 w-6" />
          </div>

          <h1 className="mt-6 text-2xl font-black">Task not found</h1>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {loadError || "This opportunity may have been removed or closed."}
          </p>

          <Button asChild className="mt-6 rounded-full bg-primary text-primary-foreground">
            <Link href="/tasks">Browse tasks</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-28 text-foreground sm:px-6 lg:pt-36">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,hsl(var(--primary)/0.14),transparent_32%),radial-gradient(circle_at_85%_18%,hsl(var(--secondary)/0.12),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/tasks"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to tasks
          </Link>

          <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-6">
              <article className="overflow-hidden rounded-[2.25rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl lg:p-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {formatAssignmentType(job.assignmentType)}
                  </span>

                  <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted-foreground">
                    {job.status}
                  </span>

                  {hasApplied && (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Applied
                    </span>
                  )}
                </div>

                <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                  {job.title}
                </h1>

                <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  {job.description}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <InfoPill
                    icon={MapPin}
                    label="Location"
                    value={job.locationName || "Not provided"}
                  />

                  <InfoPill
                    icon={Wallet}
                    label="Pay"
                    value={formatPay(job.pay)}
                  />

                  <InfoPill
                    icon={Clock}
                    label="Location visibility"
                    value={formatVisibility(job.locationVisibility)}
                  />
                </div>
              </article>

              <article className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl">
                <h2 className="text-xl font-black">Task description</h2>

                <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
                  {String(job.description || "")
                    .split("\n")
                    .filter(Boolean)
                    .map((line, index) => (
                      <p key={`${line}-${index}`}>{line}</p>
                    ))}
                </div>
              </article>

              <article className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl">
                <h2 className="flex items-center gap-2 text-xl font-black">
                  <Gift className="h-5 w-5 text-primary" />
                  Benefits
                </h2>

                {job.benefits?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {job.benefits.map((benefit: string) => (
                      <span
                        key={benefit}
                        className="rounded-full border border-border bg-surface-soft px-4 py-2 text-sm text-muted-foreground"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No extra benefits listed for this task.
                  </p>
                )}
              </article>

              {job.viewer?.myApplication && (
                <article className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
                  <div className="flex gap-4">
                    <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-black">Your application</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Status:{" "}
                        <span className="font-bold text-foreground">
                          {job.viewer.myApplication.status}
                        </span>
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Submitted on{" "}
                        {formatDate(job.viewer.myApplication.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              )}

              <article className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
                <div className="flex gap-4">
                  <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-black">Application requirement</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      You need a worker profile before applying. HireCore uses
                      worker profiles, verification, and trust signals to keep
                      the marketplace safer for everyone.
                    </p>
                  </div>
                </div>
              </article>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-[var(--shadow-card)] backdrop-blur-2xl">
                <p className="text-sm text-muted-foreground">Task pay</p>

                <p className="mt-2 text-4xl font-black gradient-text">
                  {formatPay(job.pay)}
                </p>

                <Button
                  disabled={Boolean(applyDisabledReason)}
                  onClick={handleApplyClick}
                  className="mt-6 h-12 w-full rounded-full bg-primary text-primary-foreground shadow-[var(--glow-primary)]"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {!authenticated
                    ? "Sign in to apply"
                    : hasApplied
                      ? "Already applied"
                      : isOpen
                        ? "Apply now"
                        : "Closed"}
                </Button>

                {applyDisabledReason && authenticated && (
                  <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                    {applyDisabledReason}
                  </p>
                )}

                {!authenticated && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Sign in required before applying.
                  </p>
                )}
              </div>

              <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black">Employer</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {employerName}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Employer trust
                  </p>

                  <p className="mt-2 text-2xl font-black text-foreground">
                    {employerTrust ?? "—"}
                    {employerTrust !== null && (
                      <span className="ml-1 text-sm text-muted-foreground">
                        /1000
                      </span>
                    )}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-primary">
                    {getTrustLabel(employerTrust)}
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-[var(--shadow-card)] backdrop-blur-xl">
                <h3 className="font-black">Trust signals</h3>

                <div className="mt-5 space-y-4">
                  <TrustItem
                    icon={ShieldCheck}
                    text="Reviewed by HireCore moderation"
                  />

                  <TrustItem
                    icon={BadgeCheck}
                    text="Verified marketplace flow"
                  />

                  <TrustItem
                    icon={Briefcase}
                    text="Application tracking enabled"
                  />
                </div>
              </div>
            </aside>
          </section>
        </div>
      </main>

      <ApplicationModal
        open={applicationOpen}
        jobId={job.id}
        jobTitle={job.title}
        onClose={() => setApplicationOpen(false)}
        onSuccess={loadJob}
      />
    </>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <Icon className="h-5 w-5 text-primary" />

      <p className="mt-3 text-xs text-muted-foreground">{label}</p>

      <p className="mt-1 truncate text-sm font-bold">{value || "—"}</p>
    </div>
  );
}

function TrustItem({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      {text}
    </div>
  );
}

function TaskDetailSkeleton() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-4 pb-24 pt-28 text-foreground sm:px-6 lg:pt-36">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-6 h-10 w-36 animate-pulse rounded-full bg-muted" />

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <div className="rounded-[2.25rem] border border-border bg-card/80 p-6 lg:p-8">
              <div className="h-6 w-44 animate-pulse rounded-full bg-muted" />
              <div className="mt-6 h-14 w-4/5 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-5 w-3/5 animate-pulse rounded bg-muted" />

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            </div>

            <div className="h-64 animate-pulse rounded-[2rem] border border-border bg-card/80" />
            <div className="h-44 animate-pulse rounded-[2rem] border border-border bg-card/80" />
          </div>

          <div className="h-[460px] animate-pulse rounded-[2rem] border border-border bg-card/90" />
        </section>
      </div>
    </main>
  );
}