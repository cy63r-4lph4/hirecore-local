"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bug,
  CheckCircle2,
  ClipboardList,
  Info,
  LifeBuoy,
  Mail,
  MessageSquareWarning,
  ShieldAlert,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api/axios";

type BugReportType =
  | "BROKEN_PAGE"
  | "LOGIN_ACCOUNT"
  | "TASK_APPLICATION"
  | "UPLOAD_PROBLEM"
  | "DASHBOARD_BUG"
  | "SECURITY_CONCERN"
  | "PAYMENT_PRICING"
  | "CONFUSING_FLOW"
  | "OTHER";

type BugReportPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const issueTypes: Array<{ value: BugReportType; label: string }> = [
  { value: "BROKEN_PAGE", label: "Broken page" },
  { value: "LOGIN_ACCOUNT", label: "Login or account issue" },
  { value: "TASK_APPLICATION", label: "Task/application issue" },
  { value: "UPLOAD_PROBLEM", label: "Upload problem" },
  { value: "DASHBOARD_BUG", label: "Dashboard bug" },
  { value: "SECURITY_CONCERN", label: "Security concern" },
  { value: "PAYMENT_PRICING", label: "Payment or pricing issue" },
  { value: "CONFUSING_FLOW", label: "Confusing flow" },
  { value: "OTHER", label: "Other" },
];

const priorities: Array<{
  value: BugReportPriority;
  label: string;
  description: string;
}> = [
  {
    value: "LOW",
    label: "Low",
    description: "Small issue. Annoying, but not blocking.",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Something important is not working properly.",
  },
  {
    value: "HIGH",
    label: "High",
    description: "A key flow is broken or users are blocked.",
  },
  {
    value: "CRITICAL",
    label: "Critical",
    description: "Security, data loss, or serious platform abuse.",
  },
];

const helpfulDetails = [
  "What were you trying to do?",
  "What actually happened?",
  "What did you expect to happen?",
  "Which page or dashboard were you using?",
  "Can the issue happen again if you retry?",
];

const priorityColorMap: Record<
  BugReportPriority,
  {
    border: string;
    bg: string;
    glow: string;
    text: string;
  }
> = {
  LOW: {
    border: "border-sky-500/30",
    bg: "bg-sky-500/5",
    glow: "rgba(14, 165, 233, 0.15)",
    text: "text-sky-400",
  },
  MEDIUM: {
    border: "border-amber-500/30",
    bg: "bg-amber-500/5",
    glow: "rgba(245, 158, 11, 0.15)",
    text: "text-amber-400",
  },
  HIGH: {
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    glow: "rgba(249, 115, 22, 0.15)",
    text: "text-orange-400",
  },
  CRITICAL: {
    border: "border-red-500/35",
    bg: "bg-red-500/5",
    glow: "rgba(239, 68, 68, 0.18)",
    text: "text-red-400",
  },
};

type BugReportForm = {
  type: BugReportType;
  priority: BugReportPriority;
  title: string;
  description: string;
  steps: string;
  pageUrl: string;
  reporterEmail: string;
  contactName: string;
  contactPhone: string;
};

