"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Gift,
  MapPin,
  Navigation,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from "lucide-react";

import { getJob } from "@/lib/api/jobs";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { ApplicationModal } from "@/components/applications/ApplicationModal";
import { GetWorkerProfileModal } from "@/components/profile/GetWorkerProfileModal";

type Job = any;

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

  if (value === "APPROXIMATE") return "Approximate area";
  if (value === "PUBLIC") return "Public location";
  if (value === "HIDDEN") return "Hidden until accepted";

  return value.replaceAll("_", " ").toLowerCase();
}

function getEmployerName(job: Job) {
  return (
    job?.employer?.employerProfile?.companyName ||
    job?.employer?.fullName ||
    "Employer"
  );
}

function isHireCoreSystemTask(job: Job) {
  const employerName = getEmployerName(job).toLowerCase();

  return (
    job?.assignmentType === "HIRECORE_ASSIGNED" ||
    employerName.includes("hirecore")
  );
}

function getTaskSummary(job: Job) {
  if (isHireCoreSystemTask(job)) {
    return "HireCore Local is helping a nearby business find a reliable worker for this role. Apply only if you match the skills, location, and availability needed for the work.";
  }

  const description = String(job?.description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !line.startsWith("*"));

  return (
    description ||
    "A local task opportunity is available. Review the details below and apply if you are a good fit."
  );
}

function extractNearbyAreas(description?: string | null) {
  const text = String(description || "");

  const knownAreas = [
    "Circle",
    "Caprice",
    "Newtown",
    "Nima",
    "Kokomlemle",
    "ATTC",
    "BlueCrest",
    "Adabraka",
  ];

  return knownAreas.filter((area) =>
    text.toLowerCase().includes(area.toLowerCase()),
  );
}

function extractSkillBullets(description?: string | null) {
  return String(description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("*"))
    .map((line) => line.replace(/^\*\s*/, "").trim())
    .filter(Boolean);
}

function getApplicationLabel(job: Job) {
  if (isHireCoreSystemTask(job)) {
    return "Apply for HireCore review";
  }

  return "Apply now";
}

function userHasWorkerPath(user: any) {
  return Boolean(
    user?.capabilities?.isWorker ||
    user?.accountTypes?.includes?.("WORKER") ||
    user?.workerProfile,
  );
}

function userHasWorkerProfile(user: any) {
  return Boolean(user?.workerProfile?.id || user?.workerProfile);
}

export default function TaskDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const jobId = params?.id;

  const { authenticated, user, loading: authLoading } = useAuth();

  const [job, setJob] = useState<Job>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [workerProfileOpen, setWorkerProfileOpen] = useState(false);

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

  const hasWorkerPath = userHasWorkerPath(user);
  const hasWorkerProfile = userHasWorkerProfile(user);

  const needsWorkerProfile = Boolean(
    authenticated && (!hasWorkerPath || !hasWorkerProfile),
  );

  const isJobOwner = Boolean(
    user?.id && job?.employer?.id && user.id === job.employer.id,
  );

  const employerName = useMemo(() => getEmployerName(job), [job]);
  const hireCoreManaged = useMemo(() => isHireCoreSystemTask(job), [job]);
  const summary = useMemo(() => getTaskSummary(job), [job]);

  const nearbyAreas = useMemo(
    () => extractNearbyAreas(job?.description),
    [job?.description],
  );

  const skills = useMemo(
    () => extractSkillBullets(job?.description),
    [job?.description],
  );

  const applyDisabledReason = useMemo(() => {
    if (!isOpen) return "This task is no longer open.";
    if (hasApplied) return "You have already applied to this task.";
    if (isJobOwner) return "You cannot apply to your own task.";

    return null;
  }, [isOpen, hasApplied, isJobOwner]);

  const handleApplyClick = () => {
    if (!jobId) return;

    if (!authenticated) {
      router.push(`/auth?redirect=/tasks/${jobId}`);
      return;
    }

    if (needsWorkerProfile) {
      setWorkerProfileOpen(true);
      return;
    }

    if (applyDisabledReason) return;

    setApplicationOpen(true);
  };

  const handleWorkerProfileSuccess = () => {
    setWorkerProfileOpen(false);

    if (!applyDisabledReason) {
      setApplicationOpen(true);
    }
  };

  if (loading || authLoading) {
    return <TaskDetailSkeleton />;
  }

  if (!job) {
    return <TaskNotFound loadError={loadError} />;
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
              <TaskHeroCard
                job={job}
                summary={summary}
                hireCoreManaged={hireCoreManaged}
                skills={skills}
              />

              <LocalFitCard
                locationName={job.locationName}
                locationVisibility={job.locationVisibility}
                nearbyAreas={nearbyAreas}
              />

              <TaskDescriptionCard description={job.description} />

              <BenefitsCard benefits={job.benefits} />

              {job.viewer?.myApplication && (
                <MyApplicationCard application={job.viewer.myApplication} />
              )}

              <ApplicationRequirementCard
                hireCoreManaged={hireCoreManaged}
                needsWorkerProfile={needsWorkerProfile}
              />
            </div>

            <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
              <ApplyCard
                job={job}
                authenticated={authenticated}
                needsWorkerProfile={needsWorkerProfile}
                applyDisabledReason={applyDisabledReason}
                onApply={handleApplyClick}
              />

              <TaskSourceCard
                employerName={employerName}
                hireCoreManaged={hireCoreManaged}
              />

              <TrustSignalsCard hireCoreManaged={hireCoreManaged} />
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

      <GetWorkerProfileModal
        open={workerProfileOpen}
        onClose={() => setWorkerProfileOpen(false)}
        onSuccess={handleWorkerProfileSuccess}
        reason="Only worker profiles can apply for tasks. Create your worker profile now, then continue your application."
      />
    </>
  );
}

