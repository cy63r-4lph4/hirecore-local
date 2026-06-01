"use client";

import Link from "next/link";
import { useMemo } from "react";
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
  ShieldAlert,
  ShieldCheck,
  UserRound,
  UsersRound,
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

import { type JobStatus } from "@/lib/api/super-admin/tasks";
import { useSuperAdminTaskDetails } from "@/hooks/super-admin/use-super-admin-task-details";

const taskStatusStyles: Record<JobStatus, string> = {
  OPEN: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED:
    "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
  PENDING_APPROVAL:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
};

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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="border-border/70 bg-card/80 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationCard({
  application,
  updating,
  onStatusChange,
}: {
  application: SuperAdminApplication;
  updating: boolean;
  onStatusChange: (status: ApplicationStatus) => void;
}) {
  const worker = application.worker;
  const profile = worker?.workerProfile;
  const attachments = application.attachments ?? [];

  return (
    <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
      <CardContent className="p-0">
        <div className="flex flex-col gap-5 border-b border-border/70 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  {worker?.fullName || "Unnamed worker"}
                </h3>

                {profile?.isVerified ? (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                    Verified
                  </Badge>
                ) : null}

                {profile?.isWorkforceMember ? (
                  <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-700 hover:bg-blue-500/10 dark:text-blue-300">
                    Workforce
                  </Badge>
                ) : null}

                {profile?.isAvailable ? (
                  <Badge className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                    Available
                  </Badge>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {worker?.email || "No email"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {profile?.location || "No location"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  Applied {formatDate(application.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "w-fit capitalize",
              applicationStatusStyles[application.status],
            )}
          >
            {humanize(application.status)}
          </Badge>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Application message
            </p>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {application.message || "No message was provided."}
            </p>
          </div>

          {profile?.bio ? (
            <div>
              <p className="text-sm font-medium text-foreground">Worker bio</p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {profile.bio}
              </p>
            </div>
          ) : null}

          {profile?.skills?.length ? (
            <div>
              <p className="text-sm font-medium text-foreground">Skills</p>

              <div className="mt-3 flex flex-wrap gap-2">
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
            </div>
          ) : null}

          {attachments.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                Attachments
              </p>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <FileText className="h-4 w-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {attachment.asset?.originalName || "Attachment"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.asset?.mimeType || "Unknown type"} ·{" "}
                        {formatFileSize(attachment.asset?.sizeBytes)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {application.statusHistory?.length ? (
            <div>
              <p className="text-sm font-medium text-foreground">
                Status history
              </p>

              <div className="mt-3 space-y-2">
                {application.statusHistory.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm"
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
                      <p className="mt-2 text-muted-foreground">{item.note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              disabled={updating || application.status === "ACCEPTED"}
              onClick={() => onStatusChange("ACCEPTED")}
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
              onClick={() => onStatusChange("IN_PROGRESS")}
              className="gap-2"
            >
              <Clock3 className="h-4 w-4" />
              In progress
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={updating || application.status === "COMPLETED"}
              onClick={() => onStatusChange("COMPLETED")}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Complete
            </Button>

            <Button
              size="sm"
              variant="destructive"
              disabled={updating || application.status === "REJECTED"}
              onClick={() => onStatusChange("REJECTED")}
              className="gap-2"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuperAdminTaskDetailsPage() {
  const params = useParams<{ id: string }>();
  const taskId = params.id;

  const {
    task,
    applications,
    loading,
    error,
    updatingApplicationId,
    refetch,
    changeApplicationStatus,
  } = useSuperAdminTaskDetails(taskId);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((item) => item.status === "PENDING").length,
      accepted: applications.filter((item) => item.status === "ACCEPTED")
        .length,
    };
  }, [applications]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg border-border/70 bg-card/80 text-center shadow-sm">
          <CardContent className="space-y-5 p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <XCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Could not load task
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {error || "This task may no longer exist."}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/super-admin/tasks">Back to tasks</Link>
              </Button>

              <Button onClick={refetch}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const employer = task.employer;
  const employerProfile = employer?.employerProfile;
  const assignedWorker = task.assignedWorker;
  const assignedProfile = assignedWorker?.workerProfile;

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--muted)/0.65),transparent_30%)]" />

        <div className="relative z-10 space-y-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 px-0">
            <Link href="/dashboard/super-admin/tasks">
              <ArrowLeft className="h-4 w-4" />
              Back to tasks
            </Link>
          </Button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("capitalize", taskStatusStyles[task.status])}
                >
                  {humanize(task.status)}
                </Badge>

                <Badge variant="secondary" className="capitalize">
                  {humanize(task.assignmentType)}
                </Badge>

                <Badge variant="secondary" className="capitalize">
                  {humanize(task.locationVisibility)}
                </Badge>
              </div>

              <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {task.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                {task.description || "No description has been provided."}
              </p>

              {task.benefits?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {task.benefits.map((benefit) => (
                    <Badge
                      key={benefit}
                      variant="outline"
                      className="rounded-full bg-background/60 px-3 py-1 capitalize"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/70 p-5 shadow-sm lg:min-w-72">
              <p className="text-sm text-muted-foreground">Pay</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {formatPay(task.pay)}
              </p>

              <div className="mt-5 space-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {task.locationName || "Location hidden"}
                </span>

                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Created {formatDate(task.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {task.moderationNote ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">Moderation note</p>
                  <p className="mt-1 leading-6">{task.moderationNote}</p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={UsersRound}
          label="Total applications"
          value={task._count?.applications ?? stats.total}
        />
        <StatCard icon={Clock3} label="Pending reviews" value={stats.pending} />
        <StatCard
          icon={CheckCircle2}
          label="Accepted applications"
          value={stats.accepted}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Applications
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Review everyone who applied for this task.
            </p>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  updating={updatingApplicationId === application.id}
                  onStatusChange={(status) =>
                    changeApplicationStatus(application.id, status)
                  }
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-border/80 bg-card/60">
              <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <UsersRound className="h-7 w-7" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  No applications yet
                </h3>

                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  This task has not received applications yet. Once workers
                  apply, they will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Employer
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The account that posted this task.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {employer?.fullName || "Unknown employer"}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {employer?.email || "No email"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-right text-foreground">
                    {employer?.phoneNumber || "Not provided"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Company</span>
                  <span className="text-right text-foreground">
                    {employerProfile?.companyName || "Not provided"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="text-right text-foreground">
                    {employerProfile?.isVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Trust score</span>
                  <span className="text-right text-foreground">
                    {employerProfile?.trustScore ?? "N/A"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Assignment
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Worker currently assigned to this task.
                </p>
              </div>

              {assignedWorker ? (
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {assignedWorker.fullName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {assignedWorker.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No worker has been assigned to this task yet.
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Assignment type</span>
                  <span className="text-right capitalize text-foreground">
                    {humanize(task.assignmentType)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Worker verified
                  </span>
                  <span className="text-right text-foreground">
                    {assignedProfile?.isVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">
                    Workforce member
                  </span>
                  <span className="text-right text-foreground">
                    {assignedProfile?.isWorkforceMember ? "Yes" : "No"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="text-right text-foreground">
                    {formatDate(task.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Moderation
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Approval and review trail.
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Approved by</span>
                  <span className="text-right text-foreground">
                    {task.approvedByAdmin?.fullName || "Not approved"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Moderated by</span>
                  <span className="text-right text-foreground">
                    {task.moderatedByAdmin?.fullName || "Not moderated"}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Created</span>
                  <span className="text-right text-foreground">
                    {formatDate(task.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Updated</span>
                  <span className="text-right text-foreground">
                    {formatDate(task.updatedAt)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}