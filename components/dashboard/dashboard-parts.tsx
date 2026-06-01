import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight, Clock3,  ShieldCheck } from "lucide-react";

export function DashboardHero({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2.75rem] border border-border bg-card/90 p-7 shadow-xl backdrop-blur-2xl sm:p-9 lg:p-10">
      <div className="absolute right-0 top-0 h-72 w-72 translate-x-24 -translate-y-24 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-24 translate-y-24 rounded-full bg-secondary/15 blur-3xl" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>

        <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
          {title}
        </h1>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[2rem] border border-border bg-card/85 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black tracking-tight">{value}</p>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

export function DashboardPanel({
  title,
  description,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-border bg-card/85 p-5 shadow-sm backdrop-blur-xl sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <Link
          href={actionHref}
          className="shrink-0 rounded-full border border-border bg-background px-4 py-2 text-xs font-black text-muted-foreground transition hover:border-primary/30 hover:text-primary"
        >
          {actionLabel}
        </Link>
      </div>

      {children}
    </section>
  );
}

export function QuickAction({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[2rem] border border-border bg-card/85 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-5 text-xl font-black tracking-tight">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </Link>
  );
}

export function EmptyPanel({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/70 p-8 text-center">
      <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />

      <h3 className="mt-4 text-lg font-black">{title}</h3>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <Button asChild className="mt-5 rounded-full">
        <Link href={href}>
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export function DashboardLoading({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-muted-foreground">{label}</p>
      </div>
    </main>
  );
}

export function DashboardLocked() {
  return (
    <DashboardNotice
      title="Sign in required"
      description="You need to sign in before accessing your dashboard."
      href="/auth?redirect=/dashboard"
      cta="Sign in"
    />
  );
}

export function DashboardNotice({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <section className="w-full max-w-md rounded-[2rem] border border-border bg-card/90 p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-3xl font-black tracking-tight">{title}</h1>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {description}
        </p>

        <Button asChild className="mt-7 h-12 rounded-full bg-primary px-7 text-primary-foreground">
          <Link href={href}>{cta}</Link>
        </Button>
      </section>
    </main>
  );
}