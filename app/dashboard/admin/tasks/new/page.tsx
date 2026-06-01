"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Gift,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Shield,
  Trash2,
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

type FormState = {
  title: string;
  description: string;
  pay: string;
  locationName: string;
  locationLat: number | null;
  locationLng: number | null;
  locationVisibility: LocationVisibility;
  benefits: {
    meals: boolean;
    transport: boolean;
    bonus: string;
  };
  employerId: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  title: "",
  description: "",
  pay: "",
  locationName: "",
  locationLat: null,
  locationLng: null,
  locationVisibility: "APPROXIMATE",
  benefits: {
    meals: false,
    transport: false,
    bonus: "",
  },
  employerId: "",
};

function buildBenefits(form: FormState) {
  const benefits: string[] = [];

  if (form.benefits.meals) {
    benefits.push("Catering support");
  }

  if (form.benefits.transport) {
    benefits.push("Logistics stipend");
  }

  if (form.benefits.bonus.trim()) {
    benefits.push(form.benefits.bonus.trim());
  }

  return benefits;
}

export default function NewTaskPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormState>(initialForm);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Title is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!form.pay || Number.isNaN(Number(form.pay)) || Number(form.pay) <= 0) {
      nextErrors.pay = "Enter a valid amount.";
    }

    if (!form.locationName.trim()) {
      nextErrors.locationName = "Location name is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const attachCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "GPS unavailable",
        description: "This browser does not support location capture.",
      });
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((current) => ({
          ...current,
          locationLat: position.coords.latitude,
          locationLng: position.coords.longitude,
        }));

        toast({
          title: "GPS coordinates attached",
          description: "Location telemetry has been added to this task.",
        });

        setLocating(false);
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location blocked",
          description: "Could not read GPS coordinates from this device.",
        });

        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const createdTask = await createAdminTask({
        title: form.title.trim(),
        description: form.description.trim(),
        pay: Number(form.pay),
        benefits: buildBenefits(form),
        locationName: form.locationName.trim(),
        locationLat: form.locationLat,
        locationLng: form.locationLng,
        locationVisibility: form.locationVisibility,

        // Launch mode: HireCore creates the task and handles assignment.
        assignmentType: "HIRECORE_ASSIGNED",

        // Optional. Backend should fallback to SYSTEM_EMPLOYER_USER_ID.
        employerId: form.employerId.trim() || undefined,
      });

      toast({
        title: "Task created",
        description: "The HireCore-assigned task is now in the registry.",
      });

      router.push(`/dashboard/admin/tasks/${createdTask.id}`);
    } catch (err) {
      console.error(err);

      toast({
        variant: "destructive",
        title: "Task creation failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not create the task. Check the backend response.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 pb-20">
      <section>
        <Link
          href="/dashboard/admin/tasks"
          className="group mb-6 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Back to Registry
        </Link>

        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
          Admin Task Launch
        </p>

        <h1 className="mt-2 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
          New Task <span className="text-primary">Entry</span>
        </h1>

        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Create a HireCore-assigned task with compensation, benefits,
          visibility controls, and optional GPS coordinates.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-md md:p-8">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Zap size={14} className="fill-primary" />
              Primary Configuration
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="title"
                  className="ml-1 text-[10px] font-black uppercase opacity-70"
                >
                  Task Designation
                </Label>

                <Input
                  id="title"
                  placeholder="Example: Event setup crew needed"
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className={cn(
                    "h-12 rounded-xl border-border bg-background/50",
                    errors.title && "border-destructive",
                  )}
                />

                {errors.title ? (
                  <p className="text-xs text-destructive">{errors.title}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="description"
                  className="ml-1 text-[10px] font-black uppercase opacity-70"
                >
                  Operational Brief
                </Label>

                <Textarea
                  id="description"
                  placeholder="Provide detailed task requirements..."
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={6}
                  className={cn(
                    "resize-none rounded-xl border-border bg-background/50",
                    errors.description && "border-destructive",
                  )}
                />

                {errors.description ? (
                  <p className="text-xs text-destructive">
                    {errors.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black uppercase opacity-70">
                  Compensation (GHS)
                </Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="250.00"
                  value={form.pay}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      pay: event.target.value,
                    }))
                  }
                  className={cn(
                    "h-12 rounded-xl border-border bg-background/50",
                    errors.pay && "border-destructive",
                  )}
                />

                {errors.pay ? (
                  <p className="text-xs text-destructive">{errors.pay}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black uppercase opacity-70">
                  Deployment Mode
                </Label>

                <div className="flex h-12 items-center rounded-xl border border-primary/20 bg-primary/10 px-4 text-xs font-black uppercase tracking-widest text-primary">
                  HireCore Assigned
                </div>

                <p className="text-xs text-muted-foreground">
                  Admin-created tasks are handled by HireCore operations first.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-md md:p-8">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Navigation size={14} className="fill-primary" />
              Geolocation Telemetry
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="ml-1 text-[10px] font-black uppercase opacity-70">
                  Zone Name
                </Label>

                <Input
                  placeholder="Example: Labadi Sector, Accra"
                  value={form.locationName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      locationName: event.target.value,
                    }))
                  }
                  className={cn(
                    "h-12 rounded-xl border-border bg-background/50",
                    errors.locationName && "border-destructive",
                  )}
                />

                {errors.locationName ? (
                  <p className="text-xs text-destructive">
                    {errors.locationName}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="ml-1 text-[10px] font-black uppercase opacity-70">
                    Privacy Protocol
                  </Label>

                  <Select
                    value={form.locationVisibility}
                    onValueChange={(value) =>
                      setForm((current) => ({
                        ...current,
                        locationVisibility: value as LocationVisibility,
                      }))
                    }
                  >
                    <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 font-bold italic">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent className="rounded-xl border-border bg-card">
                      <SelectItem value="PUBLIC">Public</SelectItem>
                      <SelectItem value="APPROXIMATE">
                        Approximate radius
                      </SelectItem>
                      <SelectItem value="HIDDEN">Hidden/Vaulted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={attachCurrentLocation}
                    disabled={locating}
                    className="h-12 w-full rounded-xl border-primary/30 bg-primary/5 font-black text-primary hover:bg-primary/10"
                  >
                    <LocateFixed
                      className={cn(
                        "mr-2 h-4 w-4",
                        locating && "animate-spin",
                      )}
                    />
                    {locating ? "Locking..." : "Sync GPS"}
                  </Button>
                </div>
              </div>

              {form.locationLat !== null && form.locationLng !== null ? (
                <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary">
                    <MapPin className="h-4 w-4" />
                    {form.locationLat.toFixed(6)},{" "}
                    {form.locationLng.toFixed(6)}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        locationLat: null,
                        locationLng: null,
                      }))
                    }
                    className="text-destructive transition-transform hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-6 rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-md md:p-8">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Gift size={14} className="fill-primary" />
              Value Additions
            </h2>

            <div className="space-y-3">
              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all",
                  form.benefits.meals
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background/40 hover:bg-background/60",
                )}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.benefits.meals}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      benefits: {
                        ...current.benefits,
                        meals: event.target.checked,
                      },
                    }))
                  }
                />

                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors",
                    form.benefits.meals
                      ? "border-primary bg-primary"
                      : "border-muted",
                  )}
                >
                  {form.benefits.meals ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </div>

                <span className="text-xs font-black uppercase tracking-tight">
                  Catering Support
                </span>
              </label>

              <label
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all",
                  form.benefits.transport
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background/40 hover:bg-background/60",
                )}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.benefits.transport}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      benefits: {
                        ...current.benefits,
                        transport: event.target.checked,
                      },
                    }))
                  }
                />

                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors",
                    form.benefits.transport
                      ? "border-primary bg-primary"
                      : "border-muted",
                  )}
                >
                  {form.benefits.transport ? (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </div>

                <span className="text-xs font-black uppercase tracking-tight">
                  Logistics Stipend
                </span>
              </label>

              <div className="pt-2">
                <Label className="ml-1 text-[10px] font-black uppercase opacity-70">
                  Bonus Clause
                </Label>

                <Input
                  placeholder="Example: Performance incentive"
                  value={form.benefits.bonus}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      benefits: {
                        ...current.benefits,
                        bonus: event.target.value,
                      },
                    }))
                  }
                  className="mt-1.5 h-11 rounded-xl border-border bg-background/50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-border bg-card/40 p-6 backdrop-blur-md md:p-8">
            <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary">
              <Shield size={14} />
              System Employer
            </h2>

            <div className="space-y-1.5">
              <Label className="ml-1 text-[10px] font-black uppercase opacity-70">
                Employer/System User ID
              </Label>

              <Input
                value={form.employerId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    employerId: event.target.value,
                  }))
                }
                placeholder="Optional if backend uses SYSTEM_EMPLOYER_USER_ID"
                className="h-11 rounded-xl border-border bg-background/50"
              />

              <p className="text-xs leading-5 text-muted-foreground">
                Leave empty if the backend attaches admin-created tasks to the
                configured system employer.
              </p>
            </div>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-border bg-card/40 p-8">
            <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                <Shield size={12} />
                Compliance Notice
              </h4>

              <p className="text-[10px] font-medium leading-relaxed text-muted-foreground italic">
                By publishing, you verify this task is safe, clear, and ready
                for HireCore assignment.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-14 w-full rounded-2xl bg-primary font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transmitting...
                </>
              ) : (
                "Initialize Task"
              )}
            </Button>

            <Button
              asChild
              type="button"
              variant="ghost"
              className="h-11 w-full rounded-2xl font-bold text-muted-foreground"
            >
              <Link href="/dashboard/admin/tasks">Abort Entry</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}