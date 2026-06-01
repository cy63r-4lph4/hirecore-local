"use client";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Handshake,
  Layers3,
  MessageSquareWarning,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound,
} from "lucide-react";
import React, { useRef } from "react";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Sourcing Local Gig Intent",
    description:
      "Real-time visibility into localized task demands, giving skilled personnel direct proximity-based matchings.",
    icon: Search,
  },
  {
    title: "Secure Verification Pipeline",
    description:
      "Workers trigger contextual intent requests. Employers broadcast specialized work requirements seamlessly.",
    icon: ClipboardCheck,
  },
  {
    title: "Algorithmic Integrity Review",
    description:
      "Vigilant background processing and internal curation checks ensure platform sanity prior to market scale.",
    icon: ShieldCheck,
  },
  {
    title: "Fulfillment & Feedback Loops",
    description:
      "Connecting local skill directly to immediate local demand, running continuous iterative upgrades based on raw metrics.",
    icon: Handshake,
  },
];

const workerFlow = [
  "Provision custom domain profiles",
  "Filter high-yield operational tasks",
  "Direct contextual applications",
  "Monitor telemetry via the analytics dashboard",
];

const employerFlow = [
  "Provision secure entity controls",
  "Broadcast requirements or invite personnel",
  "Audit inbound applications or assign vetted assets",
  "Oversee real-time velocity on your dashboard",
];

const trustItems = [
  {
    title: "Verified Identity Registry",
    description:
      "Personnel go through strict structural verifications to foster accelerated transactional reliance.",
    icon: UserCheck,
  },
  {
    title: "Pre-Flight Guardrails",
    description:
      "All postings pass strict entry validations, filtering noise and keeping metrics clean.",
    icon: BadgeCheck,
  },
  {
    title: "Audit Trail Transparency",
    description:
      "Immutable interaction histories guarantee both parties retain flawless situational awareness.",
    icon: FileText,
  },
  {
    title: "Public Telemetry & Reporting",
    description:
      "Open telemetry channels let users explicitly surface anomalies instead of abandoning workflows.",
    icon: MessageSquareWarning,
  },
];

// Interactive 3D Tilt Card with dynamic light tracking
function AnimatedCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    // Calculate rotation angle (Max 10 degrees)
    const angleX = (yc - y) / 15;
    const angleY = (x - xc) / 15;

    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.01, 1.01, 1.01)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-md transition-all duration-200 ease-out will-change-transform",
        "before:absolute before:inset-0 before:-z-10 before:opacity-0 before:transition-opacity before:duration-500 before:bg-[radial-gradient(600px_circle_at_var(--mx)_var(--my),hsl(var(--primary)/0.08),transparent_40%)] hover:before:opacity-100",
        "after:absolute after:inset-0 after:-z-10 after:opacity-0 after:transition-opacity after:duration-500 after:bg-[radial-gradient(300px_circle_at_var(--mx)_var(--my),hsl(var(--primary)/0.15),transparent_80%)] hover:after:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Background Decorative Mesh grids */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <section className="relative px-4 pb-20 pt-36 sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-20 -z-10 h-[450px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Localized Execution. <br />
              Zero Structural Chaos.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              HireCore bridges raw execution capacity with localized demand. We
              bypass the marketplace bloat, bringing velocity and validated
              trust directly to the ground layer.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/tasks"
                className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.2)] transition-all hover:shadow-[0_0_40px_hsl(var(--primary)/0.4)] hover:brightness-110 active:scale-95"
              >
                Browse Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/workers"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-8 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
              >
                Find Workers
              </Link>
            </div>
          </div>

          {/* Steps Section using the dynamic Animated Card component */}
          <div className="mt-24 grid gap-6 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <AnimatedCard
                  key={step.title}
                  className="border-border/60 shadow-md"
                >
                  <div className="absolute right-6 top-4 text-7xl font-black text-muted/30 select-none transition-colors group-hover:text-primary/10">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-foreground border border-border transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:border-transparent">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </AnimatedCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <FlowCard
            eyebrow="Operational Pipeline"
            title="Convert raw skills into high-yield work options."
            description="Access the localized marketplace to acquire project listings directly, with dedicated pipeline telemetry on your personal dashboard."
            icon={BriefcaseBusiness}
            items={workerFlow}
            href="/tasks"
            cta="Explore tasks"
          />

          <FlowCard
            eyebrow="Strategic Deployment"
            title="Acquire capacity without administrative overhead."
            description="Publish task parameters, interface directly with verified personnel records, and handle systemic tracking natively."
            icon={UsersRound}
            items={employerFlow}
            href="/workers"
            cta="Find workers"
          />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-border/80 bg-gradient-to-b from-card/50 to-card/20 p-8 shadow-2xl backdrop-blur-xl sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="absolute -left-40 -top-40 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />

          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-semibold tracking-wider text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Structural Security Layer
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
                Rigid architecture, protected by design.
              </h2>

              <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                HireCore treats ecosystem health as a core primitive. By
                establishing structural frameworks early—such as rigid entity
                verification, explicit dashboard audit trails, and deterministic
                admin oversight—we secure true, continuous market integrity.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border/40 bg-background/40 p-6 transition-all duration-300 hover:bg-background/80 hover:border-primary/20 hover:shadow-lg"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border transition-colors group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h4 className="font-bold tracking-tight text-foreground">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-border bg-foreground p-8 text-background shadow-2xl sm:p-12 lg:p-16 relative">
          {/* Subtle pattern background within the CTA */}
          <div className="absolute inset-0 -z-10 opacity-5 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:3rem_3rem]" />

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center relative z-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-background/80">
                <Layers3 className="h-3.5 w-3.5" />
                Continuous Iteration Model
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-background">
                Shaped by real utilization.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-background/80">
                Our infrastructure scales directly alongside live usage. We ship
                constant system increments, actively listen to functional
                telemetry, and optimize code behavior continuously to streamline
                localized deployment.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col shrink-0 min-w-[200px]">
              <Link
                href="/bug-report"
                className="inline-flex h-12 items-center justify-center rounded-full bg-background px-6 text-sm font-bold text-foreground transition-transform hover:scale-[1.03] active:scale-95 shadow-lg"
              >
                Submit Telemetry / Bug
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>

              <Link
                href="/policies"
                className="inline-flex h-12 items-center justify-center rounded-full border border-background/20 bg-transparent px-6 text-sm font-bold text-background transition-colors hover:bg-background/10 active:scale-95"
              >
                System Policies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function FlowCard({
  eyebrow,
  title,
  description,
  icon: Icon,
  items,
  href,
  cta,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  href: string;
  cta: string;
}) {
  return (
    <AnimatedCard className="border-border/80 bg-card/20 shadow-xl p-8 sm:p-10">
      <div className="relative z-10">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.25)]">
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>

        <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-balance text-foreground">
          {title}
        </h3>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-8 space-y-3.5">
          {items.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-0.5 text-primary shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-foreground/90">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-2">
          <Link
            href={href}
            className={cn(
              "inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-semibold text-foreground transition-all",
              "hover:border-primary/40 hover:text-primary hover:shadow-sm",
            )}
          >
            {cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
}
