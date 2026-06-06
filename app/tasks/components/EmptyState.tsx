import { Briefcase } from "lucide-react";

export function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-border bg-card/80 p-10 text-center shadow-(--shadow-card) backdrop-blur-xl sm:p-16">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Briefcase className="h-7 w-7" aria-hidden />
      </div>

      <h3 className="text-xl font-black">No tasks found</h3>

      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
        Try different search terms or switch to a different assignment type.
      </p>
    </div>
  );
}