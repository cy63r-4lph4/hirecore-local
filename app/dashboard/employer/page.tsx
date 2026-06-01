"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  FilePlus2,
  Search,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { getWorkersPreview } from "@/lib/api/dashboard";
import {
  DashboardHero,
  DashboardLoading,
  DashboardLocked,
  DashboardNotice,
  DashboardPanel,
  EmptyPanel,
  QuickAction,
  StatCard,
} from "@/components/dashboard/dashboard-parts";
import { DashboardModeSwitcher } from "@/components/dashboard/DashboardModeSwitcher";

function getWorkersArray(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function EmployerDashboardPage() {
  const { user, loading, authenticated } = useAuth();

  const [workers, setWorkers] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const isEmployer = Boolean(
    user?.capabilities?.isEmployer || user?.employerProfile,
  );
  const hasBothProfiles = Boolean(
    user?.capabilities?.isWorker && user?.capabilities?.isEmployer,
  );

  useEffect(() => {
    if (loading) return;

    if (!authenticated || !isEmployer) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);

      try {
        const workersResponse = await getWorkersPreview();
        setWorkers(getWorkersArray(workersResponse));
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [loading, authenticated, isEmployer]);

  const employerTrust =
    user?.trust?.employerScore ?? user?.employerProfile?.trustScore ?? null;

  if (loading || pageLoading) {
    return <DashboardLoading label="Preparing employer dashboard..." />;
  }

  if (!authenticated) {
    return <DashboardLocked />;
  }

  if (!isEmployer) {
    return (
      <DashboardNotice
        title="Employer profile needed"
        description="You need an employer profile before using the employer dashboard."
        href="/onboarding/account-type"
        cta="Add employer profile"
      />
    );
  }

  return (
      <div className="mx-auto max-w-7xl">
        <DashboardHero
          eyebrow="Employer dashboard"
          title={`Build trusted local teams, ${user?.fullName || "employer"}.`}
          description="Find workers, prepare task posts, and strengthen the employer identity people will trust."
          icon={Building2}
        />
        {hasBothProfiles && (
          <div className="mt-6">
            <DashboardModeSwitcher currentMode="EMPLOYER" />
          </div>
        )}
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Star}
            label="Employer trust"
            value={`${employerTrust ?? "—"}/1000`}
            detail="Hiring trust visible to workers."
          />

          <StatCard
            icon={ShieldCheck}
            label="Verification"
            value={
              user?.capabilities?.isEmployerVerified ? "Verified" : "Pending"
            }
            detail="Employer review state."
          />

          <StatCard
            icon={UsersRound}
            label="Worker preview"
            value={String(workers.length)}
            detail="Available workers loaded."
          />

          <StatCard
            icon={BriefcaseBusiness}
            label="Task posting"
            value="Ready"
            detail="Create and manage task posts."
          />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <DashboardPanel
            title="Available workers"
            description="Workers ready for discovery."
            actionHref="/workers"
            actionLabel="Find workers"
          >
            {workers.length === 0 ? (
              <EmptyPanel
                title="No workers loaded"
                description="Open worker discovery to search the marketplace."
                href="/workers"
                cta="Find workers"
              />
            ) : (
              <div className="space-y-3">
                {workers.slice(0, 5).map((worker) => (
                  <Link
                    key={worker.id}
                    href={`/workers/${worker.id}`}
                    className="block rounded-2xl border border-border bg-background/70 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black">{worker.fullName}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Trust:{" "}
                          {worker.trust?.score ??
                            worker.workerProfile?.trustScore ??
                            "—"}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Employer profile"
            description="Your hiring identity."
            actionHref="/profile"
            actionLabel="Update"
          >
            <div className="rounded-2xl border border-border bg-background/70 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
                Company
              </p>

              <p className="mt-2 text-2xl font-black">
                {user?.employerProfile?.companyName || "Not added"}
              </p>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {user?.employerProfile?.location ||
                  "Employer location has not been added yet."}
              </p>
            </div>
          </DashboardPanel>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <QuickAction
            icon={Search}
            title="Find workers"
            description="Search skilled local workers."
            href="/workers"
          />

          <QuickAction
            icon={FilePlus2}
            title="Post a task"
            description="Create a new task listing."
            href="/tasks/new"
          />

          <QuickAction
            icon={ShieldCheck}
            title="Update profile"
            description="Strengthen employer trust."
            href="/profile"
          />
        </section>
      </div>
  );
}
