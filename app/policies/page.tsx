"use client";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Handshake,
  LockKeyhole,
  MessageSquareWarning,
  Scale,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform } from "framer-motion";
import React, { useRef } from "react";

const policies = [
  {
    title: "Fair Use Policy",
    description:
      "HireCore Local is for real work, real workers, and real employers. Fake posts, scams, spam, harassment, and attempts to exploit other users are not allowed.",
    icon: Scale,
    points: [
      "Post only genuine tasks or worker information.",
      "Do not impersonate another person or business.",
      "Do not use the platform to harass, deceive, or pressure users.",
      "Do not attempt to bypass account, review, or verification systems.",
    ],
    color: "primary" as const,
  },
  {
    title: "Task Posting Policy",
    description:
      "Tasks should be clear, lawful, and realistic. Employers are expected to provide enough detail for workers to understand the work before applying.",
    icon: BriefcaseBusiness,
    points: [
      "Use clear titles, descriptions, locations, and payment details.",
      "Do not post illegal, unsafe, misleading, or exploitative work.",
      "Do not request sensitive personal documents unless necessary for the job.",
      "HireCore may review, reject, close, or remove tasks that break platform rules.",
    ],
    color: "info" as const,
  },
  {
    title: "Worker Policy",
    description:
      "Workers are expected to represent themselves honestly and apply only for work they can reasonably perform.",
    icon: UsersRound,
    points: [
      "Use your real skills, experience, and availability.",
      "Do not submit fake documents or false profile information.",
      "Communicate respectfully with employers and platform admins.",
      "If accepted for work, show up and complete the task responsibly.",
    ],
    color: "success" as const,
  },
  {
    title: "Employer Policy",
    description:
      "Employers are expected to treat workers with respect, provide truthful task details, and avoid abusive hiring behavior.",
    icon: Handshake,
    points: [
      "Do not misrepresent task requirements, pay, or working conditions.",
      "Do not discriminate, threaten, abuse, or exploit workers.",
      "Do not ask workers to pay fees before getting work.",
      "Report issues clearly instead of handling disputes aggressively.",
    ],
    color: "success" as const,
  },
  {
    title: "Verification Policy",
    description:
      "Verification helps build trust, but it does not mean HireCore guarantees every user’s future behavior. It is a trust signal, not magic armor.",
    icon: UserCheck,
    points: [
      "Verification may require profile review, documents, or admin approval.",
      "Submitting false information may lead to rejection or account restriction.",
      "Verified status can be removed if a user breaks platform rules.",
      "HireCore may request extra documents when something needs clarification.",
    ],
    color: "warning" as const,
  },
  {
    title: "Safety & Prohibited Activity",
    description:
      "Some work does not belong on HireCore Local. The platform should not become a tunnel for danger, fraud, or exploitation.",
    icon: Ban,
    points: [
      "No illegal services, fraud, stolen goods, or harmful activities.",
      "No tasks involving violence, threats, sexual exploitation, or unsafe labor.",
      "No payment scams, advance-fee tricks, or fake job offers.",
      "No attempts to collect passwords, financial secrets, or private credentials.",
    ],
    color: "destructive" as const,
  },
  {
    title: "Privacy Policy",
    description:
      "HireCore Local collects the information needed to run accounts, tasks, applications, uploads, verification, and basic platform safety.",
    icon: LockKeyhole,
    points: [
      "User information may include profile details, contact details, uploaded files, task activity, and application history.",
      "Uploaded documents are used for application, verification, or review purposes.",
      "HireCore should not sell user data to advertisers.",
      "Users should avoid uploading unnecessary sensitive information.",
    ],
    color: "info" as const,
  },
  {
    title: "Bug Reports & Early Product Notice",
    description:
      "HireCore Local is being shipped early to provide value while improving. Bugs may happen. Reporting them helps shape the product faster.",
    icon: MessageSquareWarning,
    points: [
      "Users can report bugs, broken pages, confusing flows, or suspicious behavior.",
      "Bug reports should include clear steps, screenshots, or descriptions where possible.",
      "Reported bugs do not guarantee immediate fixes, but they help prioritize work.",
      "Critical safety or security issues should be treated with urgency.",
    ],
    color: "destructive" as const,
  },
];

const quickRules = [
  "Be honest.",
  "Respect people.",
  "Do not scam.",
  "Do not post illegal work.",
  "Do not upload fake documents.",
  "Report bugs instead of silently leaving.",
];

// Complete mapping connecting your colors dynamically to responsive border, text, bg, and shadow variables.
const colorSchemeMap = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "hover:border-primary/40",
    shadow: "hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)]", // Soft blue glow
    bulletBg: "bg-primary/10",
    bulletText: "text-primary",
  },
  info: {
    bg: "bg-sky-500/10",
    text: "text-sky-500",
    border: "hover:border-sky-500/40",
    shadow: "hover:shadow-[0_20px_50px_rgba(14,165,233,0.12)]", // Sky glow
    bulletBg: "bg-sky-500/10",
    bulletText: "text-sky-500",
  },
  success: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "hover:border-emerald-500/40",
    shadow: "hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)]", // Emerald glow
    bulletBg: "bg-emerald-500/10",
    bulletText: "text-emerald-500",
  },
  warning: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "hover:border-amber-500/40",
    shadow: "hover:shadow-[0_20px_50px_rgba(245,158,11,0.12)]", // Amber glow
    bulletBg: "bg-amber-500/10",
    bulletText: "text-amber-500",
  },
  destructive: {
    bg: "bg-red-500/10",
    text: "text-red-500",
    border: "hover:border-red-500/40",
    shadow: "hover:shadow-[0_20px_50px_rgba(239,68,68,0.12)]", // Red glow
    bulletBg: "bg-red-500/10",
    bulletText: "text-red-500",
  },
};

