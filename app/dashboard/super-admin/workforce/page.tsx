"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";

import {
  useSuperAdminWorkforceApplications,
  useSuperAdminWorkforceMembers,
} from "@/hooks/super-admin/use-super-admin-workforce";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

import type {
  SuperAdminWorkforceApplication,
  SuperAdminWorkforceMember,
  WorkforceApplicationStatus,
} from "@/lib/api/super-admin/workforce";

type WorkforceView = "members" | "applications";
type ApplicationStatusFilter = WorkforceApplicationStatus | "ALL";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "W";

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function humanize(value?: string | null) {
  if (!value) return "Not specified";

  return value.toLowerCase().replaceAll("_", " ");
}

function trustClass(score: number) {
  if (score >= 80) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
  }

  if (score >= 50) {
    return "border-amber-500/20 bg-amber-500/10 text-amber-500";
  }

  return "border-destructive/20 bg-destructive/10 text-destructive";
}

function availabilityClass(isAvailable: boolean) {
  if (isAvailable) {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
  }

  return "border-border bg-muted/50 text-muted-foreground";
}

function applicationStatusClass(status: WorkforceApplicationStatus) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
    case "REJECTED":
      return "border-destructive/20 bg-destructive/10 text-destructive";
    case "UNDER_REVIEW":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500";
    case "NEEDS_DOCUMENTS":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
    case "PENDING":
    default:
      return "border-muted-foreground/20 bg-muted/50 text-muted-foreground";
  }
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/30 p-4 backdrop-blur-md">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={12} className="text-muted-foreground" />

        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {label}
        </p>
      </div>

      <p className="text-lg font-black italic tracking-tighter">{value}</p>
    </div>
  );
}

function WorkforceCard({ member }: { member: SuperAdminWorkforceMember }) {
  const user = member.user;
  const latestApplication = member.workforceApplications?.[0];

  return (
    <Link
      href={`/dashboard/super-admin/users/${user.id}`}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <span className="text-sm font-black">
            {getInitials(user.fullName, user.email)}
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-primary">
            Workforce
          </Badge>

          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              availabilityClass(member.isAvailable),
            )}
          >
            {member.isAvailable ? "Available" : "Unavailable"}
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Verified Operator
          </p>

          <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
            {user.fullName}
          </h2>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">
            {user.email}
          </p>
        </div>

        <p className="line-clamp-2 text-xs font-medium leading-6 text-muted-foreground">
          {member.bio || "No workforce bio has been added yet."}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {member.location || "No location"}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-black text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {member.skills?.length ?? 0} Skills
          </p>
        </div>

        {member.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {member.skills.slice(0, 4).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="rounded-lg text-[10px] font-black uppercase tracking-tight"
              >
                {skill}
              </Badge>
            ))}

            {member.skills.length > 4 ? (
              <Badge
                variant="outline"
                className="rounded-lg text-[10px] font-black uppercase tracking-tight text-muted-foreground"
              >
                +{member.skills.length - 4}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              trustClass(member.trustScore ?? 0),
            )}
          >
            Trust {member.trustScore ?? 0}
          </Badge>

          {member.isVerified ? (
            <Badge className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-emerald-500">
              Verified
            </Badge>
          ) : null}
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {latestApplication
            ? `Approved ${formatDate(latestApplication.reviewedAt)}`
            : `Joined ${formatDate(member.createdAt)}`}
        </span>
      </div>
    </Link>
  );
}

