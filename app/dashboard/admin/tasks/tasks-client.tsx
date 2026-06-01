"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";

import { useAdminTasks } from "@/hooks/admin/use-admin-tasks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { AdminTaskCard } from "./components/admin-task-card";
import {
  AdminTaskFilters,
  type StatusFilter,
} from "./components/admin-task-filters";
import { AdminTaskPagination } from "./components/admin-task-pagination";

export default function TasksClient() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [page, search, status],
  );

  const {
    tasks,
    meta,
    loading,
    error,
    actionLoadingId,
    refetch,
    approveTask,
    rejectTask,
  } = useAdminTasks(queryParams);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Admin Tasks
          </p>

          <h1 className="mt-1 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
            Task <span className="text-primary">Control</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
            Create HireCore-assigned seed tasks, review pending tasks, and keep
            the marketplace useful before employers fully arrive.
          </p>
        </section>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            asChild
            className="h-12 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest"
          >
            <Link href="/dashboard/admin/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={refetch}
            disabled={loading}
            className="h-12 rounded-xl border-border bg-card/50 px-5 text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw
              size={14}
              className={cn("mr-2", loading && "animate-spin")}
            />
            Sync
          </Button>
        </div>
      </div>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
        <AdminTaskFilters
          search={search}
          status={status}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Task Results
          </p>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0} Tasks
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              Loading tasks...
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
              No tasks found.
            </p>
          </div>
        ) : null}

        {!loading && !error && tasks.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <AdminTaskCard
                key={task.id}
                task={task}
                actionLoading={actionLoadingId === task.id}
                onApprove={approveTask}
                onReject={(id) =>
                  rejectTask(id, {
                    moderationNote: "Rejected by admin review.",
                  })
                }
              />
            ))}
          </div>
        ) : null}

        <AdminTaskPagination
          page={meta?.page ?? page}
          totalPages={meta?.totalPages ?? 1}
          loading={loading}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}