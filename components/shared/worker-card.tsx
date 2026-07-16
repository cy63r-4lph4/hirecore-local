import Link from "next/link";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  MapPin,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type PublicWorker = {
  id: string;
  fullName: string | null;
  profileImageUrl?: string | null;
  accountTypes?: string[];
  joinedAt?: string;
  createdAt?: string;
  workerProfile: {
    id: string;
    bio?: string | null;
    skills?: string[];
    location?: string | null;
    isAvailable: boolean;
    isVerified: boolean;
    isWorkforceMember: boolean;
    createdAt?: string;
    updatedAt?: string;
  };
};

interface WorkerCardProps {
  worker: PublicWorker;
  className?: string;
}

function getInitials(name?: string | null) {
  const source = name?.trim() || "Worker";

  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function WorkerCard({ worker, className }: WorkerCardProps) {
  const profile = worker.workerProfile;
  const visibleSkills = profile.skills?.slice(0, 4) ?? [];
  const hiddenSkillCount = Math.max((profile.skills?.length ?? 0) - 4, 0);

  return (
    <Link
      href={`/workers/${worker.id}`}
      className={cn(
        "group flex h-full flex-col rounded-[1.75rem] border border-border bg-card p-5 transition duration-300",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted text-base font-black tracking-tight text-foreground">
            {worker.profileImageUrl ? (
              <img
                src={worker.profileImageUrl}
                alt={worker.fullName || "Worker"}
                className="h-full w-full object-cover"
              />
            ) : (
              getInitials(worker.fullName)
            )}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-black tracking-tight transition group-hover:text-primary">
              {worker.fullName || "Unnamed worker"}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {profile.location || "Location not provided"}
              </span>
            </div>
          </div>
        </div>

        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {profile.isAvailable && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <BriefcaseBusiness className="h-3.5 w-3.5" />
            Available
          </span>
        )}

        {profile.isVerified && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </span>
        )}

        {profile.isWorkforceMember && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-foreground">
            <UsersRound className="h-3.5 w-3.5" />
            Workforce
          </span>
        )}
      </div>

      <p className="mt-5 line-clamp-3 min-h-18 text-sm leading-6 text-muted-foreground">
        {profile.bio ||
          "This worker has not added a public bio yet. Open the profile to review skills and work readiness."}
      </p>

      <div className="mt-5 flex min-h-18 flex-wrap gap-2">
        {visibleSkills.length > 0 ? (
          <>
            {visibleSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}

            {hiddenSkillCount > 0 && (
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                +{hiddenSkillCount}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground">
            No public skills listed
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/80 pt-4">
        <span className="text-sm font-semibold text-foreground transition group-hover:text-primary">
          View worker profile
        </span>

        {profile.isVerified ? (
          <ShieldCheck className="h-4.5 w-4.5 text-primary" />
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            Public profile
          </span>
        )}
      </div>
    </Link>
  );
}

export function WorkerCardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 animate-pulse rounded-2xl bg-muted" />

        <div className="flex-1 space-y-2 pt-1">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mt-5 space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-[92%] animate-pulse rounded bg-muted" />
        <div className="h-4 w-[75%] animate-pulse rounded bg-muted" />
      </div>

      <div className="mt-5 flex gap-2">
        <div className="h-7 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-7 w-16 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mt-6 border-t border-border/80 pt-4">
        <div className="h-4 w-36 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
