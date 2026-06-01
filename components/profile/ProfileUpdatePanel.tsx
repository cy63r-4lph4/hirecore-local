"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BriefcaseBusiness,
  Building2,
  Camera,
  Loader2,
  MapPin,
  Phone,
  Save,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/AuthProvider";
import { setStoredUser } from "@/lib/storage";
import {
  updateBaseProfile,
  updateEmployerProfile,
  updateWorkerProfile,
  uploadProfileImage,
} from "@/lib/api/profile";

type ProfileUpdatePanelProps = {
  user: any;
};

function normalizeSkills(value: string) {
  return value
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function skillsToInput(skills?: string[] | null) {
  return Array.isArray(skills) ? skills.join(", ") : "";
}

function absoluteImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const origin = apiBase.replace(/\/api\/?$/, "");

  return `${origin}${url}`;
}

export function ProfileUpdatePanel({ user }: ProfileUpdatePanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { setUser } = useAuth();

  const isWorker = Boolean(user?.capabilities?.isWorker || user?.workerProfile);
  const isEmployer = Boolean(
    user?.capabilities?.isEmployer || user?.employerProfile,
  );

  const [baseForm, setBaseForm] = useState({
    fullName: user?.fullName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
  });

  const [workerForm, setWorkerForm] = useState({
    bio: user?.workerProfile?.bio ?? "",
    skills: skillsToInput(user?.workerProfile?.skills),
    location: user?.workerProfile?.location ?? "",
    isAvailable: Boolean(user?.workerProfile?.isAvailable),
  });

  const [employerForm, setEmployerForm] = useState({
    companyName: user?.employerProfile?.companyName ?? "",
    location: user?.employerProfile?.location ?? "",
  });

  const [savingBase, setSavingBase] = useState(false);
  const [savingWorker, setSavingWorker] = useState(false);
  const [savingEmployer, setSavingEmployer] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const imageUrl = useMemo(
    () => absoluteImageUrl(user?.profileImageUrl),
    [user?.profileImageUrl],
  );

  useEffect(() => {
    setBaseForm({
      fullName: user?.fullName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    });

    setWorkerForm({
      bio: user?.workerProfile?.bio ?? "",
      skills: skillsToInput(user?.workerProfile?.skills),
      location: user?.workerProfile?.location ?? "",
      isAvailable: Boolean(user?.workerProfile?.isAvailable),
    });

    setEmployerForm({
      companyName: user?.employerProfile?.companyName ?? "",
      location: user?.employerProfile?.location ?? "",
    });
  }, [user]);

  const syncUser = (updatedUser: any) => {
    setUser(updatedUser);
    setStoredUser(updatedUser);
  };

  const handleBaseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSavingBase(true);

    try {
      const updatedUser = await updateBaseProfile({
        fullName: baseForm.fullName.trim(),
        phoneNumber: baseForm.phoneNumber.trim() || undefined,
      });

      syncUser(updatedUser);

      toast({
        title: "Profile updated",
        description: "Your base profile information has been saved.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not update profile",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.",
      });
    } finally {
      setSavingBase(false);
    }
  };

  const handleWorkerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSavingWorker(true);

    try {
      const updatedUser = await updateWorkerProfile({
        bio: workerForm.bio.trim() || undefined,
        skills: normalizeSkills(workerForm.skills),
        location: workerForm.location.trim() || undefined,
        isAvailable: workerForm.isAvailable,
      });

      syncUser(updatedUser);

      toast({
        title: "Worker profile updated",
        description: "Your worker details are now fresh.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not update worker profile",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.",
      });
    } finally {
      setSavingWorker(false);
    }
  };

  const handleEmployerSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSavingEmployer(true);

    try {
      const updatedUser = await updateEmployerProfile({
        companyName: employerForm.companyName.trim() || undefined,
        location: employerForm.location.trim() || undefined,
      });

      syncUser(updatedUser);

      toast({
        title: "Employer profile updated",
        description: "Your hiring identity has been saved.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not update employer profile",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.",
      });
    } finally {
      setSavingEmployer(false);
    }
  };

  const handleProfileImageChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.currentTarget.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid image",
        description: "Please choose a JPG, PNG, or WEBP image.",
      });
      return;
    }

    const sizeMb = file.size / (1024 * 1024);

    if (sizeMb > 5) {
      toast({
        variant: "destructive",
        title: "Image too large",
        description: "Profile image must be 5 MB or less.",
      });
      return;
    }

    setUploadingImage(true);

    try {
      const updatedUser = await uploadProfileImage(file);

      syncUser(updatedUser);

      toast({
        title: "Profile image updated",
        description: "Your new profile image is live.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Could not upload image",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Something went wrong.",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <section className="grid gap-8 xl:grid-cols-[360px_1fr]">
      <aside className="rounded-[2.5rem] border border-border bg-card/85 p-6 shadow-sm backdrop-blur-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[2rem] border border-border bg-muted text-4xl font-black text-foreground">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={user?.fullName || "Profile image"}
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                getInitials(user?.fullName || user?.email || "User")
              )}
            </div>

            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploadingImage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleProfileImageChange}
              disabled={uploadingImage}
            />
          </div>

          <h2 className="mt-6 text-2xl font-black tracking-tight">
            {user?.fullName}
          </h2>

          <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">
            {user?.email}
          </p>

          <p className="mt-5 rounded-full border border-border bg-background px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
            {user?.accountTypes?.join(" + ") || "Member"}
          </p>
        </div>

        <div className="mt-7 rounded-2xl border border-border bg-background/70 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">
            Profile image
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            JPG, PNG, or WEBP. Keep it clean and professional. This improves
            recognition, not trust score.
          </p>
        </div>
      </aside>

      <div className="space-y-8">
        <form
          onSubmit={handleBaseSubmit}
          className="rounded-[2.5rem] border border-border bg-card/85 p-6 shadow-sm backdrop-blur-2xl sm:p-8"
        >
          <SectionHeader
            icon={UserRound}
            eyebrow="Identity"
            title="Base profile"
            description="Keep your visible account information fresh."
          />

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Full name">
              <Input
                value={baseForm.fullName}
                onChange={(event) =>
                  setBaseForm((current) => ({
                    ...current,
                    fullName: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl"
                placeholder="Your full name"
              />
            </Field>

            <Field label="Phone number">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={baseForm.phoneNumber}
                  onChange={(event) =>
                    setBaseForm((current) => ({
                      ...current,
                      phoneNumber: event.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl pl-11"
                  placeholder="Optional phone number"
                />
              </div>
            </Field>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={savingBase}
              className="h-12 rounded-full bg-primary px-7 text-primary-foreground"
            >
              {savingBase ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save base profile
            </Button>
          </div>
        </form>

        {isWorker && (
          <form
            onSubmit={handleWorkerSubmit}
            className="rounded-[2.5rem] border border-border bg-card/85 p-6 shadow-sm backdrop-blur-2xl sm:p-8"
          >
            <SectionHeader
              icon={BriefcaseBusiness}
              eyebrow="Worker"
              title="Worker profile"
              description="This is what employers see when discovering workers."
            />

            <div className="mt-6 grid gap-5">
              <Field label="Worker bio">
                <textarea
                  value={workerForm.bio}
                  onChange={(event) =>
                    setWorkerForm((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-7 outline-none transition focus:border-primary"
                  placeholder="Tell employers what you do, how you work, and what makes you reliable."
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Skills">
                  <Input
                    value={workerForm.skills}
                    onChange={(event) =>
                      setWorkerForm((current) => ({
                        ...current,
                        skills: event.target.value,
                      }))
                    }
                    className="h-12 rounded-2xl"
                    placeholder="plumbing, cleaning, delivery"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Separate skills with commas.
                  </p>
                </Field>

                <Field label="Location">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={workerForm.location}
                      onChange={(event) =>
                        setWorkerForm((current) => ({
                          ...current,
                          location: event.target.value,
                        }))
                      }
                      className="h-12 rounded-2xl pl-11"
                      placeholder="Accra, Kumasi..."
                    />
                  </div>
                </Field>
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border bg-background/70 p-4">
                <div>
                  <p className="font-bold">Available for work</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Show employers whether you are currently open to tasks.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={workerForm.isAvailable}
                  onChange={(event) =>
                    setWorkerForm((current) => ({
                      ...current,
                      isAvailable: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-primary"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={savingWorker}
                className="h-12 rounded-full bg-primary px-7 text-primary-foreground"
              >
                {savingWorker ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save worker profile
              </Button>
            </div>
          </form>
        )}

        {isEmployer && (
          <form
            onSubmit={handleEmployerSubmit}
            className="rounded-[2.5rem] border border-border bg-card/85 p-6 shadow-sm backdrop-blur-2xl sm:p-8"
          >
            <SectionHeader
              icon={Building2}
              eyebrow="Employer"
              title="Employer profile"
              description="This identity appears on tasks you post."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Company or organization name">
                <Input
                  value={employerForm.companyName}
                  onChange={(event) =>
                    setEmployerForm((current) => ({
                      ...current,
                      companyName: event.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl"
                  placeholder="Company name"
                />
              </Field>

              <Field label="Employer location">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={employerForm.location}
                    onChange={(event) =>
                      setEmployerForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    className="h-12 rounded-2xl pl-11"
                    placeholder="Accra, Ghana"
                  />
                </div>
              </Field>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={savingEmployer}
                className="h-12 rounded-full bg-primary px-7 text-primary-foreground"
              >
                {savingEmployer ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save employer profile
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-2xl font-black tracking-tight">{title}</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
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
      <span className="text-sm font-bold text-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}