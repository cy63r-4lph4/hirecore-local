"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";

import { useSuperAdminApplications } from "@/hooks/super-admin/use-super-admin-applications";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ApplicationStatus,
  SuperAdminApplication,
} from "@/lib/api/super-admin/applications";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

type StatusFilter = ApplicationStatus | "ALL";

function statusClass(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
    case "ACCEPTED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
    case "REJECTED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "IN_PROGRESS":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500";
    case "COMPLETED":
      return "border-primary/20 bg-primary/10 text-primary";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function statusLabel(status: ApplicationStatus) {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    default:
      return status;
  }
}

function formatMoney(value?: string | number | null) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "GHS 0";

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function ApplicationCard({
  application,
}: {
  application: SuperAdminApplication;
}) {
  const workerName = application.worker?.fullName || "Unknown worker";
  const workerEmail = application.worker?.email || "No email";
  const taskTitle = application.job?.title || "Unknown task";
  const location = application.job?.locationName || "Unknown location";
  const pay = application.job?.pay;

  return (
    <Link
      href={`/dashboard/super-admin/applications/${application.id}`}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <FileText className="h-6 w-6 stroke-[1.5]" />
        </div>

        <Badge
          className={cn(
            "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
            statusClass(application.status),
          )}
        >
          {statusLabel(application.status)}
        </Badge>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Task
          </p>

          <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
            {taskTitle}
          </h2>
        </div>

        <p className="line-clamp-2 text-xs font-medium leading-6 text-muted-foreground">
          {application.message || "No application message was provided."}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary" />
            {workerName}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {location}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-black text-primary">
            {formatMoney(pay)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {workerEmail}
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Applied {formatDate(application.createdAt)}
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          View File
        </span>
      </div>
    </Link>
  );
}

export default function SuperAdminApplicationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [page, search, status],
  );

  const { applications, meta, loading, error, refetch } =
    useSuperAdminApplications(queryParams);

  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSuperAdminSummary();

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchSummary()]);
  };

  const totalApplications = summary?.applications.total ?? meta?.total ?? 0;
  const pendingApplications = summary?.applications.pending ?? 0;
  const acceptedApplications = summary?.applications.accepted ?? 0;
  const inProgressApplications = summary?.applications.inProgress ?? 0;
  const completedApplications = summary?.applications.completed ?? 0;
  const rejectedApplications = summary?.applications.rejected ?? 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Candidate Pipeline
          </p>

          <h1 className="mt-1 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
            Application <span className="text-primary">Registry</span>
          </h1>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Review every worker submission, task connection, status movement,
            and hiring signal from one command surface.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <Download size={14} className="mr-2" />
            Export Pipeline
          </Button>

          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={loading || summaryLoading}
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw
              size={14}
              className={cn(
                "mr-2",
                (loading || summaryLoading) && "animate-spin",
              )}
            />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {[
          { label: "Total Apps", val: totalApplications, icon: Activity },
          { label: "Pending", val: pendingApplications, icon: Clock },
          { label: "Accepted", val: acceptedApplications, icon: CheckCircle2 },
          { label: "In Progress", val: inProgressApplications, icon: Send },
          { label: "Completed", val: completedApplications, icon: ShieldCheck },
          {
            label: "Rejected",
            val: rejectedApplications,
            icon: XCircle,
            color: "text-destructive",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card/30 p-4 backdrop-blur-md"
          >
            <div className="mb-1 flex items-center gap-2">
              <stat.icon size={12} className="text-muted-foreground" />

              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {stat.label}
              </p>
            </div>

            <p
              className={cn(
                "text-lg font-black italic tracking-tighter",
                stat.color,
              )}
            >
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by worker, task, message, or email..."
              className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 xl:w-[210px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="IN_PROGRESS">In progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              className="h-12 rounded-xl px-6 font-bold text-muted-foreground hover:bg-accent"
            >
              <Filter size={16} />
              Filters
            </Button>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Pipeline Results
          </p>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0} Entries
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              Syncing Pipeline...
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-bold italic text-destructive">{error}</p>
          </div>
        ) : null}

        {!loading && !error && applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No application records found.
            </p>
          </div>
        ) : null}

        {!loading && !error && applications.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={loading || !meta || page >= Math.max(1, meta.totalPages)}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}