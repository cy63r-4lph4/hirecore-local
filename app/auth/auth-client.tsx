"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type AccountType = "WORKER" | "EMPLOYER";

type AuthResponse = {
  user?: {
    id: string;
    email: string;
    fullName: string;
    accountTypes?: AccountType[];
  };
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
  refreshToken?: string;
  message?: string | string[];
};

type AccountTypeCard = {
  value: AccountType;
  title: string;
  description: string;
  icon: React.ElementType;
};

const accountTypeCards: AccountTypeCard[] = [
  {
    value: "WORKER",
    title: "Find Opportunities",
    description: "Apply for local tasks and build a trusted worker profile.",
    icon: BriefcaseBusiness,
  },
  {
    value: "EMPLOYER",
    title: "Hire Local Talent",
    description: "Post work, review applicants, and source reliable people.",
    icon: Building2,
  },
];

export default function AuthClient() {
  const searchParams = useSearchParams();

  const redirect = searchParams.get("redirect") || "/";
  const initialSignupMode = searchParams.get("mode") === "signup";

  const [isSignup, setIsSignup] = useState(initialSignupMode);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [accountTypes, setAccountTypes] = useState<AccountType[]>([]);

  const selectedAccountTypeLabel = useMemo(() => {
    if (accountTypes.length === 2) return "Worker + Employer";
    if (accountTypes[0] === "WORKER") return "Worker Account";
    if (accountTypes[0] === "EMPLOYER") return "Employer Account";
    return "Choose account path";
  }, [accountTypes]);

  function toggleAccountType(value: AccountType) {
    setAccountTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function persistAuth(data: AuthResponse) {
    const accessToken = data.tokens?.accessToken ?? data.accessToken;
    const refreshToken = data.tokens?.refreshToken ?? data.refreshToken;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSignup && accountTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "Profile setup incomplete",
        description: "Select at least Worker or Employer to continue.",
      });
      return;
    }

    if (isSignup && !fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Full name required",
        description: "Enter your full name to create your account.",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup ? "/auth/register" : "/auth/login";

      const payload = isSignup
        ? {
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            password,
            phoneNumber: phoneNumber.trim() || undefined,
            accountTypes,
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        const message = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || "Authentication failed.";

        throw new Error(message);
      }

      persistAuth(data);

      toast({
        title: isSignup ? "Welcome to HireCore" : "Welcome back",
        description: isSignup
          ? "Your account has been created successfully."
          : "You are signed in.",
      });

      window.location.href = redirect;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description:
          error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function switchMode(nextSignupMode: boolean) {
    setIsSignup(nextSignupMode);
    setPassword("");
  }

  return (
    <main className="relative min-h-screen bg-neutral-950 text-neutral-50 selection:bg-primary selection:text-primary-foreground antialiased lg:grid lg:grid-cols-12">
      <Link
        href="/"
        className="absolute left-6 top-6 z-50 inline-flex h-9 items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-4 text-xs font-medium text-neutral-400 backdrop-blur-md transition hover:border-neutral-700 hover:text-neutral-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return Home
      </Link>

      <section className="relative hidden flex-col justify-between overflow-hidden bg-neutral-900 p-12 lg:col-span-5 lg:flex xl:col-span-4">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-40">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-500/10 blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#232323_1px,transparent_1px),linear-gradient(to_bottom,#232323_1px,transparent_1px)] bg-size-[32px_32px] mask-[radial-gradient(ellipse_at_center,transparent_20%,black_1px)]" />
        </div>

        <div className="relative z-10">
          <Image
            src="/hirecore-local.svg"
            alt="HireCore Local"
            width={130}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </div>

        <div className="relative z-10 my-auto max-w-sm space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 px-3 py-1 text-xs font-medium text-neutral-300">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Local workforce, cleaner flow
          </div>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-neutral-100">
            Work, hiring, and trust under one local marketplace.
          </h1>

          <p className="text-sm leading-relaxed text-neutral-400">
            Create a worker profile, employer profile, or both. Browse tasks,
            hire people, and grow with a product that is being sharpened in
            public.
          </p>
        </div>

        <div className="relative z-10 border-t border-neutral-800/60 pt-6">
          <p className="text-xs text-neutral-500">
            Protected local marketplace. © {new Date().getFullYear()} HireCore.
          </p>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 py-24 sm:px-12 lg:col-span-7 lg:px-16 xl:col-span-8">
        <div className="w-full space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-neutral-100">
              {isSignup ? "Create your HireCore account" : "Sign in to HireCore"}
            </h2>

            <p className="text-sm text-neutral-400">
              {isSignup
                ? "Choose how you want to use the platform and set up your account."
                : "Return to your tasks, applications, dashboard, and local work flow."}
            </p>
          </div>

          <div className="grid grid-cols-2 rounded-lg bg-neutral-900 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={
                !isSignup
                  ? "rounded-[6px] bg-neutral-800 py-2 text-neutral-100 shadow transition-all"
                  : "rounded-[6px] py-2 text-neutral-400 transition-all hover:text-neutral-200"
              }
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => switchMode(true)}
              className={
                isSignup
                  ? "rounded-[6px] bg-neutral-800 py-2 text-neutral-100 shadow transition-all"
                  : "rounded-[6px] py-2 text-neutral-400 transition-all hover:text-neutral-200"
              }
            >
              Register
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-lg border-neutral-800 bg-neutral-900 text-xs font-medium text-neutral-200 hover:bg-neutral-800/80"
            onClick={() => {
              window.location.href = `${API_URL}/auth/google`;
            }}
            disabled={loading}
          >
            <svg
              className="mr-2.5 h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800/80" />
            </div>

            <span className="relative bg-neutral-950 px-3 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              or use email
            </span>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence initial={false} mode="popLayout">
              {isSignup && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-400">
                        Full Name
                      </Label>

                      <div className="relative">
                        <UserRound className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                        <Input
                          type="text"
                          placeholder="John Doe"
                          className="h-10 rounded-lg border-neutral-800 bg-neutral-900/50 pl-9 text-xs text-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-700"
                          value={fullName}
                          onChange={(event) => setFullName(event.target.value)}
                          required={isSignup}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-neutral-400">
                        Phone Number
                      </Label>

                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                        <Input
                          type="tel"
                          placeholder="+233..."
                          className="h-10 rounded-lg border-neutral-800 bg-neutral-900/50 pl-9 text-xs text-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-700"
                          value={phoneNumber}
                          onChange={(event) =>
                            setPhoneNumber(event.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs text-neutral-400">
                        Account Type
                      </Label>

                      <span className="rounded border border-primary/10 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
                        {selectedAccountTypeLabel}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {accountTypeCards.map((card) => {
                        const Icon = card.icon;
                        const isSelected = accountTypes.includes(card.value);

                        return (
                          <button
                            key={card.value}
                            type="button"
                            onClick={() => toggleAccountType(card.value)}
                            className={
                              isSelected
                                ? "relative flex flex-col items-start rounded-xl border border-primary/50 bg-primary/3 p-4 text-left transition-all"
                                : "relative flex flex-col items-start rounded-xl border border-neutral-800 bg-neutral-900/30 p-4 text-left transition-all hover:bg-neutral-900/60"
                            }
                          >
                            <div className="flex w-full items-center justify-between">
                              <div
                                className={
                                  isSelected
                                    ? "rounded-md bg-primary/10 p-1.5 text-primary"
                                    : "rounded-md bg-neutral-800 p-1.5 text-neutral-400"
                                }
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              <div
                                className={
                                  isSelected
                                    ? "flex h-4 w-4 items-center justify-center rounded-md border border-primary bg-primary text-neutral-950"
                                    : "flex h-4 w-4 items-center justify-center rounded-md border border-neutral-700"
                                }
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 stroke-3" />
                                )}
                              </div>
                            </div>

                            <h3 className="mt-3 text-xs font-semibold text-neutral-200">
                              {card.title}
                            </h3>

                            <p className="mt-1 text-[11px] leading-normal text-neutral-500">
                              {card.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-400">Email Address</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                <Input
                  type="email"
                  placeholder="name@domain.com"
                  className="h-10 rounded-lg border-neutral-800 bg-neutral-900/50 pl-9 text-xs text-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-700"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-neutral-400">Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />

                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-10 rounded-lg border-neutral-800 bg-neutral-900/50 pl-9 pr-10 text-xs text-neutral-200 focus-visible:ring-1 focus-visible:ring-neutral-700"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 transition hover:text-neutral-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-2 h-10 w-full rounded-lg bg-neutral-100 text-xs font-medium text-neutral-950 shadow transition-all hover:bg-neutral-200 active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  {isSignup ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-500">
            {isSignup ? "Already have an account?" : "New to HireCore?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(!isSignup)}
              className="font-medium text-neutral-300 underline underline-offset-4 transition hover:text-neutral-100"
            >
              {isSignup ? "Sign in instead" : "Create an account"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}