import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  MapPin,
  Tag,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  cn,
  formatCurrency,
  formatRelativeDate,
  getTaskStatusColor,
  getTaskStatusLabel,
} from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  className?: string;
}

export default function TaskCard({ task, className }: TaskCardProps) {
  return (
    <Link href={`/tasks/${task.id}`} className="group block h-full">
      <Card
        className={cn(
          "flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-5 transition duration-300",
          "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            {task.category}
          </span>

          <span
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              getTaskStatusColor(task.status),
            )}
          >
            {getTaskStatusLabel(task.status)}
          </span>
        </div>

        <h3 className="mt-5 line-clamp-2 text-xl font-black tracking-tight transition group-hover:text-primary">
          {task.title}
        </h3>

        <div className="mt-5 space-y-2.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{task.location}</span>
          </div>

          {task.created_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{formatRelativeDate(task.created_at)}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between border-t border-border/80 pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Pay
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-foreground">
              {formatCurrency(task.pay)}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 text-sm font-semibold text-foreground transition group-hover:text-primary">
            View task
            <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function TaskCardSkeleton() {
  return (
    <Card className="rounded-[1.75rem] border border-border bg-card p-5">
      <div className="flex justify-between gap-3">
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-6 w-[88%] animate-pulse rounded bg-muted" />
        <div className="h-6 w-[70%] animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-5 space-y-2.5">
        <div className="h-4 w-44 animate-pulse rounded bg-muted" />
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-6 flex items-end justify-between border-t border-border/80 pt-5">
        <div className="space-y-2">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          <div className="h-7 w-24 animate-pulse rounded bg-muted" />
        </div>

        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    </Card>
  );
}