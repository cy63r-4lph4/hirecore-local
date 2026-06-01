"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  FileText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { getMyApplications, getOpenJobs } from "@/lib/api/dashboard";
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

function formatTrust(score?: number | null) {
  if (score === null || score === undefined) return "—";
  return String(score);
}

function getApplicationsArray(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function getJobsArray(response: any) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

export default function WorkerDashboardPage() {
  const { user, loading, authenticated } = useAuth();

  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const isWorker = Boolean(user?.capabilities?.isWorker || user?.workerProfile);
  const hasBothProfiles = Boolean(
    user?.capabilities?.isWorker && user?.capabilities?.isEmployer,
  );

  useEffect(() => {
    if (loading) return;

    if (!authenticated || !isWorker) {
      setPageLoading(false);
      return;
    }

    const load = async () => {
      setPageLoading(true);

      try {
        const [applicationsResponse, jobsResponse] = await Promise.allSettled([
          getMyApplications(),
          getOpenJobs(),
        ]);

        if (applicationsResponse.status === "fulfilled") {
          setApplications(getApplicationsArray(applicationsResponse.value));
        }

        if (jobsResponse.status === "fulfilled") {
          setJobs(getJobsArray(jobsResponse.value));
        }
      } finally {
        setPageLoading(false);
      }
    };

    void load();
  }, [loading, authenticated, isWorker]);

  const workerTrust =
    user?.trust?.workerScore ?? user?.workerProfile?.trustScore ?? null;

  const profileCompletion = useMemo(() => {
    if (!user) return 0;

    const checks = [
      Boolean(user.fullName),
      Boolean(user.email),
      Boolean(user.phoneNumber),
      Boolean(user.profileImageUrl),
      Boolean(user.workerProfile?.bio),
      Boolean(user.workerProfile?.location),
      Boolean(user.workerProfile?.skills?.length),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [user]);

  if (loading || pageLoading) {
    return <DashboardLoading label="Preparing worker dashboard..." />;
  }

  if (!authenticated) {
    return <DashboardLocked />;
  }

  if (!isWorker) {
    return (
      <DashboardNotice
        title="Worker profile needed"
        description="You need a worker profile before using the worker dashboard."
        href="/onboarding/account-type"
        cta="Add worker profile"
      />
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-24 pt-32 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHero
          eyebrow="Worker dashboard"
          title={`Welcome back, ${user?.fullName || "worker"}.`}
          description="Track your applications, strengthen your worker identity, and find the next task worth your energy."
          icon={BriefcaseBusiness}
        />
        {hasBothProfiles && (
          <div className="mt-6">
            <DashboardModeSwitcher currentMode="WORKER" />
          </div>
        )}
        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Star}
            label="Worker trust"
            value={`${formatTrust(workerTrust)}/1000`}
            detail="Trust score visible to the marketplace."
          />

          <StatCard
            icon={FileText}
            label="Applications"
            value={String(applications.length)}
            detail="Tasks you have applied to."
          />

          <StatCard
            icon={BadgeCheck}
            label="Workforce"
            value={user?.capabilities?.isWorkforceMember ? "Active" : "Pending"}
            detail="HireCore workforce membership."
          />

          <StatCard
            icon={UserRound}
            label="Profile strength"
            value={`${profileCompletion}%`}
            detail="How complete your worker signal is."
          />
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <DashboardPanel
            title="Recent applications"
            description="Your newest task applications."
            actionHref="/my-applications"
            actionLabel="View all"
          >
            {applications.length === 0 ? (
              <EmptyPanel
                title="No applications yet"
                description="Browse tasks and submit your first application."
                href="/tasks"
                cta="Browse tasks"
              />
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((application) => (
                  <Link
                    key={application.id}
                    href={`/tasks/${application.job?.id || application.jobId}`}
                    className="block rounded-2xl border border-border bg-background/70 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black">
                          {application.job?.title || "Task"}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Status: {application.status || "PENDING"}
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
            title="Recommended open tasks"
            description="Fresh opportunities from the marketplace."
            actionHref="/tasks"
            actionLabel="Browse tasks"
          >
            {jobs.length === 0 ? (
              <EmptyPanel
                title="No tasks loaded"
                description="Check task discovery for live opportunities."
                href="/tasks"
                cta="Open tasks"
              />
            ) : (
              <div className="space-y-3">
                {jobs.slice(0, 5).map((job) => (
                  <Link
                    key={job.id}
                    href={`/tasks/${job.id}`}
                    className="block rounded-2xl border border-border bg-background/70 p-4 transition hover:border-primary/30 hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-black">{job.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {job.locationName || "Location not provided"}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-primary" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </DashboardPanel>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <QuickAction
            icon={Search}
            title="Browse tasks"
            description="Find open local work."
            href="/tasks"
          />

          <QuickAction
            icon={FileText}
            title="My applications"
            description="Track submitted applications."
            href="/my-applications"
          />

          <QuickAction
            icon={ShieldCheck}
            title="Update profile"
            description="Strengthen your public worker signal."
            href="/profile"
          />
        </section>
      </div>
    </main>
  );
}
