import { Suspense } from "react";
import { Loader2, Briefcase } from "lucide-react";

import TasksClient from "./tasks-client";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksFallback />}>
      <TasksClient />
    </Suspense>
  );
}

function TasksFallback() {
  return (
    <main className="min-h-screen bg-background px-4 pb-32 pt-32 text-foreground sm:px-6">
      <section className="mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Briefcase className="h-8 w-8" />
        </div>

        <h1 className="text-3xl font-black tracking-tight">
          Loading tasks
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          Preparing local opportunities...
        </p>

        <div className="mt-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    </main>
  );
}