function Interactive3DCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-200, 200], [8, -8]);
  const rotateY = useTransform(x, [-200, 200], [-8, 8]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - rect.width / 2;
    const mouseY = event.clientY - rect.top - rect.height / 2;

    x.set(mouseX);
    y.set(mouseY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "group relative overflow-hidden rounded-[2rem] border border-border bg-card/60 p-6 shadow-md backdrop-blur-md transition-all duration-300 ease-out hover:border-primary/30 hover:shadow-xl",
        className,
      )}
    >
      <div style={{ transform: "translateZ(25px)" }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default function BugReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState<BugReportForm>({
    type: "BROKEN_PAGE",
    priority: "MEDIUM",
    title: "",
    description: "",
    steps: "",
    pageUrl: "",
    reporterEmail: "",
    contactName: "",
    contactPhone: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length >= 5 &&
      form.description.trim().length >= 15 &&
      !submitting
    );
  }, [form.title, form.description, submitting]);

  function updateField<K extends keyof BugReportForm>(
    field: K,
    value: BugReportForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      await api.post("/bug-reports", {
        type: form.type,
        priority: form.priority,
        title: form.title.trim(),
        description: form.description.trim(),
        steps: optionalTrim(form.steps),
        pageUrl: optionalTrim(form.pageUrl),
        reporterEmail: optionalTrim(form.reporterEmail),
        contactName: optionalTrim(form.contactName),
        contactPhone: optionalTrim(form.contactPhone),
        assetIds: [],
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit bug report:", error);
      setSubmitError(
        "The report could not be submitted. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setSubmitted(false);
    setSubmitError("");
    setForm({
      type: "BROKEN_PAGE",
      priority: "MEDIUM",
      title: "",
      description: "",
      steps: "",
      pageUrl: "",
      reporterEmail: "",
      contactName: "",
      contactPhone: "",
    });
  }

  const fadeUpContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const fadeUpItem = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-40 mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <section className="relative overflow-hidden px-4 pb-20 pt-36 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-10 -z-20 h-96 w-150 -translate-x-1/2 animate-pulse rounded-full bg-primary/10 blur-[130px]" />
        <div className="pointer-events-none absolute right-10 top-44 -z-20 h-72 w-72 rounded-full bg-primary/5 blur-[100px]" />

        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="bg-linear-to-b from-foreground to-foreground/80 bg-clip-text text-balance text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Found a crack in the system?
              </h1>

              <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                HireCore Local is being shipped in the real world, not hidden in
                a lab forever. Report broken pages, confusing flows, upload
                issues, dashboard bugs, or anything that blocks users.
              </p>

              <motion.div
                variants={fadeUpContainer}
                initial="hidden"
                animate="visible"
                className="mt-10 grid gap-4 sm:grid-cols-2"
              >
                <InfoCard
                  icon={Bug}
                  title="Product bugs"
                  description="Broken pages, failed actions, weird UI states, missing dashboard data, or unexpected behavior."
                />

                <InfoCard
                  icon={ShieldAlert}
                  title="Security concerns"
                  description="Suspicious access, exposed data, abuse patterns, or anything that feels unsafe."
                />

                <InfoCard
                  icon={ClipboardList}
                  title="Clear workflows"
                  description="Steps, page URLs, expected behavior, and actual results help turn reports into fixes."
                />

                <InfoCard
                  icon={LifeBuoy}
                  title="Open reporting"
                  description="The product is early, so clean feedback is part of the build system."
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative mt-8 overflow-hidden rounded-[2rem] border border-amber-500/20 bg-amber-500/5 p-6 backdrop-blur-md"
              >
                <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl" />

                <div className="relative z-10 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-extrabold tracking-tight text-amber-400">
                      Sensitive data warning
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-amber-500/80">
                      Do not submit passwords, private keys, access tokens, or
                      raw exploit instructions. Keep the report clear but safe.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <Interactive3DCard className="relative border-border/80 shadow-2xl">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <SuccessState key="success" onReset={resetForm} />
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">
                        Submit Report
                      </p>

                      <h2 className="mt-2 text-2xl font-extrabold tracking-tight">
                        Tell us what broke.
                      </h2>

                      <p className="mt-2 text-sm text-muted-foreground">
                        A good report gives the path, the expected result, and
                        the actual result.
                      </p>
                    </div>

                    {submitError && (
                      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                        {submitError}
                      </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Issue type">
                        <select
                          value={form.type}
                          onChange={(event) =>
                            updateField(
                              "type",
                              event.target.value as BugReportType,
                            )
                          }
                          className="h-12 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm font-semibold outline-none transition focus:border-primary focus:bg-background"
                        >
                          {issueTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </Field>

                      <Field label="Target route / URL">
                        <input
                          value={form.pageUrl}
                          onChange={(event) =>
                            updateField("pageUrl", event.target.value)
                          }
                          placeholder="/tasks, /dashboard/admin..."
                          className="h-12 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                        />
                      </Field>
                    </div>

                    <Field label="Priority">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {priorities.map((priority) => {
                          const isSelected = form.priority === priority.value;
                          const dynamicColors =
                            priorityColorMap[priority.value];

                          return (
                            <button
                              key={priority.value}
                              type="button"
                              onClick={() =>
                                updateField("priority", priority.value)
                              }
                              className={cn(
                                "relative flex min-h-26.25 flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
                                isSelected
                                  ? cn(
                                      "bg-background shadow-md",
                                      dynamicColors.border,
                                    )
                                  : "border-border bg-background/40 hover:border-primary/30",
                              )}
                            >
                              {isSelected && (
                                <div
                                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                                  style={{
                                    background: `radial-gradient(150px circle at 50% 50%, ${dynamicColors.glow}, transparent 80%)`,
                                  }}
                                />
                              )}

                              <div className="relative z-10 flex w-full items-center justify-between gap-3">
                                <span
                                  className={cn(
                                    "text-sm font-extrabold",
                                    isSelected
                                      ? dynamicColors.text
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {priority.label}
                                </span>

                                {isSelected && (
                                  <motion.div layoutId="priority-checkmark">
                                    <CheckCircle2
                                      className={cn(
                                        "h-4.5 w-4.5",
                                        dynamicColors.text,
                                      )}
                                    />
                                  </motion.div>
                                )}
                              </div>

                              <p className="relative z-10 mt-2 text-xs leading-normal text-muted-foreground">
                                {priority.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </Field>

                    <Field label="Short title" required>
                      <input
                        value={form.title}
                        onChange={(event) =>
                          updateField("title", event.target.value)
                        }
                        placeholder="Example: Worker profile page crashes on load"
                        className="h-12 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                      />
                    </Field>

                    <Field label="What happened?" required>
                      <textarea
                        value={form.description}
                        onChange={(event) =>
                          updateField("description", event.target.value)
                        }
                        rows={4}
                        placeholder="Describe the broken flow, error, or confusing behavior..."
                        className="w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm font-medium leading-relaxed outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                      />
                    </Field>

                    <Field label="Steps to reproduce">
                      <textarea
                        value={form.steps}
                        onChange={(event) =>
                          updateField("steps", event.target.value)
                        }
                        rows={3}
                        placeholder={`1. Go to...\n2. Click...\n3. See error...`}
                        className="w-full resize-none rounded-2xl border border-border bg-background/50 px-4 py-3 text-sm font-medium leading-relaxed outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email for follow-up">
                        <input
                          type="email"
                          value={form.reporterEmail}
                          onChange={(event) =>
                            updateField("reporterEmail", event.target.value)
                          }
                          placeholder="you@example.com"
                          className="h-12 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                        />
                      </Field>

                      <Field label="Name">
                        <input
                          value={form.contactName}
                          onChange={(event) =>
                            updateField("contactName", event.target.value)
                          }
                          placeholder="Optional"
                          className="h-12 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                        />
                      </Field>
                    </div>

                    <Field label="Phone">
                      <input
                        value={form.contactPhone}
                        onChange={(event) =>
                          updateField("contactPhone", event.target.value)
                        }
                        placeholder="Optional"
                        className="h-12 w-full rounded-2xl border border-border bg-background/50 px-4 text-sm font-semibold outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background"
                      />
                    </Field>

                    <div className="group/upload relative overflow-hidden rounded-2xl border border-dashed border-border bg-background/40 p-5">
                      <div className="flex items-start gap-4">
                        <UploadCloud className="mt-0.5 h-5 w-5 text-primary transition-transform duration-300 group-hover/upload:-translate-y-0.5 group-hover/upload:scale-105" />

                        <div>
                          <p className="text-sm font-bold">
                            Screenshot upload coming soon
                          </p>

                          <p className="mt-1 text-xs leading-normal text-muted-foreground">
                            The backend supports attachments through asset IDs,
                            but this public form can ship without uploads first.
                          </p>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={canSubmit ? { scale: 1.015 } : {}}
                      whileTap={canSubmit ? { scale: 0.985 } : {}}
                      type="submit"
                      disabled={!canSubmit}
                      className={cn(
                        "inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-bold transition-all duration-300",
                        canSubmit
                          ? "bg-primary text-primary-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.25)] hover:brightness-110"
                          : "cursor-not-allowed bg-muted text-muted-foreground",
                      )}
                    >
                      {submitting ? "Submitting..." : "Submit bug report"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </Interactive3DCard>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUpContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="flex flex-col justify-center rounded-[2.2rem] border border-border bg-card/60 p-8 shadow-sm backdrop-blur-md">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <MessageSquareWarning className="h-6 w-6" />
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight">
                How to write a useful report.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Vague reports slow the fix. Clear reports give a trail: where
                you went, what you clicked, what you expected, and what actually
                happened.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {helpfulDetails.map((detail, index) => (
                <motion.div
                  key={detail}
                  variants={fadeUpItem}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="flex items-start gap-3.5 rounded-2xl border border-border bg-card/60 p-5 shadow-sm backdrop-blur"
                >
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 font-mono text-[10px] font-bold text-primary">
                    {index + 1}
                  </div>

                  <p className="text-sm font-semibold leading-relaxed text-foreground/85">
                    {detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            whileHover={{ scale: 1.005 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="relative overflow-hidden rounded-[2.2rem] border border-border bg-foreground p-8 text-background shadow-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-size-[3rem_3rem] opacity-5" />

            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-background/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-background/80">
                  <Mail className="h-3.5 w-3.5" />
                  Feedback Loop
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight text-background sm:text-4xl">
                  Every bug report maps progress.
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-background/80 sm:text-base">
                  HireCore Local improves when users leave signal behind. Report
                  the cracks early, and the system gets stronger before the
                  crowd arrives.
                </p>
              </div>

              <div className="flex min-w-50 shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/policies"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-background px-8 text-sm font-black text-foreground shadow-md transition-transform hover:scale-[1.03] active:scale-95"
                >
                  View policies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-background/20 px-8 text-sm font-black text-background transition-colors hover:bg-background/10 active:scale-95"
                >
                  How it works
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function optionalTrim(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-foreground">
        {label}
        {required && <span className="ml-1 animate-pulse text-primary">*</span>}
      </span>

      {children}
    </label>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Interactive3DCard className="p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary transition-all duration-500 group-hover:scale-110">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-lg font-extrabold tracking-tight text-foreground transition-colors group-hover:text-primary">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </Interactive3DCard>
  );
}

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex min-h-150 flex-col items-center justify-center p-6 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 animate-pulse rounded-[2rem] bg-primary/20 blur-xl" />

        <div className="relative flex h-20 w-20 items-center justify-center rounded-[2rem] border border-primary/20 bg-primary/10 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </div>
      </div>

      <h2 className="mt-8 text-3xl font-extrabold tracking-tight">
        Report received.
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Thanks. Your report has entered the system. This is how rough edges get
        sharpened.
      </p>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground shadow-[0_10px_30px_hsl(var(--primary)/0.25)] hover:brightness-110"
      >
        Submit another report
      </motion.button>
    </motion.div>
  );
}
