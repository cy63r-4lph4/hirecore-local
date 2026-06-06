export function TaskCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading task"
      className="flex min-h-105 flex-col justify-between rounded-[1.75rem] border border-border bg-card/80 p-5 shadow-(--shadow-card)"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-muted" />
          <div className="h-10 w-28 animate-pulse rounded-xl bg-muted" />
        </div>

        <div className="mt-6 h-6 w-4/5 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-full animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-muted" />

        <div className="mt-5 flex gap-2">
          <div className="h-7 w-28 animate-pulse rounded-full bg-muted" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        </div>

        <div className="mt-5 space-y-3">
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        <div className="mt-5 h-20 animate-pulse rounded-2xl bg-muted" />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  );
}