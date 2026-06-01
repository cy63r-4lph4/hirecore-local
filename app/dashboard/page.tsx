"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Building2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";

type AccountType = "WORKER" | "EMPLOYER";

function getStoredNavMode(): AccountType | null {
  if (typeof window === "undefined") return null;

  const value = localStorage.getItem("hirecore_nav_mode");

  if (value === "WORKER" || value === "EMPLOYER") {
    return value;
  }

  return null;
}

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { user, loading, authenticated } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!authenticated || !user) {
      router.replace("/auth?redirect=/dashboard");
      return;
    }

    if (user.role === "SUPER_ADMIN") {
      router.replace("/dashboard/super-admin");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }

    const accountTypes = (user.accountTypes ?? []) as AccountType[];
    const hasWorker = accountTypes.includes("WORKER");
    const hasEmployer = accountTypes.includes("EMPLOYER");

    if (hasWorker && hasEmployer) {
      const storedMode = getStoredNavMode();

      if (storedMode === "EMPLOYER") {
        router.replace("/dashboard/employer");
        return;
      }

      router.replace("/dashboard/worker");
      return;
    }

    if (hasWorker) {
      router.replace("/dashboard/worker");
      return;
    }

    if (hasEmployer) {
      router.replace("/dashboard/employer");
      return;
    }

    router.replace("/onboarding/account-type");
  }, [loading, authenticated, user, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.18),transparent_32%),radial-gradient(circle_at_85%_80%,hsl(var(--secondary)/0.14),transparent_34%)]" />

      <section className="relative z-10 w-full max-w-md rounded-[2rem] border border-border bg-card/90 p-8 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>

        <h1 className="mt-6 text-3xl font-black tracking-tight">
          Preparing dashboard
        </h1>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Finding the right control room for your HireCore account.
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <BriefcaseBusiness className="mx-auto h-5 w-5 text-primary" />
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <Building2 className="mx-auto h-5 w-5 text-primary" />
          </div>

          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <ShieldCheck className="mx-auto h-5 w-5 text-primary" />
          </div>
        </div>
      </section>
    </main>
  );
}