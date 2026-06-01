"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type AccountType = "WORKER" | "EMPLOYER";

type CallbackState = "checking" | "success" | "failed";

export default function GoogleAuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasRun = useRef(false);

  const [state, setState] = useState<CallbackState>("checking");
  const [message, setMessage] = useState("Finishing your Google sign-in...");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const status = searchParams.get("status");

    if (status && status !== "success") {
      setState("failed");
      setMessage("Google sign-in did not complete successfully.");
      return;
    }

    const completeGoogleLogin = async () => {
      try {
        setState("checking");
        setMessage("Confirming your secure session...");

        const { data: user } = await api.get("/auth/me");

        setState("success");
        setMessage("Welcome in. Routing you to the right place...");

        const accountTypes = (user.accountTypes ?? []) as AccountType[];

        window.setTimeout(() => {
          if (accountTypes.length === 0) {
            router.replace("/onboarding/account-type");
            return;
          }

          router.replace("/");
        }, 700);
      } catch (error) {
        console.error("Google callback failed:", error);

        setState("failed");
        setMessage(
          "We could not complete your Google sign-in. Please try again.",
        );
      }
    };

    void completeGoogleLogin();
  }, [router, searchParams]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-16 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,hsl(var(--primary)/0.22),transparent_32%),radial-gradient(circle_at_84%_82%,hsl(var(--secondary)/0.18),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-size-[72px_72px] opacity-40" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl rounded-[2rem] border border-border/80 bg-card/85 p-6 text-center shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-9"
      >
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          <Sparkles className="h-4 w-4" />
          HireCore Google Sign-In
        </div>

        <div className="mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-border/70 bg-background/80 shadow-sm">
          {state === "checking" && (
            <Loader2 className="h-11 w-11 animate-spin text-primary" />
          )}

          {state === "success" && (
            <CheckCircle2 className="h-11 w-11 text-primary" />
          )}

          {state === "failed" && (
            <TriangleAlert className="h-11 w-11 text-destructive" />
          )}
        </div>

        <h1 className="mt-7 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {state === "checking" && "Securing your session"}
          {state === "success" && "You are signed in"}
          {state === "failed" && "Sign-in stalled"}
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          {message}
        </p>

        {state === "checking" && (
          <div className="mt-7 rounded-[1.5rem] border border-border/70 bg-background/60 p-4">
            <div className="flex items-start gap-3 text-left">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <p className="text-sm leading-6 text-muted-foreground">
                We are checking the secure session created by the backend,
                loading your HireCore profile, and deciding whether you need the
                one-step account onboarding flow.
              </p>
            </div>
          </div>
        )}

        {state === "failed" && (
          <div className="mt-8 space-y-3">
            <Button
              type="button"
              className="group h-13 w-full rounded-full bg-primary font-black text-primary-foreground shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
              onClick={() => router.replace("/auth")}
            >
              Return to sign in
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-13 w-full rounded-full"
              onClick={() => {
                window.location.href = `${API_URL}/auth/google`;
              }}
            >
              Try Google again
            </Button>
          </div>
        )}
      </motion.section>
    </main>
  );
}