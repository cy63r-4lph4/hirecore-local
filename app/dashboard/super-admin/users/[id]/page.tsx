"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronRight,
  Clock,
  FileText,
  Laptop,
  Mail,
  Phone,
  ShieldCheck,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSuperAdminUser } from "@/hooks/super-admin/use-super-admin-user";
import { verifySuperAdminUser } from "@/lib/api/super-admin/users";
import type { UserRole } from "@/lib/api/super-admin/users";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function roleClass(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "border-purple-500/20 bg-purple-500/10 text-purple-500";
    case "ADMIN":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[2rem] border border-border bg-card/30 p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

export default function SuperAdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading, error, refetch } = useSuperAdminUser(params.id);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async () => {
    if (!params.id) return;

    try {
      setVerifying(true);
      await verifySuperAdminUser(params.id);
      await refetch();
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="animate-pulse text-xs font-black uppercase tracking-widest">
          Loading Record...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-3xl border border-dashed border-destructive/30 p-20 text-center">
        <p className="text-sm font-bold italic text-destructive">
          {error ?? "User record not found."}
        </p>
        <Button
          variant="outline"
          className="mt-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
          onClick={() => router.push("/dashboard/super-admin/users")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Registry
        </Button>
      </div>
    );
  }

  const isVerified = Boolean(user.isVerified || user.verifiedAt);

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <section>
          <button
            onClick={() => router.push("/dashboard/super-admin/users")}
            className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Registry
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter sm:text-5xl">
              {user.fullName}
            </h1>
            {isVerified ? (
              <BadgeCheck className="h-7 w-7 text-emerald-500" />
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              {user.email}
            </span>
            {user.phoneNumber ? (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {user.phoneNumber}
              </span>
            ) : null}
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Badge
            className={cn(
              "rounded-lg border px-3 py-1.5 text-[10px] font-black uppercase tracking-tight italic",
              roleClass(user.role),
            )}
          >
            {user.role.replace("_", " ")}
          </Badge>

          {!isVerified ? (
            <Button
              className="h-12 rounded-xl bg-primary px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
              onClick={handleVerify}
              disabled={verifying}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              {verifying ? "Verifying..." : "Verify User"}
            </Button>
          ) : (
            <Badge className="h-12 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Verified {user.verifiedAt ? formatDate(user.verifiedAt) : ""}
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {user.workerProfile ? (
          <SectionCard title="Worker Profile" icon={Briefcase}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trust score</span>
                <span className="font-black">
                  {user.workerProfile.trustScore ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Workforce member</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] font-black uppercase",
                    user.workerProfile.isWorkforceMember &&
                      "border-primary/30 text-primary",
                  )}
                >
                  {user.workerProfile.isWorkforceMember ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-bold">
                  {user.workerProfile.location ?? "—"}
                </span>
              </div>
              {user.workerProfile.skills?.length ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {user.workerProfile.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-[10px] font-bold"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </SectionCard>
        ) : null}

        {user.employerProfile ? (
          <SectionCard title="Employer Profile" icon={Building2}>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Company</span>
                <span className="font-black">
                  {user.employerProfile.companyName ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trust score</span>
                <span className="font-black">
                  {user.employerProfile.trustScore ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="font-bold">
                  {user.employerProfile.location ?? "—"}
                </span>
              </div>
            </div>
          </SectionCard>
        ) : null}

        <SectionCard
          title={`Jobs Posted (${user.jobsPosted.length})`}
          icon={Briefcase}
        >
          {user.jobsPosted.length === 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              No jobs posted.
            </p>
          ) : (
            <div className="space-y-2">
              {user.jobsPosted.map((job) => (
                <button
                  key={job.id}
                  onClick={() =>
                    router.push(`/dashboard/super-admin/jobs/${job.id}`)
                  }
                  className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3 text-left transition hover:border-primary/40"
                >
                  <div>
                    <p className="text-sm font-bold">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.locationName} · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-black uppercase"
                    >
                      {job.status.replace("_", " ")}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title={`Applications (${user.applications.length})`}
          icon={FileText}
        >
          {user.applications.length === 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              No applications submitted.
            </p>
          ) : (
            <div className="space-y-2">
              {user.applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold">{application.job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-black uppercase"
                  >
                    {application.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={`Uploads (${user.uploads.length})`} icon={FileText}>
          {user.uploads.length === 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              No uploads on record.
            </p>
          ) : (
            <div className="space-y-2">
              {user.uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold">{upload.originalName}</p>
                    <p className="text-xs text-muted-foreground">
                      {upload.purpose.replace(/_/g, " ")} ·{" "}
                      {formatDate(upload.createdAt)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">
                    {(upload.sizeBytes / 1024).toFixed(0)} KB
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title={`Sessions (${user.sessions.length})`} icon={Laptop}>
          {user.sessions.length === 0 ? (
            <p className="text-xs font-medium text-muted-foreground">
              No session history.
            </p>
          ) : (
            <div className="space-y-2">
              {user.sessions.map((session) => {
                const isActive = new Date(session.expiresAt) > new Date();

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3"
                  >
                    <div>
                      <p className="line-clamp-1 text-xs font-bold">
                        {session.userAgent ?? "Unknown device"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.ipAddress ?? "—"} ·{" "}
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        "text-[10px] font-black uppercase",
                        isActive
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                          : "border-border bg-muted/50 text-muted-foreground",
                      )}
                    >
                      {isActive ? "Active" : "Expired"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {user.verifiedByAdmin ? (
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          Verified by {user.verifiedByAdmin.fullName} (
          {user.verifiedByAdmin.email})
        </div>
      ) : null}
    </div>
  );
}
