"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Gem,
  Mail,
  MapPin,
  Phone,
  Radar,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserRound,
  WalletCards,
  Workflow,
  X,
} from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProfileUpdatePanel } from "@/components/profile/ProfileUpdatePanel";

type AccountType = "WORKER" | "EMPLOYER";

type HireCoreUser = {
  id: string;
  email: string;
  googleId?: string | null;
  fullName: string;
  phoneNumber?: string | null;
  role: string;

  profileImageUrl?: string | null;

  accountTypes?: AccountType[];

  emailVerifiedAt?: string | Date | null;
  phoneVerifiedAt?: string | Date | null;
  verifiedAt?: string | Date | null;

  verification?: {
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    isAdminVerified?: boolean;
  };

  trust?: {
    workerScore?: number | null;
    employerScore?: number | null;
  };

  capabilities?: {
    isWorker?: boolean;
    isEmployer?: boolean;
    canApplyToJobs?: boolean;
    canPostJobs?: boolean;
    isWorkforceMember?: boolean;
    isWorkerVerified?: boolean;
    isEmployerVerified?: boolean;
  };

  workerProfile?: {
    id: string;
    bio?: string | null;
    skills?: string[];
    location?: string | null;
    isAvailable?: boolean;
    isVerified?: boolean;
    verifiedAt?: string | Date | null;
    isWorkforceMember?: boolean;
    trustScore?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  } | null;

  employerProfile?: {
    id: string;
    companyName?: string | null;
    location?: string | null;
    isVerified?: boolean;
    verifiedAt?: string | Date | null;
    trustScore?: number;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  } | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type TrustTone = "foundation" | "rising" | "trusted" | "strong" | "elite";

function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "HireCore User";

  return source
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function absoluteImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const origin = apiBase.replace(/\/api\/?$/, "");

  return `${origin}${url}`;
}

