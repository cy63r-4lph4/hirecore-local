// app/dashboard/super-admin/tasks/page.tsx
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
  DollarSign,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";

import { useSuperAdminTasks } from "@/hooks/super-admin/use-super-admin-tasks";
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
  AssignmentType,
  JobStatus,
  SuperAdminTask,
} from "@/lib/api/super-admin/tasks";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

type StatusFilter = JobStatus | "ALL";
type AssignmentFilter = AssignmentType | "ALL";

function formatMoney(value: string | number) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "GHS 0";

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusClass(status: JobStatus) {
  switch (status) {
    case "OPEN":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
    case "PENDING_APPROVAL":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
    case "REJECTED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "CLOSED":
      return "border-border bg-muted/50 text-muted-foreground";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function statusLabel(status: JobStatus) {
  switch (status) {
    case "PENDING_APPROVAL":
      return "Pending";
    case "OPEN":
      return "Open";
    case "REJECTED":
      return "Rejected";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

function assignmentLabel(type: AssignmentType) {
  switch (type) {
    case "HIRECORE_ASSIGNED":
      return "Assigned";
    case "OPEN":
      return "Open";
    default:
      return type;
  }
}

function TaskCard({ task }: { task: SuperAdminTask }) {
  const applicationsCount = task._count?.applications ?? 0;

  return (
    <Link
      key={task.id}
      href={`/dashboard/super-admin/tasks/${task.id}`}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Briefcase className="h-6 w-6 stroke-[1.5]" />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              statusClass(task.status),
            )}
          >
            {statusLabel(task.status)}
          </Badge>

          <Badge className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-primary">
            {assignmentLabel(task.assignmentType)}
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
          {task.title}
        </h2>

        <p className="line-clamp-2 text-xs font-medium leading-6 text-muted-foreground">
          {task.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {task.locationName}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-black text-primary">
            <DollarSign className="h-3.5 w-3.5" />
            {formatMoney(task.pay)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-black">
            {applicationsCount}
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Applicants
          </span>
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          View Details
        </span>
      </div>
    </Link>
  );
}

export default function SuperAdminTasksPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [assignmentType, setAssignmentType] =
    useState<AssignmentFilter>("ALL");

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
      assignmentType:
        assignmentType === "ALL" ? undefined : assignmentType,
    }),
    [page, search, status, assignmentType],
  );

  const { tasks, meta, loading, error, refetch } =
    useSuperAdminTasks(queryParams);

  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSuperAdminSummary();

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchSummary()]);
  };

  const totalTasks = summary?.jobs.total ?? meta?.total ?? 0;
  const openTasks = summary?.jobs.open ?? 0;
  const pendingTasks = summary?.jobs.pendingApproval ?? 0;
  const rejectedTasks = summary?.jobs.rejected ?? 0;
  const totalApplications = summary?.applications.total ?? 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Network Registry
          </p>

          <h1 className="mt-1 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
            Task <span className="text-primary">Omni-View</span>
          </h1>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Authorized oversight of every active deployment in the ecosystem.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <Download size={14} className="mr-2" />
            Export Manifest
          </Button>

          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={loading || summaryLoading}
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw
              size={14}
              className={cn("mr-2", (loading || summaryLoading) && "animate-spin")}
            />
            Sync
          </Button>

          <Button
            asChild
            className="h-12 rounded-xl bg-primary px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
          >
            <Link href="/dashboard/admin/tasks/new">
              <Plus size={16} className="mr-2 stroke-[3]" />
              Create Entry
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Total Tasks", val: totalTasks, icon: Activity },
          { label: "Open", val: openTasks, icon: CheckCircle2 },
          { label: "Pending", val: pendingTasks, icon: Clock },
          {
            label: "Applicants",
            val: totalApplications,
            icon: Users,
          },
          {
            label: "Rejected",
            val: rejectedTasks,
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
              placeholder="Search registry by title, location, or status..."
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
              <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 xl:w-[190px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All status</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={assignmentType}
              onValueChange={(value) => {
                setAssignmentType(value as AssignmentFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 xl:w-[210px]">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All assignment</SelectItem>
                <SelectItem value="OPEN">Open application</SelectItem>
                <SelectItem value="HIRECORE_ASSIGNED">
                  HireCore assigned
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            className="h-12 rounded-xl px-6 font-bold text-muted-foreground hover:bg-accent"
          >
            <Filter size={16} />
            Filters
          </Button>
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Registry Results
          </p>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0} Entries
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              Syncing Registry...
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-bold italic text-destructive">{error}</p>
          </div>
        ) : null}

        {!loading && !error && tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No task records found.
            </p>
          </div>
        ) : null}

        {!loading && !error && tasks.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
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