function TaskHeroCard({
  job,
  summary,
  hireCoreManaged,
  skills,
}: {
  job: Job;
  summary: string;
  hireCoreManaged: boolean;
  skills: string[];
}) {
  const topSkills = skills.slice(0, 6);

  return (
    <article className="overflow-hidden rounded-[2.25rem] border border-border bg-card/85 p-6 shadow-(--shadow-card) backdrop-blur-2xl lg:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone="primary">
          {formatAssignmentType(job.assignmentType)}
        </StatusBadge>

        {hireCoreManaged && (
          <StatusBadge tone="success">
            <ShieldCheck className="h-3.5 w-3.5" />
            HireCore managed
          </StatusBadge>
        )}

        <StatusBadge tone={job.status === "OPEN" ? "neutral" : "danger"}>
          {job.status}
        </StatusBadge>

        {job.viewer?.hasApplied && (
          <StatusBadge tone="primary">
            <BadgeCheck className="h-3.5 w-3.5" />
            Applied
          </StatusBadge>
        )}
      </div>

      <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
        {job.title}
      </h1>

      <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
        {summary}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <InfoPill
          icon={MapPin}
          label="Work area"
          value={job.locationName || "Not provided"}
        />

        <InfoPill
          icon={Wallet}
          label="Expected pay"
          value={formatPay(job.pay)}
        />

        <InfoPill
          icon={Clock}
          label="Location details"
          value={formatVisibility(job.locationVisibility)}
        />
      </div>

      {topSkills.length > 0 && (
        <div className="mt-8 rounded-[1.5rem] border border-border bg-background/55 p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="text-sm font-black">Main skills needed</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {topSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground"
              >
                {skill}
              </span>
            ))}

            {skills.length > topSkills.length && (
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                +{skills.length - topSkills.length} more
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function LocalFitCard({
  locationName,
  locationVisibility,
  nearbyAreas,
}: {
  locationName?: string | null;
  locationVisibility?: string | null;
  nearbyAreas: string[];
}) {
  return (
    <article className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-(--shadow-card) backdrop-blur-xl">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-primary">
            Local fit
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">
            Best for workers nearby
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            This task is better for someone who can reach the workplace easily.
            The closer you are, the better your chances, because punctuality and
            transport costs matter for local work.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4 sm:min-w-56">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Navigation className="h-4 w-4 text-primary" />
            {locationName || "Location not provided"}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {formatVisibility(locationVisibility)}
          </p>
        </div>
      </div>

      {nearbyAreas.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {nearbyAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
            >
              {area}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function TaskDescriptionCard({ description }: { description?: string | null }) {
  return (
    <article className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-(--shadow-card) backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Briefcase className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-primary">
            Full details
          </p>
          <h2 className="text-xl font-black">Task description</h2>
        </div>
      </div>

      <div className="mt-6">
        <FormattedDescription description={description} />
      </div>
    </article>
  );
}

function FormattedDescription({
  description,
}: {
  description?: string | null;
}) {
  const lines = String(description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return (
      <p className="text-sm leading-7 text-muted-foreground">
        No detailed description was provided for this task.
      </p>
    );
  }

  const elements: React.ReactNode[] = [];
  let bulletGroup: string[] = [];

  const flushBullets = () => {
    if (!bulletGroup.length) return;

    elements.push(
      <ul
        key={`bullets-${elements.length}`}
        className="my-4 grid gap-2 sm:grid-cols-2"
      >
        {bulletGroup.map((item) => (
          <li
            key={item}
            className="flex gap-2 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>,
    );

    bulletGroup = [];
  };

  lines.forEach((line, index) => {
    if (line.startsWith("*")) {
      bulletGroup.push(line.replace(/^\*\s*/, "").trim());
      return;
    }

    flushBullets();

    const key = `${line}-${index}`;

    if (line.endsWith(":")) {
      elements.push(
        <h3 key={key} className="mt-6 text-sm font-black text-foreground">
          {line}
        </h3>,
      );
      return;
    }

    if (line.includes(":")) {
      const [label, ...rest] = line.split(":");
      const value = rest.join(":").trim();

      elements.push(
        <p key={key} className="text-sm leading-7 text-muted-foreground">
          <span className="font-black text-foreground">{label.trim()}:</span>{" "}
          {value}
        </p>,
      );
      return;
    }

    elements.push(
      <p key={key} className="text-sm leading-7 text-muted-foreground">
        {line}
      </p>,
    );
  });

  flushBullets();

  return <div className="space-y-3">{elements}</div>;
}

function BenefitsCard({ benefits }: { benefits?: string[] }) {
  return (
    <article className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-(--shadow-card) backdrop-blur-xl">
      <h2 className="flex items-center gap-2 text-xl font-black">
        <Gift className="h-5 w-5 text-primary" />
        Benefits
      </h2>

      {benefits?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {benefits.map((benefit) => (
            <span
              key={benefit}
              className="rounded-full border border-border bg-surface-soft px-4 py-2 text-sm text-muted-foreground"
            >
              {benefit}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          No extra benefits have been listed yet. Pay and work expectations are
          shown above.
        </p>
      )}
    </article>
  );
}

function MyApplicationCard({ application }: { application: any }) {
  return (
    <article className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
      <div className="flex gap-4">
        <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-primary" />
        <div>
          <h3 className="font-black">Your application</h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Status:{" "}
            <span className="font-bold text-foreground">
              {application.status}
            </span>
          </p>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Submitted on {formatDate(application.createdAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

function ApplicationRequirementCard({
  hireCoreManaged,
  needsWorkerProfile,
}: {
  hireCoreManaged: boolean;
  needsWorkerProfile: boolean;
}) {
  return (
    <article className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
      <div className="flex gap-4">
        <AlertCircle className="mt-1 h-5 w-5 shrink-0 text-primary" />

        <div>
          <h3 className="font-black">
            {needsWorkerProfile
              ? "Worker profile required"
              : hireCoreManaged
                ? "How HireCore review works"
                : "Application note"}
          </h3>

          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {needsWorkerProfile
              ? "You need a worker profile before applying. This helps HireCore understand your skills, location, and fit for local tasks."
              : hireCoreManaged
                ? "HireCore reviews applications, checks fit, and assigns the most suitable worker. Strong applicants may later be invited into the verified workforce."
                : "HireCore uses worker profiles, verification, and trust signals to keep the marketplace safer for everyone."}
          </p>
        </div>
      </div>
    </article>
  );
}

function ApplyCard({
  job,
  authenticated,
  needsWorkerProfile,
  applyDisabledReason,
  onApply,
}: {
  job: Job;
  authenticated: boolean;
  needsWorkerProfile: boolean;
  applyDisabledReason: string | null;
  onApply: () => void;
}) {
  const hasApplied = Boolean(job?.viewer?.hasApplied);
  const isOpen = job?.status === "OPEN";

  return (
    <div className="rounded-[2rem] border border-border bg-card/90 p-6 shadow-(--shadow-card) backdrop-blur-2xl">
      <p className="text-sm text-muted-foreground">Expected pay</p>

      <p className="mt-2 text-4xl font-black gradient-text">
        {formatPay(job.pay)}
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
          Status
        </p>

        <p className="mt-2 text-sm font-bold">
          {isOpen ? "Open for applications" : "Closed"}
        </p>
      </div>

      <Button
        disabled={Boolean(applyDisabledReason)}
        onClick={onApply}
        className="mt-6 h-12 w-full rounded-full bg-primary text-primary-foreground shadow-(--glow-primary)"
      >
        {needsWorkerProfile ? (
          <UserRound className="mr-2 h-4 w-4" />
        ) : (
          <Send className="mr-2 h-4 w-4" />
        )}

        {!authenticated
          ? "Sign in to apply"
          : hasApplied
            ? "Already applied"
            : needsWorkerProfile
              ? "Create worker profile"
              : isOpen
                ? getApplicationLabel(job)
                : "Closed"}
      </Button>

      <div className="mt-3">
        <ShareTaskButton job={job} />
      </div>

      {needsWorkerProfile && authenticated && !applyDisabledReason && (
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          You need a worker profile before applying. It only takes a minute.
        </p>
      )}

      {applyDisabledReason && authenticated && (
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          {applyDisabledReason}
        </p>
      )}

      {!authenticated && (
        <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
          Sign in or create an account before applying.
        </p>
      )}
    </div>
  );
}

function TaskSourceCard({
  employerName,
  hireCoreManaged,
}: {
  employerName: string;
  hireCoreManaged: boolean;
}) {
  return (
    <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-(--shadow-card) backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-black">
            {hireCoreManaged ? "Task source" : "Employer"}
          </h3>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {hireCoreManaged ? "Posted by HireCore Local" : employerName}
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Trust level
        </p>

        <p className="mt-2 text-xl font-black text-foreground">
          {hireCoreManaged ? "HireCore managed" : "Employer verified"}
        </p>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          {hireCoreManaged
            ? "HireCore is handling the review and assignment process for this task."
            : "This employer uses the marketplace flow and worker applications are tracked."}
        </p>
      </div>
    </div>
  );
}

function TrustSignalsCard({ hireCoreManaged }: { hireCoreManaged: boolean }) {
  return (
    <div className="rounded-[2rem] border border-border bg-card/80 p-6 shadow-(--shadow-card) backdrop-blur-xl">
      <h3 className="font-black">Trust signals</h3>

      <div className="mt-5 space-y-4">
        <TrustItem
          icon={ShieldCheck}
          text={
            hireCoreManaged
              ? "Reviewed and managed by HireCore"
              : "Reviewed by HireCore moderation"
          }
        />

        <TrustItem icon={BadgeCheck} text="Verified marketplace flow" />

        <TrustItem icon={Briefcase} text="Application tracking enabled" />
      </div>
    </div>
  );
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
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
  icon: ComponentType<{ className?: string }>;
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

function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "primary" | "success" | "neutral" | "danger";
}) {
  const className =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "success"
        ? "border-primary/20 bg-primary/10 text-primary"
        : tone === "danger"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-border bg-surface-soft text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function TaskNotFound({ loadError }: { loadError: string | null }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="max-w-md rounded-[2rem] border border-border bg-card/80 p-8 text-center shadow-(--shadow-card)">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Briefcase className="h-6 w-6" />
        </div>

        <h1 className="mt-6 text-2xl font-black">Task not found</h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {loadError || "This opportunity may have been removed or closed."}
        </p>

        <Button
          asChild
          className="mt-6 rounded-full bg-primary text-primary-foreground"
        >
          <Link href="/tasks">Browse tasks</Link>
        </Button>
      </div>
    </main>
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

            <div className="h-52 animate-pulse rounded-[2rem] border border-border bg-card/80" />
            <div className="h-72 animate-pulse rounded-[2rem] border border-border bg-card/80" />
            <div className="h-44 animate-pulse rounded-[2rem] border border-border bg-card/80" />
          </div>

          <div className="h-130 animate-pulse rounded-[2rem] border border-border bg-card/90" />
        </section>
      </div>
    </main>
  );
}

async function shareTask({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  if (typeof navigator !== "undefined" && navigator.share) {
    await navigator.share({ title, text, url });
    return;
  }

  await navigator.clipboard.writeText(url);
}

function ShareTaskButton({ job }: { job: any }) {
  const [shared, setShared] = useState(false);

  const taskUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/tasks/${job.id}`
      : "";

  const handleShare = async () => {
    const text = `${job.title} on HireCore Local • ${
      job.locationName || "Ghana"
    }`;

    try {
      await shareTask({
        title: `${job.title} | HireCore Local`,
        text,
        url: taskUrl,
      });

      setShared(true);
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // User cancelled native share. No need to show an error.
    }
  };

  return (
    <Button
      type="button"
      onClick={handleShare}
      variant="outline"
      className="h-12 w-full rounded-full border-border bg-background/70"
    >
      {shared ? (
        <>
          <Check className="mr-2 h-4 w-4 text-primary" />
          Link ready
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          Share task
        </>
      )}
    </Button>
  );
}
