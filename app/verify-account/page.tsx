"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";

import { api } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type StoredUser = {
  id: string;
  email: string;
  fullName: string;
  accountTypes?: ("WORKER" | "EMPLOYER")[];
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  verifiedAt?: string | null;
};

type ApiResponse = {
  message?: string | string[];
  user?: StoredUser;
};

function getAxiosMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");

  return message || error?.message || fallback;
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return null;

    return JSON.parse(rawUser) as StoredUser;
  } catch {
    return null;
  }
}

export default function VerifyAccountPage() {
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";

  const [code, setCode] = useState("");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const maskedEmail = useMemo(() => {
    if (!user?.email) return "your email address";

    const [name, domain] = user.email.split("@");

    if (!name || !domain) return user.email;

    const visible = name.slice(0, 2);
    return `${visible}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}`;
  }, [user?.email]);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanCode = code.trim();

    if (!cleanCode) {
      toast({
        variant: "destructive",
        title: "Verification code required",
        description: "Enter the code sent to your email address.",
      });
      return;
    }

    setVerifying(true);

    try {
      const { data } = await api.post<ApiResponse>("/auth/email-verify", {
        code: cleanCode,
      });

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      } else if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            emailVerifiedAt: new Date().toISOString(),
          }),
        );
      }

      toast({
        title: "Account verified",
        description: "Your email has been verified successfully.",
      });

      window.location.href = redirect;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: getAxiosMessage(
          error,
          "The code could not be verified. Try again.",
        ),
      });
    } finally {
      setVerifying(false);
    }
  }

  async function handleResendCode() {
    setResending(true);

    try {
      await api.post<ApiResponse>("/auth/email-verification-otp", {});

      toast({
        title: "Verification code sent",
        description: "Check your email for the new code.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Could not resend code",
        description: getAxiosMessage(
          error,
          "Something went wrong. Please try again.",
        ),
      });
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="dark relative min-h-dvh w-full overflow-hidden bg-neutral-950 text-neutral-50 selection:bg-primary selection:text-primary-foreground antialiased">
      <Link
        href="/auth"
        className="fixed left-4 top-4 z-50 inline-flex h-9 items-center gap-2 rounded-full border border-neutral-800/80 bg-neutral-950/85 px-3 text-[11px] font-medium text-neutral-400 shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-neutral-700 hover:text-neutral-200 sm:left-6 sm:top-6 sm:px-4 sm:text-xs"
      >
        <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
        <span>Back to sign in</span>
      </Link>

      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-size-[32px_32px] opacity-40 mask-[radial-gradient(ellipse_at_center,black_1px,transparent_70%)]" />
      </div>

      <section className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-24 sm:px-6">
        <div className="w-full max-w-lg">
          <div className="mb-8 flex justify-center">
            <Image
              src="/hirecore-local.svg"
              alt="HireCore Local"
              width={220}
              height={60}
              priority
              className="w-48 drop-shadow-2xl sm:w-56"
              style={{ height: "auto" }}
            />
          </div>

          <div className="overflow-hidden rounded-3xl border border-neutral-800/70 bg-neutral-900/45 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-neutral-100 sm:text-3xl">
                Verify your account
              </h1>

              <p className="text-sm leading-6 text-neutral-400">
                Enter the code sent to{" "}
                <span className="font-medium text-neutral-200">
                  {maskedEmail}
                </span>
                . Verification helps protect your account and unlocks core
                actions on HireCore.
              </p>
            </div>

            <form onSubmit={handleVerify} className="mt-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">
                  Verification Code
                </Label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                  <Input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter code"
                    className="h-11 rounded-lg border-neutral-800 bg-neutral-900/60 pl-9 text-sm tracking-[0.25em] text-neutral-100 placeholder:tracking-normal placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-700"
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value
                          .replace(/[^\dA-Za-z]/g, "")
                          .slice(0, 8),
                      )
                    }
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-neutral-100 text-xs font-medium text-neutral-950 shadow transition-all hover:bg-neutral-200 active:scale-[0.99]"
                disabled={verifying || resending}
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Verify Account
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg border-neutral-800 bg-neutral-900 text-xs font-medium text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                onClick={handleResendCode}
                disabled={verifying || resending}
              >
                {resending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <RefreshCcw className="h-3.5 w-3.5" />
                    Resend code
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="h-10 rounded-lg text-xs font-medium text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                onClick={() => {
                  window.location.href = redirect;
                }}
                disabled={verifying || resending}
              >
                <span className="flex items-center gap-1.5">
                  Skip for now
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Button>
            </div>

            <div className="mt-7 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4">
              <p className="text-xs leading-6 text-neutral-500">
                You can skip this step and look around, but applying for tasks,
                posting work, uploads, and workforce actions should stay locked
                until at least one contact method is verified.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}