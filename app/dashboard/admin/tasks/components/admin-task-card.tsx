"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AdminTask } from "@/lib/api/admin/tasks";
import { formatDate, formatPay, humanize, statusClass } from "./admin-task-utils";

type AdminTaskCardProps = {
  task: AdminTask;
  actionLoading: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
};

export function AdminTaskCard({
  task,
  actionLoading,
  onApprove,
  onReject,
}: AdminTaskCardProps) {
  const canModerate = task.status === "PENDING_APPROVAL";
  const employerName =
    task.employer?.employerProfile?.companyName ||
    task.employer?.fullName ||
    "HireCore Local";
  const employerEmail = task.employer?.email || "No employer email";
  const applicationCount = task._count?.applications ?? 0;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]">
      <Link
        href={`/dashboard/admin/tasks/${task.id}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${task.title}`}
      />

      <div className="relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <FileText className="h-6 w-6 stroke-[1.5]" />
          </div>

          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              statusClass(task.status),
            )}
          >
            {humanize(task.status)}
          </Badge>
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Task
            </p>

            <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
              {task.title}
            </h2>
          </div>

          <p className="line-clamp-2 text-xs font-medium leading-6 text-muted-foreground">
            {task.description || "No task description was provided."}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
              {formatPay(task.pay)}
            </p>

            <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {task.locationName || "Unknown location"}
            </p>

            <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              {applicationCount} applications
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Badge
              variant="outline"
              className="rounded-lg text-[10px] font-black uppercase tracking-tight"
            >
              {humanize(task.assignmentType)}
            </Badge>

            <Badge
              variant="outline"
              className="rounded-lg text-[10px] font-black uppercase tracking-tight"
            >
              {humanize(task.locationVisibility)}
            </Badge>

            {task.benefits?.slice(0, 2).map((benefit) => (
              <Badge
                key={benefit}
                variant="outline"
                className="rounded-lg text-[10px] font-black uppercase tracking-tight"
              >
                {benefit}
              </Badge>
            ))}

            {task.benefits && task.benefits.length > 2 ? (
              <Badge
                variant="outline"
                className="rounded-lg text-[10px] font-black uppercase tracking-tight text-muted-foreground"
              >
                +{task.benefits.length - 2}
              </Badge>
            ) : null}
          </div>

          {task.moderationNote ? (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">
                {task.moderationNote}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {employerName}
            </p>

            <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
              {employerEmail} · Created {formatDate(task.createdAt)}
            </p>
          </div>

          {!canModerate ? (
            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              View Task
            </span>
          ) : null}
        </div>
      </div>

      {canModerate ? (
        <div className="relative z-20 mt-5 grid gap-2 border-t border-border/50 pt-4 sm:grid-cols-2">
          <Button
            disabled={actionLoading}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onApprove(task.id);
            }}
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            {actionLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>

          <Button
            disabled={actionLoading}
            variant="destructive"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onReject(task.id);
            }}
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      ) : null}
    </div>
  );
}