// src/app/dashboard/super-admin/users/page.tsx

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Download,
  Filter,
  MailCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  UserX,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSuperAdminUsers } from "@/hooks/super-admin/use-super-admin-users";
import type {
  AdminUser,
  GetSuperAdminUsersParams,
  UserRole,
  UserProfileType,
} from "@/lib/api/super-admin/users";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

type CategoryValue =
  | "ALL"
  | "WORKERS"
  | "EMPLOYERS"
  | "ADMINS"
  | "SUPER_ADMINS"
  | "WORKFORCE"
  | "UNVERIFIED"
  | "RECENT";

type VerificationFilter =
  | "ALL"
  | "VERIFIED"
  | "UNVERIFIED"
  | "WORKFORCE";

const categories: {
  label: string;
  value: CategoryValue;
  icon: React.ElementType;
}[] = [
  { label: "All", value: "ALL", icon: Users },
  { label: "Workers", value: "WORKERS", icon: BriefcaseBusiness },
  { label: "Employers", value: "EMPLOYERS", icon: Building2 },
  { label: "Admins", value: "ADMINS", icon: UserCog },
  { label: "Super Admins", value: "SUPER_ADMINS", icon: Crown },
  { label: "Workforce", value: "WORKFORCE", icon: ShieldCheck },
  { label: "Unverified", value: "UNVERIFIED", icon: UserX },
  { label: "Recent", value: "RECENT", icon: Sparkles },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getTrustScore(user: AdminUser) {
  const workerTrust = user.workerProfile?.trustScore;
  const employerTrust = user.employerProfile?.trustScore;

  if (workerTrust != null && employerTrust != null) {
    return Math.round((workerTrust + employerTrust) / 2);
  }

  return workerTrust ?? employerTrust ?? 0;
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

function roleLabel(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    default:
      return "User";
  }
}

function getCategoryParams(
  category: CategoryValue,
): Partial<GetSuperAdminUsersParams> {
  switch (category) {
    case "WORKERS":
      return {
        profileType: "WORKER",
      };

    case "EMPLOYERS":
      return {
        profileType: "EMPLOYER",
      };

    case "ADMINS":
      return {
        role: "ADMIN",
      };

    case "SUPER_ADMINS":
      return {
        role: "SUPER_ADMIN",
      };

    case "WORKFORCE":
      return {
        isWorkforce: true,
      };

    case "UNVERIFIED":
      return {
        isVerified: false,
      };

    case "RECENT":
    case "ALL":
    default:
      return {};
  }
}

function UserCard({ user }: { user: AdminUser }) {
  const trustScore = getTrustScore(user);
  const hasWorker = Boolean(user.workerProfile);
  const hasEmployer = Boolean(user.employerProfile);
  const isVerified = Boolean(user.isVerified || user.verifiedAt);
  const isWorkforce = Boolean(
    user.isWorkforce || user.workerProfile?.isWorkforceMember,
  );

  return (
    <Link
      href={`/dashboard/super-admin/users/${user.id}`}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <span className="text-sm font-black">
            {getInitials(user.fullName)}
          </span>
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              roleClass(user.role),
            )}
          >
            {roleLabel(user.role)}
          </Badge>

          {isVerified ? (
            <Badge className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-emerald-500">
              Verified
            </Badge>
          ) : (
            <Badge className="rounded-lg border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-muted-foreground">
              Unverified
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Identity Record
          </p>

          <div className="flex items-center gap-2">
            <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
              {user.fullName}
            </h2>

            {isVerified ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-emerald-500" />
            ) : null}
          </div>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">
            {user.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {hasWorker ? (
            <Badge
              variant="outline"
              className="rounded-lg text-[10px] font-black uppercase tracking-tight"
            >
              Worker
            </Badge>
          ) : null}

          {hasEmployer ? (
            <Badge
              variant="outline"
              className="rounded-lg text-[10px] font-black uppercase tracking-tight"
            >
              Employer
            </Badge>
          ) : null}

          {isWorkforce ? (
            <Badge className="rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-black uppercase tracking-tight text-primary hover:bg-primary/10">
              Workforce
            </Badge>
          ) : null}

          {!hasWorker && !hasEmployer ? (
            <Badge
              variant="outline"
              className="rounded-lg text-[10px] font-black uppercase tracking-tight text-muted-foreground"
            >
              No Profile
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-2 pt-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <MailCheck className="h-3.5 w-3.5 text-primary" />
            {user.verifiedAt ? "Admin checked" : "Awaiting admin check"}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Joined {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <Badge
          className={cn(
            "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
            trustClass(trustScore),
          )}
        >
          Trust {trustScore}
        </Badge>

        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          View Record
        </span>
      </div>
    </Link>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/30 p-4 backdrop-blur-md">
      <div className="mb-1 flex items-center gap-2">
        <Icon size={12} className={cn("text-muted-foreground", tone)} />

        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          {title}
        </p>
      </div>

      <p className={cn("text-lg font-black italic tracking-tighter", tone)}>
        {value}
      </p>
    </div>
  );
}

export default function SuperAdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryValue>("ALL");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [verification, setVerification] = useState<VerificationFilter>("ALL");
  const [profileType, setProfileType] =
    useState<UserProfileType | "ALL">("ALL");

  const categoryParams = useMemo(() => getCategoryParams(category), [category]);

  const queryParams = useMemo<GetSuperAdminUsersParams>(() => {
    const params: GetSuperAdminUsersParams = {
      page,
      limit: 12,
      search: search || undefined,
      ...categoryParams,
    };

    if (role !== "ALL") {
      params.role = role;
    }

    if (profileType !== "ALL") {
      params.profileType = profileType;
    }

    if (verification === "VERIFIED") {
      params.isVerified = true;
    }

    if (verification === "UNVERIFIED") {
      params.isVerified = false;
    }

    if (verification === "WORKFORCE") {
      params.isWorkforce = true;
    }

    return params;
  }, [page, search, categoryParams, role, verification, profileType]);

  const {
    users,
    meta,
    loading: usersLoading,
    error,
    refetch: refetchUsers,
  } = useSuperAdminUsers(queryParams);

  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSuperAdminSummary();

  const activeCategory = categories.find((item) => item.value === category);

  const refreshAll = async () => {
    await Promise.all([refetchUsers(), refetchSummary()]);
  };

  const totalUsers = summary?.users.total ?? 0;
  const workers = summary?.users.workers ?? 0;
  const employers = summary?.users.employers ?? 0;
  const admins =
    (summary?.users.admins ?? 0) + (summary?.users.superAdmins ?? 0);
  const verified = summary?.users.adminVerified ?? 0;
  const unverified = Math.max(totalUsers - verified, 0);

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Identity Command
          </p>

          <h1 className="mt-1 text-4xl font-black italic uppercase tracking-tighter sm:text-5xl">
            User <span className="text-primary">Registry</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
            Manage platform identities, role boundaries, verification state,
            worker and employer profiles, trust posture, and workforce
            membership from one command surface.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <Download size={14} className="mr-2" />
            Export Registry
          </Button>

          <Button
            variant="outline"
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
            onClick={refreshAll}
            disabled={usersLoading || summaryLoading}
          >
            <RefreshCw
              size={14}
              className={cn(
                "mr-2",
                (usersLoading || summaryLoading) && "animate-spin",
              )}
            />
            Sync
          </Button>

          <Button
            asChild
            className="h-12 rounded-xl bg-primary px-6 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
          >
            <Link href="/dashboard/super-admin/admins">
              <UserCog size={16} className="mr-2 stroke-[3]" />
              Create Admin
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatCard title="Total Users" value={totalUsers} icon={Users} />

        <StatCard
          title="Workers"
          value={workers}
          icon={BriefcaseBusiness}
          tone="text-blue-500"
        />

        <StatCard
          title="Employers"
          value={employers}
          icon={Building2}
          tone="text-violet-500"
        />

        <StatCard
          title="Admins"
          value={admins}
          icon={ShieldCheck}
          tone="text-purple-500"
        />

        <StatCard
          title="Verified"
          value={verified}
          icon={MailCheck}
          tone="text-emerald-500"
        />

        <StatCard
          title="Unverified"
          value={unverified}
          icon={AlertTriangle}
          tone="text-amber-500"
        />
      </div>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((item) => {
            const Icon = item.icon;
            const isActive = item.value === category;

            return (
              <button
                key={item.value}
                onClick={() => {
                  setCategory(item.value);
                  setPage(1);
                }}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-[10px] font-black uppercase tracking-widest transition",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border bg-background/50 text-muted-foreground hover:bg-background",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="mb-8 grid gap-3 xl:grid-cols-[1fr_180px_220px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or phone..."
              className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
            />
          </div>

          <Select
            value={role}
            onValueChange={(value) => {
              setRole(value as UserRole | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-12 rounded-xl border-border bg-background/50">
              <SelectValue placeholder="Role" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="SUPER_ADMIN">Super Admins</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={profileType}
            onValueChange={(value) => {
              setProfileType(value as UserProfileType | "ALL");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-12 rounded-xl border-border bg-background/50">
              <SelectValue placeholder="Profile type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All profiles</SelectItem>
              <SelectItem value="WORKER">Workers only</SelectItem>
              <SelectItem value="EMPLOYER">Employers only</SelectItem>
              <SelectItem value="DUAL">Dual profiles</SelectItem>
              <SelectItem value="NONE">No profile</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={verification}
            onValueChange={(value) => {
              setVerification(value as VerificationFilter);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-12 rounded-xl border-border bg-background/50">
              <SelectValue placeholder="Verification" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All verification</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="UNVERIFIED">Unverified</SelectItem>
              <SelectItem value="WORKFORCE">Workforce</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />

            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Showing{" "}
              <span className="text-primary">
                {activeCategory?.label ?? "All"}
              </span>{" "}
              Records
            </p>
          </div>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0} Entries
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-bold italic text-destructive">{error}</p>
          </div>
        ) : null}

        {!error && usersLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              Syncing Registry...
            </p>
          </div>
        ) : null}

        {!error && !usersLoading && users.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No identity records found.
            </p>
          </div>
        ) : null}

        {!error && !usersLoading && users.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <UserCard key={user.id} user={user} />
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
              disabled={page <= 1 || usersLoading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={
                usersLoading || !meta || page >= Math.max(1, meta.totalPages)
              }
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