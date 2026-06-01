"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import {
  type ApplicationStatus,
  type SuperAdminApplication,
} from "@/lib/api/super-admin/applications";

import { useSuperAdminApplicationDetails } from "@/hooks/super-admin/use-super-admin-application-details";

const applicationStatusStyles: Record<ApplicationStatus, string> = {
  PENDING:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ACCEPTED:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  IN_PROGRESS:
    "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  COMPLETED:
    "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
};

function humanize(value?: string | null) {
  if (!value) return "Not specified";

  return value.toLowerCase().replaceAll("_", " ");
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPay(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return value;
}

function formatFileSize(sizeBytes?: number) {
  if (!sizeBytes) return "Unknown size";

  const kb = sizeBytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${kb.toFixed(1)} KB`;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function StatusActions({
  application,
  updating,
  onChange,
}: {
  application: SuperAdminApplication;
  updating: boolean;
  onChange: (status: ApplicationStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        disabled={updating || application.status === "ACCEPTED"}
        onClick={() => onChange("ACCEPTED")}
        className="gap-2"
      >
        {updating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        Accept
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={updating || application.status === "IN_PROGRESS"}
        onClick={() => onChange("IN_PROGRESS")}
        className="gap-2"
      >
        <Clock3 className="h-4 w-4" />
        In progress
      </Button>

      <Button
        size="sm"
        variant="outline"
        disabled={updating || application.status === "COMPLETED"}
        onClick={() => onChange("COMPLETED")}
        className="gap-2"
      >
        <ShieldCheck className="h-4 w-4" />
        Complete
      </Button>

      <Button
        size="sm"
        variant="destructive"
        disabled={updating || application.status === "REJECTED"}
        onClick={() => onChange("REJECTED")}
        className="gap-2"
      >
        <XCircle className="h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}

export default function SuperAdminApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;

  const {
    application,
    loading,
    error,
    updatingStatus,
    refetch,
    changeStatus,
  } = useSuperAdminApplicationDetails(applicationId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg border-border/70 bg-card/80 text-center shadow-sm">
          <CardContent className="space-y-5 p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <XCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Could not load application
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {error || "This application may no longer exist."}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/super-admin/applications">
                  Back to applications
                </Link>
              </Button>

              <Button onClick={refetch}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const worker = application.worker;
  const profile = worker?.workerProfile;
  const job = application.job;
  const attachments = application.attachments ?? [];
  const statusHistory = application.statusHistory ?? [];

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--muted)/0.65),transparent_30%)]" />

        <div className="relative z-10 space-y-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 px-0">
            <Link href="/dashboard/super-admin/applications">
              <ArrowLeft className="h-4 w-4" />
              Back to applications
            </Link>
          </Button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize",
                    applicationStatusStyles[application.status],
                  )}
                >
                  {humanize(application.status)}
                </Badge>

                {profile?.isVerified ? (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                    Verified worker
                  </Badge>
                ) : null}

                {profile?.isWorkforceMember ? (
                  <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300">
                    Workforce
                  </Badge>
                ) : null}
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {worker?.fullName || "Unnamed applicant"}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                Application for{" "}
                <span className="font-medium text-foreground">
                  {job?.title || "unknown task"}
                </span>
                . Review the applicant, message, attachments, and decision
                history before taking action.
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/70 p-5 shadow-sm lg:min-w-80">
              <p className="text-sm text-muted-foreground">Current status</p>
              <p className="mt-1 text-2xl font-semibold capitalize text-foreground">
                {humanize(application.status)}
              </p>

              <div className="mt-5">
                <StatusActions
                  application={application}
                  updating={updatingStatus}
                  onChange={changeStatus}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Application message
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  What the worker submitted when applying.
                </p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-sm leading-7 text-muted-foreground">
                  {application.message || "No message was provided."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Worker profile
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Skills, availability, and applicant context.
                </p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <UserRound className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {worker?.fullName || "Unnamed worker"}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-4 w-4" />
                        {worker?.email || "No email"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" />
                        {worker?.phoneNumber || "No phone"}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {profile?.location || "No location"}
                      </span>
                    </div>

                    {profile?.bio ? (
                      <p className="mt-4 text-sm leading-7 text-muted-foreground">
                        {profile.bio}
                      </p>
                    ) : null}

                    {profile?.skills?.length ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {profile.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="rounded-full px-3 py-1 capitalize"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Attachments
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Files submitted with this application.
                </p>
              </div>

              {attachments.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {attachment.asset?.originalName || "Attachment"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.asset?.mimeType || "Unknown type"} ·{" "}
                          {formatFileSize(attachment.asset?.sizeBytes)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Uploaded {formatDate(attachment.asset?.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No attachments were submitted with this application.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Status history
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review trail for this application.
                </p>
              </div>

              {statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-border/70 bg-background/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            applicationStatusStyles[item.status],
                          )}
                        >
                          {humanize(item.status)}
                        </Badge>

                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.changedAt)}
                        </span>
                      </div>

                      {item.note ? (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {item.note}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                  No status history has been recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Task summary
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The job this application belongs to.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {job?.title || "Unknown task"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {job?.locationName || "No location"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <DetailRow label="Pay" value={formatPay(job?.pay)} />
                <DetailRow label="Status" value={humanize(job?.status)} />
                <DetailRow
                  label="Assignment"
                  value={humanize(job?.assignmentType)}
                />
              </div>

              {job?.id ? (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/dashboard/super-admin/tasks/${job.id}`}>
                    View task details
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Applicant checks
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quick worker verification snapshot.
                </p>
              </div>

              <div className="space-y-3">
                <DetailRow
                  label="Available"
                  value={profile?.isAvailable ? "Yes" : "No"}
                />
                <DetailRow
                  label="Verified"
                  value={profile?.isVerified ? "Yes" : "No"}
                />
                <DetailRow
                  label="Workforce member"
                  value={profile?.isWorkforceMember ? "Yes" : "No"}
                />
                <DetailRow
                  label="Application ID"
                  value={application.id.slice(0, 8)}
                />
                <DetailRow
                  label="Applied"
                  value={formatDate(application.createdAt)}
                />
                <DetailRow
                  label="Updated"
                  value={formatDate(application.updatedAt)}
                />
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}