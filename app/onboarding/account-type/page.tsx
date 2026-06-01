"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { api } from "@/lib/api/axios";
import { setStoredUser } from "@/lib/storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type AccountType = "WORKER" | "EMPLOYER";

type CurrentUser = {
  id: string;
  email: string;
  fullName: string;
  accountTypes?: AccountType[];
  verification?: {
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
  };
};

type AccountTypeOption = {
  value: AccountType;
  title: string;
  label: string;
  description: string;
  icon: React.ElementType;
};

const ACCOUNT_TYPE_OPTIONS: AccountTypeOption[] = [
  {
    value: "WORKER",
    title: "I want to find work",
    label: "Worker",
    description:
      "Discover local opportunities, apply to jobs, build your profile, and later apply to join the verified HireCore Workforce.",
    icon: BriefcaseBusiness,
  },
  {
    value: "EMPLOYER",
    title: "I want to hire people",
    label: "Employer",
    description:
      "Post opportunities, manage applicants, and connect with local talent through a cleaner, more structured hiring flow.",
    icon: Building2,
  },
];

const WORKFORCE_BENEFITS = [
  "Become visible as a more trusted worker inside the platform.",
  "Apply for a verified HireCore Workforce identity.",
  "Qualify for HireCore-assigned opportunities where applicable.",
  "Build stronger credibility through reviewed documents and profile trust.",
];

export default function AccountTypeOnboardingPage() {
  const router = useRouter();

  const hasLoaded = useRef(false);

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<AccountType[]>([]);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;

    const loadCurrentUser = async () => {
      try {
        const { data } = await api.get<CurrentUser>("/auth/me");

        const existingAccountTypes = data.accountTypes ?? [];

        if (existingAccountTypes.length > 0) {
          setStoredUser(data);
          router.replace("/");
          return;
        }

        setUser(data);
      } catch (error) {
        console.error("Failed to load onboarding user:", error);
        setLoadFailed(true);
      } finally {
        setLoadingUser(false);
      }
    };

    void loadCurrentUser();
  }, [router]);

  const selectionLabel = useMemo(() => {
    if (selectedTypes.length === 2) return "Worker + Employer";
    if (selectedTypes[0] === "WORKER") return "Worker";
    if (selectedTypes[0] === "EMPLOYER") return "Employer";
    return "Choose your path";
  }, [selectedTypes]);

  const toggleAccountType = (value: AccountType) => {
    setSelectedTypes((current) => {
      if (current.includes(value)) {
        return current.filter((type) => type !== value);
      }

      return [...current, value];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "Choose how you want to use HireCore",
        description: "Select Worker, Employer, or both before continuing.",
      });

      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post<CurrentUser>("/users/me/account-types", {
        accountTypes: selectedTypes,
      });

      setStoredUser(data);
      toast({
        title: "Profile path saved",
        description:
          selectedTypes.length === 2
            ? "You can now use HireCore as both a worker and an employer."
            : selectedTypes[0] === "WORKER"
              ? "Your worker path is ready."
              : "Your employer path is ready.",
      });

      router.replace("/");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong while saving your account path.";

      toast({
        variant: "destructive",
        title: "Onboarding failed",
        description: Array.isArray(message) ? message.join(", ") : message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 text-foreground">
        <BackgroundGlow />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] border border-border/70 bg-card/80 shadow-xl backdrop-blur-xl">
            <Loader2 className="h-11 w-11 animate-spin text-primary" />
          </div>

          <h1 className="mt-7 text-3xl font-black tracking-tight">
            Preparing your onboarding
          </h1>

          <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
            We are loading your secure HireCore session and checking where your
            journey should begin.
          </p>
        </div>
      </main>
    );
  }

  if (loadFailed || !user) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 text-foreground">
        <BackgroundGlow />

        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-xl rounded-[2rem] border border-border/80 bg-card/85 p-7 text-center shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-9"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-destructive/20 bg-destructive/10">
            <TriangleAlert className="h-11 w-11 text-destructive" />
          </div>

          <h1 className="mt-7 text-3xl font-black tracking-tight">
            We lost the onboarding thread
          </h1>

          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground">
            Your Google sign-in may not have completed cleanly, or the session
            cookie was not available. Start the sign-in flow again.
          </p>

          <div className="mt-8 grid gap-3">
            <Button
              type="button"
              className="h-13 rounded-full bg-primary font-black text-primary-foreground"
              onClick={() => {
                window.location.href = `${API_URL}/auth/google`;
              }}
            >
              Try Google sign-in again
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-13 rounded-full"
              onClick={() => router.replace("/auth")}
            >
              Return to sign in
            </Button>
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 py-12 text-foreground sm:px-8 lg:px-10">
      <BackgroundGlow />

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-7xl items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Sparkles className="h-4 w-4" />
            Finalize your HireCore identity
          </div>

          <h1 className="mt-7 max-w-2xl text-5xl font-black leading-[1.05] tracking-tight">
            One account.{" "}
            <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
              Choose how you move.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            You signed in with Google successfully. Now HireCore needs to know
            whether you are here to find work, hire talent, or walk both paths.
            This shapes your dashboard, tools, and the opportunities placed in
            front of you.
          </p>

          <div className="mt-8 rounded-[2rem] border border-primary/20 bg-primary/[0.08] p-6 shadow-sm backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">
                  Why the Worker path matters
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Joining the HireCore Workforce can elevate your signal.
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {WORKFORCE_BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 p-4"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full rounded-[2rem] border border-border/80 bg-card/85 p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-8"
        >
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-semibold text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              Signed in as {user.fullName}
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Choose your account path
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Pick one or both. HireCore is built for real life — you can work
              today and hire tomorrow without creating separate identities.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-muted-foreground">
                Select what applies to you
              </p>

              <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-black text-primary">
                {selectionLabel}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {ACCOUNT_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = selectedTypes.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleAccountType(option.value)}
                    className={`group relative overflow-hidden rounded-[1.75rem] border p-5 text-left transition ${
                      selected
                        ? "border-primary bg-primary/[0.12] shadow-xl shadow-primary/10"
                        : "border-border bg-background/70 hover:-translate-y-1 hover:border-primary/40 hover:bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>

                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full border transition ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-transparent"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                      {option.label}
                    </p>

                    <h3 className="mt-2 text-xl font-black">{option.title}</h3>

                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedTypes.includes("WORKER") && (
              <div className="mt-5 rounded-[1.75rem] border border-primary/20 bg-primary/[0.08] p-5">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-sm font-black">
                      The Worker path opens the door to HireCore Workforce
                    </p>

                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      After your profile is ready, you can apply to join the
                      verified workforce pool, submit supporting documents when
                      requested, and stand out with stronger trust signals.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="group mt-7 h-14 w-full rounded-full bg-primary text-base font-black text-primary-foreground shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving your account path...
                </>
              ) : (
                <>
                  Continue into HireCore
                  <ArrowRight className="ml-2 h-5 w-5 transition group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </motion.section>
      </section>
    </main>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.22),transparent_32%),radial-gradient(circle_at_84%_82%,hsl(var(--secondary)/0.18),transparent_34%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
    </div>
  );
}
