"use client";

import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  Repeat2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { setStoredNavMode } from "@/lib/storage";

type DashboardModeSwitcherProps = {
  currentMode: "WORKER" | "EMPLOYER";
};

export function DashboardModeSwitcher({
  currentMode,
}: DashboardModeSwitcherProps) {
  const router = useRouter();

  const switchMode = () => {
    const nextMode = currentMode === "WORKER" ? "EMPLOYER" : "WORKER";

    setStoredNavMode(nextMode);

    router.push(
      nextMode === "WORKER"
        ? "/dashboard/worker"
        : "/dashboard/employer",
    );
  };

  const nextLabel =
    currentMode === "WORKER"
      ? "Switch to Employer Dashboard"
      : "Switch to Worker Dashboard";

  const CurrentIcon =
    currentMode === "WORKER" ? BriefcaseBusiness : Building2;

  return (
    <div className="rounded-[2rem] border border-border bg-card/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CurrentIcon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
              Dashboard mode
            </p>

            <p className="mt-1 text-lg font-black text-foreground">
              {currentMode === "WORKER"
                ? "Worker Dashboard"
                : "Employer Dashboard"}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={switchMode}
          variant="outline"
          className="h-11 rounded-full"
        >
          <Repeat2 className="mr-2 h-4 w-4" />
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}