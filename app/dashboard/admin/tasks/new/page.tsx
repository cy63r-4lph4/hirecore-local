"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  Gift,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Plus,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  createAdminTask,
  type LocationVisibility,
} from "@/lib/api/admin/tasks";
import { attachCurrentLocation } from "@/lib/shared/gps-attach";

type AssignmentType = "OPEN" | "HIRECORE_ASSIGNED";

type FormState = {
  title: string;
  description: string;
  pay: string;
  locationName: string;
  locationLat: string;
  locationLng: string;
  locationVisibility: LocationVisibility;
  assignmentType: AssignmentType;
  employerId: string;
  benefitInput: string;
  benefits: string[];
};

type FormErrors = Partial<
  Record<
    | "title"
    | "description"
    | "pay"
    | "locationName"
    | "coordinates"
    | "benefitInput"
    | "employerId",
    string
  >
>;

const initialForm: FormState = {
  title: "",
  description: "",
  pay: "",
  locationName: "",
  locationLat: "",
  locationLng: "",
  locationVisibility: "APPROXIMATE",
  assignmentType: "HIRECORE_ASSIGNED",
  employerId: "",
  benefitInput: "",
  benefits: [],
};

const quickBenefits = [
  "Transport allowance",
  "Meal support",
  "Performance bonus",
  "Flexible hours",
  "Safety gear provided",
  "Training provided",
];

function normalizeMoney(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100) / 100;
}

function normalizeCoordinate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const coordinate = Number(trimmed);

  if (!Number.isFinite(coordinate)) {
    return null;
  }

  return coordinate;
}

function extractErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: unknown }).response !== null
  ) {
    const response = (error as { response?: { data?: unknown } }).response;

    if (
      typeof response?.data === "object" &&
      response.data !== null &&
      "message" in response.data
    ) {
      const message = (response.data as { message?: unknown }).message;

      if (Array.isArray(message)) {
        return message.join(", ");
      }

      if (typeof message === "string") {
        return message;
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Could not create the task. Check the backend response.";
}

export default function NewTaskPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const hasCoordinates =
    form.locationLat.trim().length > 0 && form.locationLng.trim().length > 0;

  const canSubmit = useMemo(() => {
    return (
      form.title.trim().length > 0 &&
      form.description.trim().length > 0 &&
      form.locationName.trim().length > 0 &&
      Number.isFinite(Number(form.pay)) &&
      Number(form.pay) >= 0 &&
      !loading
    );
  }, [form.title, form.description, form.locationName, form.pay, loading]);

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  function validate() {
    const nextErrors: FormErrors = {};

    const title = form.title.trim();
    const description = form.description.trim();
    const locationName = form.locationName.trim();
    const pay = normalizeMoney(form.pay);

    if (!title) {
      nextErrors.title = "Task title is required.";
    } else if (title.length > 140) {
      nextErrors.title = "Task title must be 140 characters or less.";
    }

    if (!description) {
      nextErrors.description = "Task description is required.";
    } else if (description.length > 5000) {
      nextErrors.description = "Description must be 5000 characters or less.";
    }

    if (pay === null || pay < 0) {
      nextErrors.pay = "Enter a valid pay amount. Zero is allowed.";
    }

    if (!locationName) {
      nextErrors.locationName = "Location name is required.";
    } else if (locationName.length > 180) {
      nextErrors.locationName = "Location name must be 180 characters or less.";
    }

    const lat = normalizeCoordinate(form.locationLat);
    const lng = normalizeCoordinate(form.locationLng);

    const hasLat = form.locationLat.trim().length > 0;
    const hasLng = form.locationLng.trim().length > 0;

    if (hasLat !== hasLng) {
      nextErrors.coordinates =
        "Provide both latitude and longitude, or leave both empty.";
    } else if (lat === null || lng === null) {
      nextErrors.coordinates = "Coordinates must be valid numbers.";
    } else if (
      typeof lat === "number" &&
      typeof lng === "number" &&
      (lat < -90 || lat > 90 || lng < -180 || lng > 180)
    ) {
      nextErrors.coordinates =
        "Latitude must be between -90 and 90. Longitude must be between -180 and 180.";
    }

    if (
      form.employerId.trim().length > 0 &&
      form.employerId.trim().length < 8
    ) {
      nextErrors.employerId =
        "Employer ID looks too short. Leave it empty to use the system employer.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function addBenefit(value?: string) {
    const benefit = (value ?? form.benefitInput).trim();

    if (!benefit) return;

    if (benefit.length > 80) {
      setErrors((current) => ({
        ...current,
        benefitInput: "Keep each benefit under 80 characters.",
      }));
      return;
    }

    setForm((current) => {
      const exists = current.benefits.some(
        (item) => item.toLowerCase() === benefit.toLowerCase(),
      );

      if (exists) {
        return {
          ...current,
          benefitInput: "",
        };
      }

      return {
        ...current,
        benefitInput: "",
        benefits: [...current.benefits, benefit],
      };
    });

    setErrors((current) => ({
      ...current,
      benefitInput: undefined,
    }));
  }

  function removeBenefit(benefit: string) {
    setForm((current) => ({
      ...current,
      benefits: current.benefits.filter((item) => item !== benefit),
    }));
  }

  function clearCoordinates() {
    setForm((current) => ({
      ...current,
      locationLat: "",
      locationLng: "",
    }));

    setErrors((current) => ({
      ...current,
      coordinates: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) return;

    const pay = normalizeMoney(form.pay);
    const locationLat = normalizeCoordinate(form.locationLat);
    const locationLng = normalizeCoordinate(form.locationLng);

    if (pay === null) return;

    try {
      setLoading(true);

      const createdTask = await createAdminTask({
        title: form.title.trim(),
        description: form.description.trim(),
        pay,
        benefits: form.benefits,
        locationName: form.locationName.trim(),
        locationLat: typeof locationLat === "number" ? locationLat : undefined,
        locationLng: typeof locationLng === "number" ? locationLng : undefined,
        locationVisibility: form.locationVisibility,
        assignmentType: form.assignmentType,
        employerId: form.employerId.trim() || undefined,
      });

      toast({
        title: "Task created",
        description: "The task is now live in the HireCore registry.",
      });

      router.push(`/dashboard/admin/tasks/${createdTask.id}`);
    } catch (error) {
      console.error(error);

      toast({
        variant: "destructive",
        title: "Task creation failed",
        description: extractErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="w-full min-w-0 space-y-6 pb-16">
      <section className="min-w-0">
        <Button
          asChild
          variant="ghost"
          className="mb-4 h-9 rounded-xl px-0 text-xs font-bold text-muted-foreground hover:bg-transparent hover:text-foreground"
        >
          <Link href="/dashboard/admin/tasks">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to tasks
          </Link>
        </Button>

        <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-md sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                Admin Task Creation
              </p>

              <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">
                Create a new <span className="text-primary">HireCore task</span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Publish a task with clear pay, location, benefits, assignment
                rules, and optional GPS. GPS is optional so iOS issues will not
                block task creation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0">
              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Default status
                </p>
                <p className="mt-1 text-sm font-black text-primary">OPEN</p>
              </div>

              <div className="rounded-2xl border border-border bg-background/60 p-3">
                <p className="text-[10px] font-bold uppercase text-muted-foreground">
                  Assignment
                </p>
                <p className="mt-1 text-sm font-black text-primary">
                  Admin controlled
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <section className="min-w-0 space-y-6">
          <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-md sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Zap className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-[0.18em]">
                  Task Details
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  The core information workers and admins will see.
                </p>
              </div>
            </div>

            <div className="grid min-w-0 gap-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor="title"
                    className="text-xs font-black uppercase tracking-wide text-muted-foreground"
                  >
                    Task title
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {form.title.length}/140
                  </span>
                </div>

                <Input
                  id="title"
                  value={form.title}
                  maxLength={140}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="Example: Event setup crew needed"
                  className={cn(
                    "h-12 rounded-2xl border-border bg-background/70",
                    errors.title && "border-destructive",
                  )}
                />

                {errors.title ? (
                  <p className="text-xs text-destructive">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label
                    htmlFor="description"
                    className="text-xs font-black uppercase tracking-wide text-muted-foreground"
                  >
                    Description
                  </Label>
                  <span className="text-[10px] text-muted-foreground">
                    {form.description.length}/5000
                  </span>
                </div>

                <Textarea
                  id="description"
                  value={form.description}
                  maxLength={5000}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe what the worker will do, required skills, reporting time, safety notes, and what success looks like..."
                  rows={8}
                  className={cn(
                    "min-h-44 resize-y rounded-2xl border-border bg-background/70 leading-6",
                    errors.description && "border-destructive",
                  )}
                />

                {errors.description ? (
                  <p className="text-xs text-destructive">
                    {errors.description}
                  </p>
                ) : null}
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="pay"
                    className="text-xs font-black uppercase tracking-wide text-muted-foreground"
                  >
                    Pay / Compensation
                  </Label>

                  <div className="relative">
                    <Banknote className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="pay"
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={form.pay}
                      onChange={(event) =>
                        updateForm("pay", event.target.value)
                      }
                      placeholder="250.00"
                      className={cn(
                        "h-12 rounded-2xl border-border bg-background/70 pl-11",
                        errors.pay && "border-destructive",
                      )}
                    />
                  </div>

                  {errors.pay ? (
                    <p className="text-xs text-destructive">{errors.pay}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Amount is sent as a number to match the backend DTO.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Assignment type
                  </Label>

                  <Select
                    value={form.assignmentType}
                    onValueChange={(value) =>
                      updateForm("assignmentType", value as AssignmentType)
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background/70 font-bold">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="rounded-2xl border-border bg-card">
                      <SelectItem value="HIRECORE_ASSIGNED">
                        HireCore assigned
                      </SelectItem>
                      <SelectItem value="OPEN">Open application</SelectItem>
                    </SelectContent>
                  </Select>

                  <p className="text-xs text-muted-foreground">
                    Use HireCore assigned when admins will control assignment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-md sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Navigation className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-[0.18em]">
                  Location
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Location name is required. GPS is optional and can be entered
                  manually.
                </p>
              </div>
            </div>

            <div className="grid min-w-0 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="locationName"
                  className="text-xs font-black uppercase tracking-wide text-muted-foreground"
                >
                  Location name
                </Label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="locationName"
                    value={form.locationName}
                    maxLength={180}
                    onChange={(event) =>
                      updateForm("locationName", event.target.value)
                    }
                    placeholder="Example: East Legon, Accra"
                    className={cn(
                      "h-12 rounded-2xl border-border bg-background/70 pl-11",
                      errors.locationName && "border-destructive",
                    )}
                  />
                </div>

                {errors.locationName ? (
                  <p className="text-xs text-destructive">
                    {errors.locationName}
                  </p>
                ) : null}
              </div>

              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    Visibility
                  </Label>

                  <Select
                    value={form.locationVisibility}
                    onValueChange={(value) =>
                      updateForm(
                        "locationVisibility",
                        value as LocationVisibility,
                      )
                    }
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-background/70 font-bold">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="rounded-2xl border-border bg-card">
                      <SelectItem value="APPROXIMATE">Approximate</SelectItem>
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="HIDDEN">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-wide text-muted-foreground">
                    GPS capture
                  </Label>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      attachCurrentLocation({
                        setForm: (update) => {
                          if (typeof update === "function") {
                            setForm((current) => ({
                              ...current,
                              ...update(current),
                            }));
                          } else {
                            setForm((current) => ({ ...current, ...update }));
                          }
                        },
                        setErrors,
                        setLocating,
                      })
                    }
                    disabled={locating}
                    className="h-12 w-full rounded-2xl border-primary/30 bg-primary/5 font-black text-primary hover:bg-primary/10"
                  >
                    {locating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LocateFixed className="mr-2 h-4 w-4" />
                    )}
                    {locating ? "Finding GPS..." : "Use current GPS"}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="mb-4 flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <p className="text-xs leading-5 text-muted-foreground">
                    On iPhone, GPS can fail if the site is not HTTPS, if Safari
                    location permission is blocked, or if precise location is
                    disabled. Manual coordinates below solve that.
                  </p>
                </div>

                <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="locationLat"
                      className="text-xs font-black uppercase tracking-wide text-muted-foreground"
                    >
                      Latitude
                    </Label>

                    <Input
                      id="locationLat"
                      type="text"
                      inputMode="decimal"
                      value={form.locationLat}
                      onChange={(event) =>
                        updateForm("locationLat", event.target.value)
                      }
                      placeholder="5.603717"
                      className={cn(
                        "h-12 rounded-2xl border-border bg-background/70",
                        errors.coordinates && "border-destructive",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="locationLng"
                      className="text-xs font-black uppercase tracking-wide text-muted-foreground"
                    >
                      Longitude
                    </Label>

                    <Input
                      id="locationLng"
                      type="text"
                      inputMode="decimal"
                      value={form.locationLng}
                      onChange={(event) =>
                        updateForm("locationLng", event.target.value)
                      }
                      placeholder="-0.186964"
                      className={cn(
                        "h-12 rounded-2xl border-border bg-background/70",
                        errors.coordinates && "border-destructive",
                      )}
                    />
                  </div>
                </div>

                {errors.coordinates ? (
                  <p className="mt-3 text-xs text-destructive">
                    {errors.coordinates}
                  </p>
                ) : null}

                {hasCoordinates ? (
                  <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Attached coordinates
                      </p>
                      <p className="mt-1 break-all text-xs font-bold text-foreground">
                        {form.locationLat.trim()}, {form.locationLng.trim()}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={clearCoordinates}
                      className="h-9 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-6">
          <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-md sm:p-6 xl:sticky xl:top-24">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Gift className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-[0.18em]">
                  Benefits
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  These are saved as a string array.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex min-w-0 gap-2">
                <Input
                  value={form.benefitInput}
                  onChange={(event) =>
                    updateForm("benefitInput", event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addBenefit();
                    }
                  }}
                  placeholder="Add custom benefit"
                  className={cn(
                    "h-11 rounded-2xl border-border bg-background/70",
                    errors.benefitInput && "border-destructive",
                  )}
                />

                <Button
                  type="button"
                  onClick={() => addBenefit()}
                  className="h-11 shrink-0 rounded-2xl px-4"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {errors.benefitInput ? (
                <p className="text-xs text-destructive">
                  {errors.benefitInput}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {quickBenefits.map((benefit) => {
                  const selected = form.benefits.includes(benefit);

                  return (
                    <button
                      key={benefit}
                      type="button"
                      onClick={() =>
                        selected ? removeBenefit(benefit) : addBenefit(benefit)
                      }
                      className={cn(
                        "rounded-full border px-3 py-2 text-xs font-bold transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {benefit}
                    </button>
                  );
                })}
              </div>

              {form.benefits.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-border bg-background/50 p-3">
                  {form.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-card/70 px-3 py-2"
                    >
                      <span className="truncate text-xs font-bold">
                        {benefit}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${benefit}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-border p-4 text-xs leading-5 text-muted-foreground">
                  No benefits added yet. That is allowed, but benefits make the
                  task more attractive.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-md sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-black uppercase tracking-[0.18em]">
                  Employer
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional system employer override.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="employerId"
                className="text-xs font-black uppercase tracking-wide text-muted-foreground"
              >
                Employer ID
              </Label>

              <Input
                id="employerId"
                value={form.employerId}
                onChange={(event) =>
                  updateForm("employerId", event.target.value)
                }
                placeholder="Leave empty for system employer"
                className={cn(
                  "h-11 rounded-2xl border-border bg-background/70",
                  errors.employerId && "border-destructive",
                )}
              />

              {errors.employerId ? (
                <p className="text-xs text-destructive">{errors.employerId}</p>
              ) : (
                <p className="text-xs leading-5 text-muted-foreground">
                  Leave this empty. The backend will use
                  SYSTEM_EMPLOYER_USER_ID.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/50 p-4 shadow-sm backdrop-blur-md sm:p-6">
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-primary">
                  Publish checklist
                </h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Make sure the task is safe, clear, fairly priced, and ready
                  for workers before publishing.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Backend creates it as OPEN.</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>GPS is optional.</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>System employer fallback is supported.</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-13 w-full rounded-2xl bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-transform hover:scale-[1.01]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>

              <Button
                asChild
                type="button"
                variant="ghost"
                className="h-11 w-full rounded-2xl font-bold text-muted-foreground"
              >
                <Link href="/dashboard/admin/tasks">Cancel</Link>
              </Button>
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}