// 3D Tilt Card wrapper reacting gracefully to cursor proximity
function TiltCard({
  children,
  color,
  className,
}: {
  children: React.ReactNode;
  color: keyof typeof colorSchemeMap;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth transform values mapped to rotation angles
  const rotateX = useTransform(y, [-300, 300], [10, -10]);
  const rotateY = useTransform(x, [-300, 300], [-10, 10]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const scheme = colorSchemeMap[color];

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative overflow-hidden rounded-[2.2rem] border border-border bg-card/80 p-6 shadow-sm backdrop-blur-md",
        "transition-all duration-300 ease-out will-change-transform",
        scheme.border,
        scheme.shadow,
        className,
      )}
    >
      {/* Decorative colored ambient backdrop blob matching specific card colors */}
      <div
        className={cn(
          "absolute -right-20 -top-20 -z-10 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40",
          color === "primary" && "bg-primary/20",
          color === "info" && "bg-sky-500/20",
          color === "success" && "bg-emerald-500/20",
          color === "warning" && "bg-amber-500/20",
          color === "destructive" && "bg-red-500/20",
        )}
      />
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
        {children}
      </div>
    </motion.article>
  );
}

export default function PoliciesPage() {
  // Stagger parameters for landing sections
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      {/* Fluid glowing backgrounds */}
      <div className="absolute left-1/2 top-10 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-pulse pointer-events-none" />
      <div className="absolute right-10 top-44 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />

      <section className="relative overflow-hidden px-4 pb-16 pt-36 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-balance text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl bg-linear-to-b from-foreground to-foreground/80 bg-clip-text"
            >
              Simple rules for safer local work.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg"
            >
              HireCore Local is built around trust, clarity, and accountability.
              These policies explain what users can expect, what is not allowed,
              and how the platform handles early-stage imperfections.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/bug-report"
                className="group inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.25)] transition hover:bg-primary/90 active:scale-95"
              >
                Report an issue
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/how-it-works"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-surface-soft px-8 text-sm font-bold text-foreground transition hover:border-primary/40 hover:text-primary active:scale-95"
              >
                How it works
              </Link>
            </motion.div>
          </div>

          {/* Quick Rules Grid with animated bounce elements */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mx-auto mt-14 max-w-5xl rounded-[2rem] border border-border bg-card/75 p-5 shadow-sm backdrop-blur sm:p-6"
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickRules.map((rule, idx) => (
                <motion.div
                  key={rule}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="text-sm font-bold text-foreground/85">
                    {rule}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policies Interactive 3D Section */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2"
        >
          {policies.map((policy) => {
            const Icon = policy.icon;
            const colors = colorSchemeMap[policy.color];

            return (
              <TiltCard key={policy.title} color={policy.color}>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div
                    className={cn(
                      "flex h-13 w-13 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110",
                      colors.bg,
                      colors.text,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <BadgeCheck className="h-5 w-5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground/80" />
                </div>

                <h2
                  className={cn(
                    "text-2xl font-black tracking-tight transition-colors duration-200",
                    colors.text,
                  )}
                >
                  {policy.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {policy.description}
                </p>

                {/* Styled bullet lists that correspond in color directly with the parent card color */}
                <div className="mt-6 space-y-3.5 border-t border-border/60 pt-5">
                  {policy.points.map((point) => (
                    <motion.div
                      key={point}
                      whileHover={{ x: 4 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 12,
                      }}
                      className="flex items-start gap-3 group/item cursor-default"
                    >
                      <div
                        className={cn(
                          "mt-1 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md transition-colors",
                          colors.bulletBg,
                          colors.bulletText,
                        )}
                      >
                        <ShieldCheck className="h-3 w-3" />
                      </div>
                      <p className="text-sm leading-6 text-foreground/80 transition-colors group-hover/item:text-foreground">
                        {point}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </TiltCard>
            );
          })}
        </motion.div>
      </section>

      {/* Living Draft Notice */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-foreground p-8 text-background shadow-2xl relative"
        >
          {/* Subtle grid accent behind bottom block */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[2rem_2rem]" />

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center relative z-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-background/80">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-300" />
                Important Note
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-4xl text-background">
                These policies are a living draft.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-background/80 sm:text-base">
                HireCore Local is still growing. These policies should guide the
                platform now, but they should become more formal as the product
                gets real users, payments, disputes, verification, and stronger
                legal requirements.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col shrink-0 min-w-50">
              <Link
                href="/bug-report"
                className="inline-flex h-12 items-center justify-center rounded-full bg-background px-6 text-sm font-black text-foreground transition-transform hover:scale-[1.03] active:scale-95"
              >
                Report a bug
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/tasks"
                className="inline-flex h-12 items-center justify-center rounded-full border border-background/20 px-6 text-sm font-black text-background transition hover:bg-background/10 active:scale-95"
              >
                Browse tasks
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
