"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  HandCoins,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type AccountType = "WORKER" | "EMPLOYER";

type AuthResponse = {
  user?: {
    id: string;
    email: string;
    fullName: string;
    accountTypes?: AccountType[];
    capabilities?: {
      isWorker?: boolean;
      isEmployer?: boolean;
    };
  };
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};

const accountTypeCards: Array<{
  value: AccountType;
  title: string;
  description: string;
  icon: React.ElementType;
  highlight: string;
}> = [
  {
    value: "WORKER",
    title: "I want to find work",
    description:
      "Discover local jobs, apply with confidence, and build a visible work profile.",
    icon: BriefcaseBusiness,
    highlight: "Worker",
  },
  {
    value: "EMPLOYER",
    title: "I want to hire people",
    description:
      "Post opportunities, review applications, and reach local talent faster.",
    icon: Building2,
    highlight: "Employer",
  },
];

const platformBenefits = [
  {
    title: "Jobs that feel closer",
    description:
      "HireCore Local connects people to practical opportunities around them, not vague listings floating in the void.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Hiring with more signal",
    description:
      "Employers gain clearer candidate profiles, application visibility, and a structured path to trustworthy assignments.",
    icon: ShieldCheck,
  },
  {
    title: "One account, multiple paths",
    description:
      "A user can be a worker, employer, or both. The platform bends around real life instead of forcing one label.",
    icon: Users,
  },
];

const workforceBenefits = [
  "Access a stronger, verified worker identity.",
  "Stand out for HireCore-assigned opportunities.",
  "Support document-backed trust during verification.",
  "Build credibility beyond a single job application.",
];