function formatRole(role?: string) {
  if (!role) return "Member";

  return role
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | Date | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function clampTrust(score?: number | null) {
  const value = score ?? 0;
  return Math.max(0, Math.min(1000, value));
}

function trustTier(score?: number | null): {
  label: string;
  description: string;
  tone: TrustTone;
} {
  const value = clampTrust(score);

  if (value >= 800) {
    return {
      label: "Elite Signal",
      description:
        "An unusually strong trust footprint. This profile carries deep platform confidence.",
      tone: "elite",
    };
  }

  if (value >= 600) {
    return {
      label: "Strong Signal",
      description:
        "A high-confidence identity with meaningful trust markers already established.",
      tone: "strong",
    };
  }

  if (value >= 350) {
    return {
      label: "Trusted",
      description:
        "A dependable profile with growing verification and marketplace confidence.",
      tone: "trusted",
    };
  }

  if (value >= 180) {
    return {
      label: "Rising",
      description:
        "A profile gathering stronger proof, stronger signals, and more platform credibility.",
      tone: "rising",
    };
  }

  return {
    label: "Foundation",
    description:
      "A fresh trust profile. Verification, profile completion, and approvals will strengthen it.",
    tone: "foundation",
  };
}

function trustToneClasses(tone: TrustTone) {
  switch (tone) {
    case "elite":
      return {
        shell:
          "border-amber-400/35 bg-amber-500/[0.10] text-amber-700 dark:text-amber-300",
        bar: "bg-amber-500",
        badge:
          "border-amber-400/30 bg-amber-500/15 text-amber-700 dark:text-amber-300",
      };

    case "strong":
      return {
        shell:
          "border-emerald-400/35 bg-emerald-500/[0.10] text-emerald-700 dark:text-emerald-300",
        bar: "bg-emerald-500",
        badge:
          "border-emerald-400/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
      };

    case "trusted":
      return {
        shell: "border-primary/30 bg-primary/[0.10] text-primary",
        bar: "bg-primary",
        badge: "border-primary/25 bg-primary/15 text-primary",
      };

    case "rising":
      return {
        shell:
          "border-sky-400/30 bg-sky-500/[0.10] text-sky-700 dark:text-sky-300",
        bar: "bg-sky-500",
        badge: "border-sky-400/25 bg-sky-500/15 text-sky-700 dark:text-sky-300",
      };

    default:
      return {
        shell: "border-border bg-muted/50 text-muted-foreground",
        bar: "bg-muted-foreground",
        badge: "border-border bg-muted text-muted-foreground",
      };
  }
}

function scoreProgress(score?: number | null) {
  return `${(clampTrust(score) / 1000) * 100}%`;
}

function accountLabel(types: AccountType[]) {
  if (types.includes("WORKER") && types.includes("EMPLOYER")) {
    return "Worker + Employer";
  }

  if (types.includes("WORKER")) return "Worker";
  if (types.includes("EMPLOYER")) return "Employer";

  return "No account path";
}

function profileCompleteness(user: HireCoreUser) {
  const indicators: boolean[] = [];

  if (user.fullName?.trim()) indicators.push(true);
  if (user.email?.trim()) indicators.push(true);
  if (user.phoneNumber?.trim()) indicators.push(true);
  if (user.profileImageUrl) indicators.push(true);

  if (user.workerProfile) {
    indicators.push(Boolean(user.workerProfile.bio?.trim()));
    indicators.push(Boolean(user.workerProfile.location?.trim()));
    indicators.push(Boolean(user.workerProfile.skills?.length));
  }

  if (user.employerProfile) {
    indicators.push(Boolean(user.employerProfile.companyName?.trim()));
    indicators.push(Boolean(user.employerProfile.location?.trim()));
  }

  if (indicators.length === 0) return 0;

  return Math.round(
    (indicators.filter(Boolean).length / indicators.length) * 100,
  );
}

function nextBestMove(user: HireCoreUser) {
  const isEmailVerified = Boolean(
    user.verification?.isEmailVerified || user.emailVerifiedAt,
  );

  const worker = user.workerProfile;
  const employer = user.employerProfile;

  if (!isEmailVerified) {
    return {
      eyebrow: "Trust unlock",
      title: "Verify your email address",
      description:
        "Marketplace actions are trust-sensitive. Email verification is the first door worth opening.",
      href: "/auth",
      cta: "Go to auth center",
    };
  }

  if (!user.profileImageUrl) {
    return {
      eyebrow: "Profile polish",
      title: "Add a profile picture",
      description:
        "A clear profile image makes your marketplace identity feel more human and recognizable.",
      href: "/profile",
      cta: "Update profile",
      action: "edit-profile",
    };
  }

  if (worker && (!worker.bio || !worker.location || !worker.skills?.length)) {
    return {
      eyebrow: "Worker profile",
      title: "Complete your worker identity",
      description:
        "Your trust score exists, but your profile still needs stronger signal: bio, skills, and location.",
      href: "/profile",
      cta: "Update worker details",
      action: "edit-profile",
    };
  }

  if (worker && !worker.isWorkforceMember) {
    return {
      eyebrow: "HireCore Workforce",
      title: "Apply to join the verified workforce",
      description:
        "Your worker path is active. The next elevation is a reviewed workforce application.",
      href: "/apply-workforce",
      cta: "Apply to workforce",
    };
  }

  if (
    employer &&
    (!employer.companyName?.trim() || !employer.location?.trim())
  ) {
    return {
      eyebrow: "Employer profile",
      title: "Strengthen your hiring identity",
      description:
        "Complete your company name and location so job seekers can trust who is posting opportunities.",
      href: "/profile",
      cta: "Update employer details",
      action: "edit-profile",
    };
  }

  if (employer) {
    return {
      eyebrow: "Employer momentum",
      title: "Your trust layer is active",
      description:
        "Keep building credibility through approved listings and a clear employer footprint.",
      href: "/",
      cta: "Return to marketplace",
    };
  }

  return {
    eyebrow: "Identity signal",
    title: "Your profile foundation is ready",
    description:
      "Your account is set up. Keep growing your HireCore presence through meaningful activity.",
    href: "/",
    cta: "Return home",
  };
}

export default function ProfilePage() {
  const { user, loading, authenticated } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const profileUser = user as HireCoreUser | null;

  if (loading && !profileUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-bold text-muted-foreground">
            Syncing your HireCore identity...
          </p>
        </div>
      </main>
    );
  }

  if (!authenticated || !profileUser) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-foreground">
        <BackgroundGlow />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg rounded-[2.5rem] border border-border bg-card/90 p-8 text-center shadow-2xl backdrop-blur-2xl sm:p-10"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-primary/20 bg-primary/10 text-primary">
            <ShieldCheck className="h-9 w-9" />
          </div>

          <h1 className="mt-7 text-4xl font-black tracking-tight">
            Profile locked
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:text-base">
            Sign in to view your trust signals, marketplace identity, and
            HireCore profile progress.
          </p>

          <Link href="/auth" className="mt-8 block">
            <Button className="h-14 w-full rounded-full bg-primary text-base font-black text-primary-foreground shadow-xl shadow-primary/20">
              Secure sign in
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.section>
      </main>
    );
  }

  const accountTypes = profileUser.accountTypes ?? [];
  const verification = profileUser.verification ?? {};
  const capabilities = profileUser.capabilities ?? {};

  const profileImageUrl = absoluteImageUrl(profileUser.profileImageUrl);

  const emailVerified = Boolean(
    verification.isEmailVerified || profileUser.emailVerifiedAt,
  );

  const phoneVerified = Boolean(
    verification.isPhoneVerified || profileUser.phoneVerifiedAt,
  );

  const adminVerified = Boolean(
    verification.isAdminVerified || profileUser.verifiedAt,
  );

  const isWorker = Boolean(capabilities.isWorker || profileUser.workerProfile);
  const isEmployer = Boolean(
    capabilities.isEmployer || profileUser.employerProfile,
  );

  const isWorkforceMember = Boolean(
    capabilities.isWorkforceMember ||
      profileUser.workerProfile?.isWorkforceMember,
  );

  const workerVerified = Boolean(
    capabilities.isWorkerVerified || profileUser.workerProfile?.isVerified,
  );

  const employerVerified = Boolean(
    capabilities.isEmployerVerified ||
      profileUser.employerProfile?.isVerified,
  );

  const workerTrust =
    profileUser.trust?.workerScore ??
    profileUser.workerProfile?.trustScore ??
    null;

  const employerTrust =
    profileUser.trust?.employerScore ??
    profileUser.employerProfile?.trustScore ??
    null;

  const completion = profileCompleteness(profileUser);
  const recommendation = nextBestMove(profileUser);

  const handleRecommendationClick = () => {
    if (recommendation.action === "edit-profile") {
      setEditOpen(true);
    }
  };

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-background text-foreground selection:bg-primary/20">
        <BackgroundGlow />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-32">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/"
              className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-2.5 text-sm font-bold backdrop-blur-xl transition hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              Return home
            </Link>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <motion.aside
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <div className="overflow-hidden rounded-[2.75rem] border border-border bg-card/90 shadow-2xl shadow-black/5 backdrop-blur-3xl dark:bg-card/35">
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-secondary/20">
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                  <div className="absolute -bottom-14 left-0 h-36 w-36 rounded-full bg-secondary/20 blur-3xl" />
                </div>

                <div className="relative px-7 pb-8">
                  <div className="-mt-16 flex justify-center">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-[2.25rem] bg-primary/25 blur-2xl" />

                      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2.25rem] border-4 border-card bg-gradient-to-tr from-primary to-secondary text-4xl font-black text-white shadow-2xl">
                        {profileImageUrl ? (
                          <Image
                            src={profileImageUrl}
                            alt={profileUser.fullName}
                            width={128}
                            height={128}
                            className="h-full w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          getInitials(profileUser.fullName, profileUser.email)
                        )}
                      </div>

                      {(workerVerified ||
                        employerVerified ||
                        adminVerified) && (
                        <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-lg">
                          <BadgeCheck className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <h1 className="text-3xl font-black tracking-tight">
                      {profileUser.fullName}
                    </h1>

                    <p className="mt-2 truncate text-sm font-semibold text-muted-foreground">
                      {profileUser.email}
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      <StatusPill active label={formatRole(profileUser.role)} />
                      <StatusPill
                        active={accountTypes.length > 0}
                        label={accountLabel(accountTypes)}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setEditOpen(true)}
                    className="mt-7 h-12 w-full rounded-full bg-primary text-primary-foreground shadow-[var(--glow-primary)]"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Update profile
                  </Button>

                  <div className="mt-8 rounded-[2rem] border border-border bg-background/65 p-5 shadow-sm">
                    <div className="space-y-4">
                      <IdentityRow
                        icon={Mail}
                        label="Email"
                        value={profileUser.email}
                      />

                      <IdentityRow
                        icon={Phone}
                        label="Phone"
                        value={profileUser.phoneNumber || "Not added"}
                      />

                      <IdentityRow
                        icon={CalendarDays}
                        label="Joined"
                        value={formatDate(profileUser.createdAt)}
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    <StatusBadgeCard
                      icon={ShieldCheck}
                      title="Email verification"
                      active={emailVerified}
                      value={emailVerified ? "Verified" : "Pending"}
                    />

                    <StatusBadgeCard
                      icon={Phone}
                      title="Phone verification"
                      active={phoneVerified}
                      value={phoneVerified ? "Verified" : "Not verified"}
                    />

                    <StatusBadgeCard
                      icon={BadgeCheck}
                      title="Admin review"
                      active={adminVerified}
                      value={adminVerified ? "Reviewed" : "Not reviewed"}
                    />
                  </div>
                </div>
              </div>
            </motion.aside>

            <section className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="relative overflow-hidden rounded-[2.75rem] border border-border bg-card/90 p-7 shadow-xl shadow-black/5 backdrop-blur-3xl dark:bg-card/25 sm:p-9 lg:p-10"
              >
                <div className="absolute right-0 top-0 h-72 w-72 translate-x-24 -translate-y-24 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-24 translate-y-24 rounded-full bg-secondary/15 blur-3xl" />

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                    <Sparkles className="h-4 w-4" />
                    HireCore Trust Profile
                  </div>

                  <h2 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    Your identity is becoming{" "}
                    <span className="bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent">
                      discoverable trust.
                    </span>
                  </h2>

                  <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                    HireCore does not reduce people to flat profiles. Your
                    verification, your account paths, your workforce standing,
                    and your trust scores become the signal that helps the right
                    opportunities find you.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Profile strength"
                      value={`${completion}%`}
                      detail="Based on visible identity and profile completeness."
                      icon={Radar}
                    />

                    <MetricCard
                      label="Account paths"
                      value={`${accountTypes.length}`}
                      detail={accountLabel(accountTypes)}
                      icon={Workflow}
                    />

                    <MetricCard
                      label="Workforce"
                      value={isWorkforceMember ? "Active" : "Pending"}
                      detail={
                        isWorkforceMember
                          ? "You are part of the HireCore Workforce."
                          : isWorker
                            ? "Apply when your worker profile is ready."
                            : "Worker path not enabled."
                      }
                      icon={BriefcaseBusiness}
                    />

                    <MetricCard
                      label="Trust axis"
                      value={
                        workerTrust !== null || employerTrust !== null
                          ? `${Math.max(workerTrust ?? 0, employerTrust ?? 0)}`
                          : "—"
                      }
                      detail="Your strongest current trust signal."
                      icon={Star}
                    />
                  </div>
                </div>
              </motion.div>

              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-5 xl:grid-cols-2"
              >
                {isWorker && (
                  <TrustScoreCard
                    title="Worker trust score"
                    score={workerTrust}
                    description={
                      workerVerified
                        ? "Your worker trust is reinforced by verified profile signals and workforce confidence."
                        : "Worker trust grows through verification, profile quality, and approved platform milestones."
                    }
                    icon={BriefcaseBusiness}
                  />
                )}

                {isEmployer && (
                  <TrustScoreCard
                    title="Employer trust score"
                    score={employerTrust}
                    description={
                      employerVerified
                        ? "Your employer identity carries reviewed trust signals that can strengthen job visibility."
                        : "Employer trust grows through verification, approved listings, and a complete hiring identity."
                    }
                    icon={Building2}
                  />
                )}

                {!isWorker && !isEmployer && (
                  <div className="rounded-[2.25rem] border border-dashed border-border bg-card/70 p-7 text-center">
                    <CircleUserRound className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-black">
                      No marketplace path selected yet
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Choose Worker, Employer, or both to activate a trust score
                      track.
                    </p>
                  </div>
                )}
              </motion.section>

              <div className="grid gap-8 xl:grid-cols-[1.04fr_0.96fr]">
                <motion.section
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="rounded-[2.75rem] border border-border bg-card/85 p-7 shadow-sm dark:bg-card/25 sm:p-8"
                >
                  <div className="mb-8">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
                      Trust journey
                    </p>
                    <h3 className="mt-2 text-3xl font-black tracking-tight">
                      The ladder beneath your score
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      These milestones shape how your trust profile begins to
                      matter across HireCore.
                    </p>
                  </div>

                  <JourneyStep
                    title="Account created"
                    description={`Your HireCore identity began on ${formatDate(
                      profileUser.createdAt,
                    )}.`}
                    icon={UserRound}
                    active
                  />

                  <JourneyStep
                    title="Email verified"
                    description={
                      emailVerified
                        ? "Your email ownership has been confirmed."
                        : "Verify your email to unlock trust-sensitive marketplace actions."
                    }
                    icon={Mail}
                    active={emailVerified}
                  />

                  <JourneyStep
                    title="Marketplace path established"
                    description={
                      accountTypes.length > 0
                        ? `You are active as ${accountLabel(accountTypes)}.`
                        : "No worker or employer account path has been selected."
                    }
                    icon={Workflow}
                    active={accountTypes.length > 0}
                  />

                  {isWorker && (
                    <JourneyStep
                      title="Worker verification"
                      description={
                        workerVerified
                          ? "Your worker profile carries a verified trust signal."
                          : "Worker verification has not been completed yet."
                      }
                      icon={ShieldCheck}
                      active={workerVerified}
                    />
                  )}

                  {isWorker && (
                    <JourneyStep
                      title="HireCore Workforce"
                      description={
                        isWorkforceMember
                          ? "You are approved as part of the workforce pool."
                          : "Approval into the workforce can further strengthen your platform signal."
                      }
                      icon={Gem}
                      active={isWorkforceMember}
                      last={!isEmployer}
                    />
                  )}

                  {isEmployer && (
                    <JourneyStep
                      title="Employer verification"
                      description={
                        employerVerified
                          ? "Your employer identity is marked as reviewed and trusted."
                          : "Employer verification has not been completed yet."
                      }
                      icon={Building2}
                      active={employerVerified}
                      last
                    />
                  )}
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="group relative flex min-h-full flex-col justify-between overflow-hidden rounded-[2.75rem] bg-primary p-7 text-primary-foreground shadow-2xl shadow-primary/20 sm:p-8"
                >
                  <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
                  <div className="absolute -bottom-20 left-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

                  <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                      <TrendingUp className="h-7 w-7 text-white" />
                    </div>

                    <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-white/75">
                      {recommendation.eyebrow}
                    </p>

                    <h3 className="mt-3 text-3xl font-black tracking-tight text-white">
                      {recommendation.title}
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-white/85">
                      {recommendation.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-10">
                    {recommendation.action === "edit-profile" ? (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleRecommendationClick}
                        className="h-14 w-full rounded-2xl font-black transition hover:scale-[1.02]"
                      >
                        {recommendation.cta}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <Link href={recommendation.href}>
                        <Button
                          variant="secondary"
                          className="h-14 w-full rounded-2xl font-black transition hover:scale-[1.02]"
                        >
                          {recommendation.cta}
                          <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.section>
              </div>

              <div className="grid gap-8 xl:grid-cols-2">
                {isWorker && profileUser.workerProfile && (
                  <ProfilePathCard
                    eyebrow="Worker path"
                    title="Your worker identity"
                    icon={BriefcaseBusiness}
                    pills={[
                      profileUser.workerProfile.isAvailable
                        ? "Available"
                        : "Unavailable",
                      profileUser.workerProfile.isVerified
                        ? "Verified"
                        : "Unverified",
                      profileUser.workerProfile.isWorkforceMember
                        ? "Workforce member"
                        : "Not workforce",
                    ]}
                  >
                    <DetailRow
                      label="Location"
                      value={profileUser.workerProfile.location || "Not added"}
                      icon={MapPin}
                    />

                    <DetailRow
                      label="Bio"
                      value={
                        profileUser.workerProfile.bio ||
                        "No worker bio has been added yet."
                      }
                      icon={UserRound}
                    />

                    <div className="mt-5">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                        Skills
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {profileUser.workerProfile.skills?.length ? (
                          profileUser.workerProfile.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-black text-primary"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No skills added yet.
                          </span>
                        )}
                      </div>
                    </div>
                  </ProfilePathCard>
                )}

                {isEmployer && profileUser.employerProfile && (
                  <ProfilePathCard
                    eyebrow="Employer path"
                    title="Your hiring identity"
                    icon={Building2}
                    pills={[
                      profileUser.employerProfile.isVerified
                        ? "Verified employer"
                        : "Unverified employer",
                      profileUser.employerProfile.companyName
                        ? "Company added"
                        : "Company missing",
                    ]}
                  >
                    <DetailRow
                      label="Company"
                      value={
                        profileUser.employerProfile.companyName ||
                        "Company name not added"
                      }
                      icon={WalletCards}
                    />

                    <DetailRow
                      label="Location"
                      value={
                        profileUser.employerProfile.location ||
                        "Employer location not added"
                      }
                      icon={MapPin}
                    />

                    <DetailRow
                      label="Verified"
                      value={
                        profileUser.employerProfile.isVerified
                          ? `Reviewed ${
                              profileUser.employerProfile.verifiedAt
                                ? `on ${formatDate(
                                    profileUser.employerProfile.verifiedAt,
                                  )}`
                                : ""
                            }`
                          : "Employer profile not verified yet"
                      }
                      icon={ShieldCheck}
                    />
                  </ProfilePathCard>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <ProfileEditModal
        open={editOpen}
        user={profileUser}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

function ProfileEditModal({
  open,
  user,
  onClose,
}: {
  open: boolean;
  user: HireCoreUser;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/75 px-4 py-8 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Close profile editor"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Profile editor
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Update your HireCore profile
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Edit your identity, profile image, worker details, and employer
              details without breaking the profile overview flow.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-8">
          <ProfileUpdatePanel user={user} />
        </div>
      </motion.section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[2rem] border border-border bg-card/85 p-5 shadow-sm transition hover:border-primary/30 hover:shadow-lg dark:bg-card/35 dark:backdrop-blur-2xl"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-black tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      </div>
    </motion.div>
  );
}

function TrustScoreCard({
  title,
  score,
  description,
  icon: Icon,
}: {
  title: string;
  score?: number | null;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const tier = trustTier(score);
  const tone = trustToneClasses(tier.tone);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={cn(
        "relative overflow-hidden rounded-[2.25rem] border p-6 shadow-sm transition",
        tone.shell,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-current/15 bg-background/70">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] opacity-75">
              {title}
            </p>
            <p className="mt-1 text-3xl font-black tracking-tight">
              {score ?? "—"}
              <span className="ml-1 text-base font-bold opacity-60">/1000</span>
            </p>
          </div>
        </div>

        <span
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em]",
            tone.badge,
          )}
        >
          {tier.label}
        </span>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-background/70">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: scoreProgress(score) }}
        />
      </div>

      <p className="mt-4 text-sm leading-7 opacity-85">{tier.description}</p>
      <p className="mt-3 text-sm leading-7 opacity-80">{description}</p>
    </motion.div>
  );
}

function JourneyStep({
  title,
  description,
  icon: Icon,
  active,
  last,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  last?: boolean;
}) {
  return (
    <div className="relative flex gap-5 pb-7">
      {!last && (
        <div className="absolute left-[21px] top-11 h-[calc(100%-22px)] w-px bg-gradient-to-b from-border via-border to-transparent" />
      )}

      <div
        className={cn(
          "relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition",
          active
            ? "border-primary/35 bg-primary/10 text-primary shadow-sm"
            : "border-border bg-muted text-muted-foreground",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="pt-1">
        <h3
          className={cn(
            "text-base font-black",
            active ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function StatusPill({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.15em]",
        active
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          active ? "bg-primary" : "bg-muted-foreground/55",
        )}
      />
      {label}
    </span>
  );
}

function IdentityRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-bold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadgeCard({
  icon: Icon,
  title,
  active,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  active: boolean;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-border bg-background/65 p-4">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            active
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-sm font-bold">{value}</p>
        </div>
      </div>

      <CheckCircle2
        className={cn(
          "h-5 w-5",
          active ? "text-primary" : "text-muted-foreground/40",
        )}
      />
    </div>
  );
}

function ProfilePathCard({
  eyebrow,
  title,
  icon: Icon,
  pills,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  pills: string[];
  children: React.ReactNode;
}) {
  return (
    <motion.section
      whileHover={{ y: -4 }}
      className="rounded-[2.5rem] border border-border bg-card/85 p-7 shadow-sm transition hover:border-primary/25 dark:bg-card/25"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">{title}</h3>
        </div>

        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {pills.map((pill) => (
          <span
            key={pill}
            className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs font-black text-muted-foreground"
          >
            {pill}
          </span>
        ))}
      </div>

      <div className="mt-6 space-y-5">{children}</div>
    </motion.section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-[1.5rem] border border-border bg-background/60 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-sm leading-7 text-foreground">{value}</p>
      </div>
    </div>
  );
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,hsl(var(--primary)/0.18),transparent_30%),radial-gradient(circle_at_88%_80%,hsl(var(--secondary)/0.16),transparent_32%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40" />
    </div>
  );
}