function WorkforceApplicationCard({
  application,
  actionLoading,
  onReview,
  onRequestDocuments,
}: {
  application: SuperAdminWorkforceApplication;
  actionLoading: boolean;
  onReview: (
    id: string,
    status: WorkforceApplicationStatus,
    note?: string,
  ) => void;
  onRequestDocuments: (id: string) => void;
}) {
  const profile = application.workerProfile;
  const user = profile.user;
  const documentRequests = application.documentRequests ?? [];
  const openDocumentRequests = documentRequests.filter(
    (request) => request.status === "OPEN",
  ).length;

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <span className="text-sm font-black">
            {getInitials(user.fullName, user.email)}
          </span>
        </div>

        <Badge
          className={cn(
            "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
            applicationStatusClass(application.status),
          )}
        >
          {humanize(application.status)}
        </Badge>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Workforce Applicant
          </p>

          <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
            {user.fullName}
          </h2>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">
            {user.email}
          </p>
        </div>

        <p className="line-clamp-3 text-xs font-medium leading-6 text-muted-foreground">
          {application.message ||
            application.experience ||
            profile.bio ||
            "No application message has been submitted yet."}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {profile.location || "No location"}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-black text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {profile.skills?.length ?? 0} Skills
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            {documentRequests.length} Doc Requests
          </p>
        </div>

        {profile.skills?.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {profile.skills.slice(0, 5).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="rounded-lg text-[10px] font-black uppercase tracking-tight"
              >
                {skill}
              </Badge>
            ))}

            {profile.skills.length > 5 ? (
              <Badge
                variant="outline"
                className="rounded-lg text-[10px] font-black uppercase tracking-tight text-muted-foreground"
              >
                +{profile.skills.length - 5}
              </Badge>
            ) : null}
          </div>
        ) : null}

        {application.portfolioUrl ? (
          <a
            href={application.portfolioUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-xs font-black uppercase tracking-widest text-primary hover:underline"
          >
            View portfolio
          </a>
        ) : null}

        {application.reviewNote ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
              Review Note
            </p>
            <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-muted-foreground">
              {application.reviewNote}
            </p>
          </div>
        ) : null}

        {openDocumentRequests > 0 ? (
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">
              Open Document Requests
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
              {openDocumentRequests} request
              {openDocumentRequests === 1 ? "" : "s"} still waiting for
              submission.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3 border-t border-border/50 pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Applied {formatDate(application.createdAt)}
          </span>

          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <Link
              href={`/dashboard/super-admin/workforce/applications/${application.id}`}
            >
              Details
            </Link>
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            size="sm"
            disabled={
              actionLoading ||
              application.status === "APPROVED" ||
              application.status === "REJECTED"
            }
            onClick={() => onReview(application.id, "APPROVED")}
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            {actionLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Approve
          </Button>

          <Button
            size="sm"
            variant="destructive"
            disabled={
              actionLoading ||
              application.status === "APPROVED" ||
              application.status === "REJECTED"
            }
            onClick={() =>
              onReview(
                application.id,
                "REJECTED",
                "Application rejected by super admin review.",
              )
            }
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={
              actionLoading ||
              application.status === "APPROVED" ||
              application.status === "REJECTED"
            }
            onClick={() =>
              onReview(
                application.id,
                "UNDER_REVIEW",
                "Application moved to manual review.",
              )
            }
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Review
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={
              actionLoading ||
              application.status === "APPROVED" ||
              application.status === "REJECTED"
            }
            onClick={() => onRequestDocuments(application.id)}
            className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Need Docs
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminWorkforcePage() {
  const [view, setView] = useState<WorkforceView>("members");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [applicationStatus, setApplicationStatus] =
    useState<ApplicationStatusFilter>("ALL");

  const memberQueryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
    }),
    [page, search],
  );

  const applicationQueryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      status: applicationStatus === "ALL" ? undefined : applicationStatus,
    }),
    [page, search, applicationStatus],
  );

  const {
    members,
    meta: membersMeta,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useSuperAdminWorkforceMembers(memberQueryParams);

  const {
    applications,
    meta: applicationsMeta,
    loading: applicationsLoading,
    error: applicationsError,
    actionLoadingId,
    refetch: refetchApplications,
    quickReviewApplication,
    requestDocuments,
  } = useSuperAdminWorkforceApplications(applicationQueryParams);

  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSuperAdminSummary();

  const loading = view === "members" ? membersLoading : applicationsLoading;
  const error = view === "members" ? membersError : applicationsError;
  const meta = view === "members" ? membersMeta : applicationsMeta;

  const refreshAll = async () => {
    await Promise.all([
      refetchMembers(),
      refetchApplications(),
      refetchSummary(),
    ]);
  };

  const workforceMembers = summary?.workforce.members ?? membersMeta?.total ?? 0;
  const approvedApplications = summary?.workforce.approved ?? 0;
  const pendingApplications = summary?.workforce.pending ?? 0;
  const underReviewApplications = summary?.workforce.underReview ?? 0;
  const needsDocuments = summary?.workforce.needsDocuments ?? 0;

  const averageTrust =
    members.length > 0
      ? Math.round(
          members.reduce(
            (total, member) => total + (member.trustScore ?? 0),
            0,
          ) / members.length,
        )
      : summary?.trust.workerAverage ?? 0;

  const visibleCount =
    view === "members"
      ? membersMeta?.total ?? 0
      : applicationsMeta?.total ?? 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Workforce Command
          </p>

          <h1 className="mt-1 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
            Workforce <span className="text-primary">Control</span>
          </h1>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Review applicants, approve operators, request documents, monitor
            trust posture, and keep deployment readiness sharp.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <Download size={14} className="mr-2" />
            Export Workforce
          </Button>

          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={membersLoading || applicationsLoading || summaryLoading}
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw
              size={14}
              className={cn(
                "mr-2",
                (membersLoading || applicationsLoading || summaryLoading) &&
                  "animate-spin",
              )}
            />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatTile label="Members" value={workforceMembers} icon={Users} />
        <StatTile
          label="Approved"
          value={approvedApplications}
          icon={CheckCircle2}
        />
        <StatTile label="Pending" value={pendingApplications} icon={Activity} />
        <StatTile
          label="Review Queue"
          value={underReviewApplications}
          icon={ShieldCheck}
        />
        <StatTile label="Need Docs" value={needsDocuments} icon={Briefcase} />
      </div>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            variant={view === "members" ? "default" : "outline"}
            onClick={() => {
              setView("members");
              setPage(1);
            }}
            className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <Users className="mr-2 h-4 w-4" />
            Members
          </Button>

          <Button
            variant={view === "applications" ? "default" : "outline"}
            onClick={() => {
              setView("applications");
              setPage(1);
            }}
            className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Applications
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder={
                view === "members"
                  ? "Search workforce by name, email, skill, or location..."
                  : "Search applications by applicant, email, skill, or location..."
              }
              className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
            {view === "applications" ? (
              <Select
                value={applicationStatus}
                onValueChange={(value) => {
                  setApplicationStatus(value as ApplicationStatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 xl:w-[260px]">
                  <SelectValue placeholder="Application status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="ALL">All applications</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                  <SelectItem value="NEEDS_DOCUMENTS">
                    Needs documents
                  </SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-xl border border-border bg-background/50 px-4 py-3 xl:w-[260px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Avg Trust
                </p>
                <p className="mt-1 text-sm font-black italic text-primary">
                  {averageTrust}
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Visible Entries
              </p>
              <p className="mt-1 text-sm font-black italic text-primary">
                {visibleCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {view === "members" ? "Workforce Results" : "Application Queue"}
          </p>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0}{" "}
            {view === "members" ? "Operators" : "Applications"}
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              {view === "members"
                ? "Syncing Workforce..."
                : "Syncing Applications..."}
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-bold italic text-destructive">{error}</p>
          </div>
        ) : null}

        {!loading && !error && view === "members" && members.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No workforce records found.
            </p>
          </div>
        ) : null}

        {!loading &&
        !error &&
        view === "applications" &&
        applications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No workforce applications found.
            </p>
          </div>
        ) : null}

        {!loading && !error && view === "members" && members.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => (
              <WorkforceCard key={member.id} member={member} />
            ))}
          </div>
        ) : null}

        {!loading &&
        !error &&
        view === "applications" &&
        applications.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((application) => (
              <WorkforceApplicationCard
                key={application.id}
                application={application}
                actionLoading={actionLoadingId === application.id}
                onReview={quickReviewApplication}
                onRequestDocuments={(id) =>
                  requestDocuments(id, {
                    title: "Additional documents required",
                    description:
                      "Please upload the missing documents required to complete your workforce verification.",
                    requestedDocuments: [
                      "Identity document",
                      "Relevant proof of skill",
                    ],
                  })
                }
              />
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={loading || !meta || page >= Math.max(1, meta.totalPages)}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}