export default function LoginPage() {
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

  const authTitle = isSignup
    ? "Create your HireCore identity"
    : "Welcome back to HireCore";

  const authDescription = isSignup
    ? "Choose how you want to move through the platform, then step in."
    : "Sign in and continue where your work, hiring, and momentum paused.";

  const selectedAccountTypeLabel = useMemo(() => {
    if (accountTypes.length === 2) return "Worker + Employer";
    if (accountTypes[0] === "WORKER") return "Worker";
    if (accountTypes[0] === "EMPLOYER") return "Employer";
    return "No account path selected";
  }, [accountTypes]);

  const toggleAccountType = (value: AccountType) => {
    setAccountTypes((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value];
    });
  };

  const persistAuth = (data: AuthResponse) => {
    const accessToken =
      data.tokens?.accessToken ?? data.accessToken;
    const refreshToken =
      data.tokens?.refreshToken ?? data.refreshToken;

    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSignup && accountTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "Choose how you will use HireCore",
        description:
          "Select Worker, Employer, or both before creating your account.",
      });
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup
        ? "/auth/register"
        : "/auth/login";

      const payload = isSignup
        ? {
            fullName,
            email,
            password,
            phoneNumber: phoneNumber || undefined,
            accountTypes,
          }
        : {
            email,
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
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message || "Authentication failed",
        );
      }

      persistAuth(data);

      toast({
        title: isSignup ? "Account created" : "Welcome back",
        description: isSignup
          ? "Your HireCore account is ready."
          : "You have signed in successfully.",
      });

      window.location.href = redirect;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isSignup ? "Signup failed" : "Sign-in failed",
        description:
          error?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--primary)/0.22),transparent_30%),radial-gradient(circle_at_82%_18%,hsl(var(--secondary)/0.18),transparent_28%),radial-gradient(circle_at_70%_88%,hsl(var(--primary)/0.12),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40" />
      </div>

      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/75 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>

      <section className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1500px] items-center gap-10 px-5 py-24 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 xl:px-16">
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              HireCore Local — built for movement
            </div>

            <Image
              src="/hirecore-local.svg"
              alt="HireCore Local"
              width={170}
              height={170}
              className="mb-5"
            />

            <h1 className="max-w-4xl text-5xl font-black leading-[1.03] tracking-tight text-foreground xl:text-6xl">
              Create an account that knows whether you{" "}
              <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                work, hire, or do both.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              HireCore Local is not just a login screen with a job board behind
              it. It is a pathway: workers become visible, employers find real
              talent, and verified workforce members move with a stronger trust
              signal.
            </p>

            <div className="mt-9 grid gap-4">
              {platformBenefits.map((benefit, index) => {
                const Icon = benefit.icon;

                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.14 + index * 0.08,
                    }}
                    className="group flex gap-4 rounded-[1.75rem] border border-border/70 bg-card/65 p-5 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-primary/30 hover:bg-card/85"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-7 rounded-[2rem] border border-primary/20 bg-primary/[0.08] p-6 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <BadgeCheck className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Why HireCore Workforce matters
                  </p>
                  <h3 className="mt-1 text-xl font-black text-foreground">
                    Verified workers carry more signal.
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {workforceBenefits.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/55 p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-6 text-muted-foreground">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex w-full justify-center">
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl rounded-[2rem] border border-border/80 bg-card/82 p-5 shadow-2xl shadow-black/10 backdrop-blur-2xl sm:p-7 lg:max-w-xl xl:max-w-2xl"
          >
            <div className="mb-7 flex flex-col items-center text-center lg:hidden">
              <Image
                src="/hirecore-local.svg"
                alt="HireCore Local"
                width={120}
                height={120}
              />
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                HireCore Local
              </div>
            </div>

            <div className="mb-7 flex rounded-full border border-border/80 bg-background/70 p-1.5">
              <button
                type="button"
                onClick={() => setIsSignup(false)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition ${
                  !isSignup
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign in
              </button>

              <button
                type="button"
                onClick={() => setIsSignup(true)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-bold transition ${
                  isSignup
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isSignup ? "signup-heading" : "login-heading"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="mb-6"
              >
                <h2 className="text-3xl font-black tracking-tight text-foreground">
                  {authTitle}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  {authDescription}
                </p>
              </motion.div>
            </AnimatePresence>

            <Button
              type="button"
              variant="outline"
              className="h-13 w-full rounded-full border-border bg-background/75 text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-accent hover:text-accent-foreground"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-card text-sm font-black">
                G
              </span>
              Continue with Google
            </Button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              <AnimatePresence initial={false}>
                {isSignup && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-5 pb-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <Label className="text-sm font-semibold text-foreground">
                            Full name
                          </Label>
                          <div className="relative mt-2">
                            <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="text"
                              placeholder="Your full name"
                              className="h-13 rounded-full border-border bg-background/80 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                              value={fullName}
                              onChange={(event) =>
                                setFullName(event.target.value)
                              }
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-semibold text-foreground">
                            Phone number
                          </Label>
                          <div className="relative mt-2">
                            <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              type="tel"
                              placeholder="+233..."
                              className="h-13 rounded-full border-border bg-background/80 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                              value={phoneNumber}
                              onChange={(event) =>
                                setPhoneNumber(event.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <Label className="text-sm font-semibold text-foreground">
                              How will you use HireCore?
                            </Label>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Choose one or both. You can be a worker and an employer.
                            </p>
                          </div>

                          <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                            {selectedAccountTypeLabel}
                          </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {accountTypeCards.map((card) => {
                            const Icon = card.icon;
                            const selected = accountTypes.includes(card.value);

                            return (
                              <button
                                key={card.value}
                                type="button"
                                onClick={() => toggleAccountType(card.value)}
                                className={`group relative overflow-hidden rounded-[1.5rem] border p-4 text-left transition ${
                                  selected
                                    ? "border-primary bg-primary/[0.12] shadow-lg shadow-primary/10"
                                    : "border-border bg-background/70 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                    <Icon className="h-5 w-5" />
                                  </div>

                                  <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full border transition ${
                                      selected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border text-transparent"
                                    }`}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                    {card.highlight}
                                  </p>
                                  <h3 className="mt-1 text-base font-black text-foreground">
                                    {card.title}
                                  </h3>
                                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {card.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {accountTypes.includes("WORKER") && (
                        <div className="rounded-[1.5rem] border border-primary/20 bg-primary/[0.08] p-4">
                          <div className="flex gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                              <HandCoins className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-bold text-foreground">
                                Workers can later apply to join HireCore Workforce
                              </p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                This verification path helps workers build trust,
                                submit supporting documents when requested, and
                                qualify for stronger HireCore-assigned opportunities.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <Label className="text-sm font-semibold text-foreground">
                  Email
                </Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className="h-13 rounded-full border-border bg-background/80 pl-11 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-foreground">
                  Password
                </Label>
                <div className="relative mt-2">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="h-13 rounded-full border-border bg-background/80 pl-11 pr-12 text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="group h-13 w-full rounded-full bg-primary text-sm font-black text-primary-foreground shadow-xl shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {isSignup ? "Create HireCore Account" : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-[1.4rem] border border-border/70 bg-background/60 p-4 text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account?" : "New to HireCore?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignup((current) => !current)}
                className="font-black text-primary transition hover:underline"
              >
                {isSignup ? "Sign in" : "Create an account"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}