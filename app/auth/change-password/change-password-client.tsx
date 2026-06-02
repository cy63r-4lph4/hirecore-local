"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { api } from "@/lib/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

type ChangePasswordResponse = {
  message?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    mustChangePassword?: boolean;
    passwordChangedAt?: string | null;
    emailVerifiedAt?: string | null;
    phoneVerifiedAt?: string | null;
    verifiedAt?: string | null;
    accountTypes?: ("WORKER" | "EMPLOYER")[];
  };
  forcePasswordChange?: boolean;
  nextStep?: "DASHBOARD" | "VERIFY_ACCOUNT" | "CHANGE_PASSWORD";
};

function getAxiosMessage(error: any, fallback: string) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) return message.join(", ");

  return message || error?.message || fallback;
}

export default function ChangePasswordClient() {
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/dashboard/admin";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      different:
        currentPassword.length > 0 &&
        newPassword.length > 0 &&
        currentPassword !== newPassword,
      matches:
        confirmPassword.length > 0 &&
        newPassword.length > 0 &&
        newPassword === confirmPassword,
    };
  }, [currentPassword, newPassword, confirmPassword]);

  const passwordStrongEnough =
    passwordChecks.length &&
    passwordChecks.upper &&
    passwordChecks.lower &&
    passwordChecks.number &&
    passwordChecks.different &&
    passwordChecks.matches;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword.trim()) {
      toast({
        variant: "destructive",
        title: "Current password required",
        description: "Enter the temporary password you used to sign in.",
      });
      return;
    }

    if (!passwordStrongEnough) {
      toast({
        variant: "destructive",
        title: "Password is not ready",
        description:
          "Use a stronger password and make sure both new password fields match.",
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<ChangePasswordResponse>(
        "/auth/password/change",
        {
          currentPassword,
          newPassword,
        },
      );

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast({
        title: "Password changed",
        description: "Your admin password has been updated successfully.",
      });

      window.location.href = redirect;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password change failed",
        description: getAxiosMessage(
          error,
          "Could not change your password. Please try again.",
        ),
      });
    } finally {
      setLoading(false);
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
                Change your temporary password
              </h1>

              <p className="text-sm leading-6 text-neutral-400">
                Your admin account was created with a temporary password. Set a
                new password before entering the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">
                  Temporary Password
                </Label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter temporary password"
                    className="h-11 rounded-lg border-neutral-800 bg-neutral-900/60 pl-9 pr-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-700"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                    aria-label={
                      showCurrentPassword
                        ? "Hide temporary password"
                        : "Show temporary password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">
                  New Password
                </Label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                  <Input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Create new password"
                    className="h-11 rounded-lg border-neutral-800 bg-neutral-900/60 pl-9 pr-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-700"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-400">
                  Confirm New Password
                </Label>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repeat new password"
                    className="h-11 rounded-lg border-neutral-800 bg-neutral-900/60 pl-9 pr-10 text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-neutral-700"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4">
                <p className="mb-3 text-xs font-medium text-neutral-300">
                  Password requirements
                </p>

                <div className="grid gap-2 text-xs text-neutral-500 sm:grid-cols-2">
                  <PasswordCheck
                    valid={passwordChecks.length}
                    label="At least 8 characters"
                  />
                  <PasswordCheck
                    valid={passwordChecks.upper}
                    label="One uppercase letter"
                  />
                  <PasswordCheck
                    valid={passwordChecks.lower}
                    label="One lowercase letter"
                  />
                  <PasswordCheck
                    valid={passwordChecks.number}
                    label="One number"
                  />
                  <PasswordCheck
                    valid={passwordChecks.different}
                    label="Different from temporary password"
                  />
                  <PasswordCheck
                    valid={passwordChecks.matches}
                    label="Passwords match"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-neutral-100 text-xs font-medium text-neutral-950 shadow transition-all hover:bg-neutral-200 active:scale-[0.99]"
                disabled={loading || !passwordStrongEnough}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Change Password
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-7 rounded-2xl border border-neutral-800 bg-neutral-950/55 p-4">
              <p className="text-xs leading-6 text-neutral-500">
                This step protects admin access. After changing your temporary
                password, you can continue to the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function PasswordCheck({ valid, label }: { valid: boolean; label: string }) {
  return (
    <div
      className={
        valid
          ? "flex items-center gap-2 text-primary"
          : "flex items-center gap-2 text-neutral-500"
      }
    >
      <CheckCircle2
        className={
          valid
            ? "h-3.5 w-3.5 shrink-0 text-primary"
            : "h-3.5 w-3.5 shrink-0 text-neutral-700"
        }
      />
      <span>{label}</span>
    </div>
  );
}