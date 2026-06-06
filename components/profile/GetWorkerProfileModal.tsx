"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { setStoredUser } from "@/lib/storage";
import { createAccountTypes, updateWorkerProfile } from "@/lib/api/profile";
type GetWorkerProfileModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reason?: string;
};

function normalizeSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function GetWorkerProfileModal({
  open,
  onClose,
  onSuccess,
  reason = "You need a worker profile before you can apply for tasks.",
}: GetWorkerProfileModalProps) {
  const { user, setUser } = useAuth() as any;

  const [location, setLocation] = useState(user?.workerProfile?.location ?? "");
  const [skills, setSkills] = useState(
    Array.isArray(user?.workerProfile?.skills)
      ? user.workerProfile.skills.join(", ")
      : "",
  );
  const [bio, setBio] = useState(user?.workerProfile?.bio ?? "");
  const [isAvailable, setIsAvailable] = useState(
    user?.workerProfile?.isAvailable ?? true,
  );

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const syncUser = (updatedUser: any) => {
    if (typeof setUser === "function") {
      setUser(updatedUser);
    }

    setStoredUser(updatedUser);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanSkills = normalizeSkills(skills);

    if (!location.trim()) {
      toast({
        variant: "destructive",
        title: "Location required",
        description:
          "Add your area so HireCore can match you with nearby tasks.",
      });
      return;
    }

    if (!cleanSkills.length) {
      toast({
        variant: "destructive",
        title: "Add at least one skill",
        description: "Example: Cooking, Hairdressing, Cleaning, Delivery.",
      });
      return;
    }

    setSaving(true);

    try {
      // First make sure the user has WORKER in accountTypes.
      const currentTypes = Array.isArray(user?.accountTypes)
        ? user.accountTypes
        : [];

      const nextAccountTypes = currentTypes.includes("WORKER")
        ? currentTypes
        : [...currentTypes, "WORKER"];

      if (!currentTypes.includes("WORKER")) {
        const updatedUserWithWorkerPath = await createAccountTypes({
          accountTypes: nextAccountTypes,
        });

        syncUser(updatedUserWithWorkerPath);
      }

      // Then create/update worker profile.
      const updatedUser = await updateWorkerProfile({
        bio: bio.trim() || null,
        skills: cleanSkills,
        location: location.trim(),
        isAvailable,
      });

      syncUser(updatedUser);

      toast({
        title: "Worker profile created",
        description: "You can now apply for tasks.",
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not create worker profile",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/75 px-4 py-8 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Close worker profile modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-border bg-card shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5 sm:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Worker profile
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight">
              Create your worker profile
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {reason}
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

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(92vh-120px)] overflow-y-auto p-6 sm:p-8"
        >
          <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-5">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>

              <div>
                <h3 className="font-black">Why this is needed</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  HireCore uses your worker profile to check skills, location,
                  and basic fit before sending your application.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <Field label="Your location">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Example: Kokomlemle, Circle, Nima"
                  className="h-12 rounded-2xl pl-11"
                />
              </div>
            </Field>

            <Field label="Your skills">
              <Input
                value={skills}
                onChange={(event) => setSkills(event.target.value)}
                placeholder="Cooking, Hairdressing, Cleaning"
                className="h-12 rounded-2xl"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Separate skills with commas.
              </p>
            </Field>

            <Field label="Short bio">
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={5}
                placeholder="Tell HireCore what work you can do and why you are reliable."
                className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-7 outline-none transition focus:border-primary"
              />
            </Field>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4">
              <div>
                <p className="font-bold">Available for work</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Turn this on if you want HireCore to consider you for task
                  matching.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAvailable((current: boolean) => !current)}
                className={cn(
                  "relative h-8 w-14 rounded-full transition",
                  isAvailable ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-6 w-6 rounded-full bg-white shadow transition",
                    isAvailable ? "left-7" : "left-1",
                  )}
                />
              </button>
            </label>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="h-12 rounded-full"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="h-12 rounded-full bg-primary px-7 text-primary-foreground shadow-(--glow-primary)"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {saving ? "Creating profile..." : "Create worker profile"}
            </Button>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              Creating a worker profile does not make you verified immediately.
              Verification and workforce approval are handled by HireCore.
            </p>
          </div>
        </form>
      </motion.section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
