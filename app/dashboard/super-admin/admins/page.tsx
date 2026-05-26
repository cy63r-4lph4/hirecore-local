// src/app/dashboard/super-admin/admins/page.tsx

"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Crown,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  createSuperAdminAdmin,
  type CreateAdminPayload,
} from "@/lib/api/super-admin/admins";
import { useSuperAdminAdmins } from "@/hooks/super-admin/use-super-admin-admins";
import type { AdminUser } from "@/lib/api/super-admin/users";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "A";

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

function roleClass(role: AdminUser["role"]) {
  switch (role) {
    case "SUPER_ADMIN":
      return "border-purple-500/20 bg-purple-500/10 text-purple-500";
    case "ADMIN":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function roleLabel(role: AdminUser["role"]) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";
    case "ADMIN":
      return "Admin";
    default:
      return "User";
  }
}

function AdminCard({ admin }: { admin: AdminUser }) {
  const isSuperAdmin = admin.role === "SUPER_ADMIN";

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110",
            isSuperAdmin
              ? "bg-purple-500/10 text-purple-500"
              : "bg-primary/10 text-primary",
          )}
        >
          <span className="text-sm font-black">
            {getInitials(admin.fullName, admin.email)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              roleClass(admin.role),
            )}
          >
            {isSuperAdmin ? (
              <Crown className="mr-1 h-3 w-3" />
            ) : (
              <ShieldCheck className="mr-1 h-3 w-3" />
            )}
            {roleLabel(admin.role)}
          </Badge>

          <button className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Privileged Operator
          </p>

          <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
            {admin.fullName}
          </h2>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-muted-foreground">
            {admin.email}
          </p>
        </div>

        <div className="grid gap-2 pt-1">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Mail className="h-3.5 w-3.5 text-primary" />
            {admin.email}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Phone className="h-3.5 w-3.5 text-primary" />
            {admin.phoneNumber || "No phone number"}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <KeyRound className="h-3.5 w-3.5 text-primary" />
            Joined {formatDate(admin.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        {admin.isVerified ? (
          <Badge className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-emerald-500">
            Verified
          </Badge>
        ) : (
          <Badge className="rounded-lg border border-border bg-muted/50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic text-muted-foreground">
            Pending
          </Badge>
        )}

        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
          Access Record
        </span>
      </div>
    </div>
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

export default function SuperAdminAdminsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<CreateAdminPayload>({
    fullName: "",
    email: "",
    temporaryPassword: "",
    phoneNumber: "",
  });

  const queryParams = useMemo(
    () => ({
      search: search || undefined,
      page,
      limit: 12,
    }),
    [search, page],
  );

  const { admins, meta, loading, error, refetch } =
    useSuperAdminAdmins(queryParams);

  const verifiedAdmins = admins.filter((admin) => admin.isVerified).length;
  const superAdmins = admins.filter(
    (admin) => admin.role === "SUPER_ADMIN",
  ).length;
  const regularAdmins = admins.filter((admin) => admin.role === "ADMIN").length;

  const handleCreateAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const email = form.email.trim();
    const temporaryPassword = form.temporaryPassword.trim();
    const phoneNumber = form.phoneNumber?.trim();

    if (!fullName || !email || !temporaryPassword) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Full name, email, and temporary password are required.",
      });
      return;
    }

    try {
      setCreating(true);

      await createSuperAdminAdmin({
        fullName,
        email,
        temporaryPassword,
        phoneNumber: phoneNumber || undefined,
      });

      toast({
        title: "Admin provisioned",
        description: `${fullName} has been granted administrator access.`,
      });

      setForm({
        fullName: "",
        email: "",
        temporaryPassword: "",
        phoneNumber: "",
      });

      await refetch();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Provisioning failed",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Could not create admin account.",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
      >
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Access Command
          </p>

          <h1 className="mt-1 text-4xl font-black italic uppercase tracking-tighter sm:text-5xl">
            Admin <span className="text-primary">Registry</span>
          </h1>

          <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
            Provision administrative operators, monitor privileged identities,
            and keep platform control clean, traceable, and intentional.
          </p>
        </section>

        <Button
          variant="outline"
          className="h-12 w-fit rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw
            size={14}
            className={cn("mr-2", loading && "animate-spin")}
          />
          Sync
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Visible Admins"
          value={meta?.total ?? admins.length}
          icon={Users}
        />

        <StatCard
          title="Regular Admins"
          value={regularAdmins}
          icon={ShieldCheck}
          tone="text-blue-500"
        />

        <StatCard
          title="Super Admins"
          value={superAdmins}
          icon={Crown}
          tone="text-purple-500"
        />

        <StatCard
          title="Verified"
          value={verifiedAdmins}
          icon={Sparkles}
          tone="text-emerald-500"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <UserPlus className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Provision Node
              </p>

              <h2 className="text-xl font-black italic uppercase tracking-tight">
                Create Admin
              </h2>
            </div>
          </div>

          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Full name"
                className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
                value={form.fullName}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    fullName: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="email"
                placeholder="Email address"
                className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
                value={form.email}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    email: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Phone number optional"
                className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
                value={form.phoneNumber ?? ""}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="password"
                placeholder="Temporary password"
                className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
                value={form.temporaryPassword}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    temporaryPassword: event.target.value,
                  }))
                }
                required
              />
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-500">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="text-xs font-bold leading-6">
                  Create admin accounts only for trusted operators. This role
                  can review users, tasks, applications, and workforce records.
                </p>
              </div>
            </div>

            <Button
              disabled={creating}
              className="h-12 w-full rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02]"
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Admin...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Authorize Admin
                </>
              )}
            </Button>
          </form>
        </section>

        <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Operator Records
              </p>

              <h2 className="text-2xl font-black italic uppercase tracking-tight">
                Registry
              </h2>

              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {meta?.total ?? 0} administrator
                {meta?.total === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search admins..."
                className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              Access Results
            </p>

            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {meta?.total ?? 0} Entries
            </p>
          </div>

          {error ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-bold italic text-destructive">
                {error}
              </p>
            </div>
          ) : null}

          {!error && loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="animate-pulse text-xs font-black uppercase tracking-widest">
                Syncing Operators...
              </p>
            </div>
          ) : null}

          {!error && !loading && admins.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-20 text-center">
              <p className="text-sm font-bold italic text-muted-foreground">
                No administrative records found.
              </p>
            </div>
          ) : null}

          {!error && !loading && admins.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {admins.map((admin) => (
                <AdminCard key={admin.id} admin={admin} />
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
    </div>
  );
}