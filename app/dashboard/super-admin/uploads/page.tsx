"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Archive,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Download,
  File,
  FileImage,
  FileText,
  HardDrive,
  ImageIcon,
  Paperclip,
  RefreshCw,
  Search,
  ShieldCheck,
  UploadCloud,
  User,
} from "lucide-react";

import { useSuperAdminUploads } from "@/hooks/super-admin/use-super-admin-uploads";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  SuperAdminUpload,
  UploadPurpose,
} from "@/lib/api/super-admin/uploads";
import { useSuperAdminSummary } from "@/hooks/useSuperAdminSummary";

type PurposeFilter = UploadPurpose | "ALL";

function formatBytes(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function purposeLabel(purpose: UploadPurpose) {
  switch (purpose) {
    case "PROFILE_IMAGE":
      return "Profile Image";
    case "JOB_APPLICATION_ATTACHMENT":
      return "Job Attachment";
    case "WORKFORCE_APPLICATION_ATTACHMENT":
      return "Workforce App";
    case "WORKFORCE_DOCUMENT_ATTACHMENT":
      return "Workforce Doc";
    default:
      return purpose;
  }
}

function purposeClass(purpose: UploadPurpose) {
  switch (purpose) {
    case "PROFILE_IMAGE":
      return "border-purple-500/20 bg-purple-500/10 text-purple-500";
    case "JOB_APPLICATION_ATTACHMENT":
      return "border-blue-500/20 bg-blue-500/10 text-blue-500";
    case "WORKFORCE_APPLICATION_ATTACHMENT":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-500";
    case "WORKFORCE_DOCUMENT_ATTACHMENT":
      return "border-amber-500/20 bg-amber-500/10 text-amber-500";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function fileIcon(upload: SuperAdminUpload) {
  if (upload.mimeType?.startsWith("image/")) return FileImage;
  if (upload.mimeType === "application/pdf") return FileText;
  return File;
}

function UploadCard({ upload }: { upload: SuperAdminUpload }) {
  const Icon = fileIcon(upload);
  const ownerName = upload.owner?.fullName || "Unknown owner";
  const ownerEmail = upload.owner?.email || "No email";
  const isAttached = Boolean(upload.isAttached);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-border bg-background/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-background hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(var(--primary),0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <Icon className="h-6 w-6 stroke-[1.5]" />
        </div>

        <div className="flex flex-wrap justify-end gap-2">
          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              purposeClass(upload.purpose),
            )}
          >
            {purposeLabel(upload.purpose)}
          </Badge>

          <Badge
            className={cn(
              "rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tight italic",
              isAttached
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                : "border-border bg-muted/50 text-muted-foreground",
            )}
          >
            {isAttached ? "Attached" : "Loose"}
          </Badge>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Stored Asset
          </p>

          <h2 className="line-clamp-1 text-xl font-black italic tracking-tight transition-colors group-hover:text-primary">
            {upload.originalName}
          </h2>
        </div>

        <div className="grid gap-2">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <HardDrive className="h-3.5 w-3.5 text-primary" />
            {formatBytes(upload.sizeBytes)}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Archive className="h-3.5 w-3.5 text-primary" />
            {upload.mimeType}
          </p>

          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <User className="h-3.5 w-3.5 text-primary" />
            {ownerName}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {ownerEmail}
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
            Uploaded {formatDate(upload.createdAt)}
          </p>
        </div>

        <Link
          href={`/api/uploads/${upload.id}/view`}
          target="_blank"
          className="shrink-0 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
        >
          View Asset
        </Link>
      </div>
    </div>
  );
}

export default function SuperAdminUploadsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [purpose, setPurpose] = useState<PurposeFilter>("ALL");

  const queryParams = useMemo(
    () => ({
      page,
      limit: 12,
      search: search || undefined,
      purpose: purpose === "ALL" ? undefined : purpose,
    }),
    [page, search, purpose],
  );

  const { uploads, meta, loading, error, refetch } =
    useSuperAdminUploads(queryParams);

  const {
    summary,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useSuperAdminSummary();

  const refreshAll = async () => {
    await Promise.all([refetch(), refetchSummary()]);
  };

  const totalUploads = summary?.uploads.total ?? meta?.total ?? 0;
  const profileImages = summary?.uploads.profileImages ?? 0;
  const jobAttachments = summary?.uploads.jobApplicationAttachments ?? 0;
  const workforceAttachments =
    summary?.uploads.workforceApplicationAttachments ?? 0;
  const workforceDocs = summary?.uploads.workforceDocumentUploads ?? 0;

  const visibleStorageBytes = uploads.reduce(
    (total, upload) => total + (upload.sizeBytes ?? 0),
    0,
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <section>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Storage Control
          </p>

          <h1 className="mt-1 text-4xl font-black italic tracking-tighter uppercase sm:text-5xl">
            Upload <span className="text-primary">Registry</span>
          </h1>

          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Track uploaded assets, ownership, attachment usage, MIME profile,
            and storage pressure from one command surface.
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <Download size={14} className="mr-2" />
            Export Assets
          </Button>

          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={loading || summaryLoading}
            className="h-12 rounded-xl border-border bg-card/50 text-[10px] font-bold uppercase tracking-widest"
          >
            <RefreshCw
              size={14}
              className={cn(
                "mr-2",
                (loading || summaryLoading) && "animate-spin",
              )}
            />
            Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Total Assets", val: totalUploads, icon: Activity },
          { label: "Profile Images", val: profileImages, icon: ImageIcon },
          { label: "Job Files", val: jobAttachments, icon: Briefcase },
          { label: "Workforce Apps", val: workforceAttachments, icon: ShieldCheck },
          { label: "Workforce Docs", val: workforceDocs, icon: Paperclip },
        ].map((stat, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card/30 p-4 backdrop-blur-md"
          >
            <div className="mb-1 flex items-center gap-2">
              <stat.icon size={12} className="text-muted-foreground" />

              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {stat.label}
              </p>
            </div>

            <p className="text-lg font-black italic tracking-tighter">
              {stat.val}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-[2.5rem] border border-border bg-card/30 p-6 backdrop-blur-xl md:p-8">
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search by file, owner, MIME, or email..."
              className="h-12 rounded-xl border-border bg-background/50 pl-11 focus:ring-primary/20"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto">
            <Select
              value={purpose}
              onValueChange={(value) => {
                setPurpose(value as PurposeFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-12 rounded-xl border-border bg-background/50 xl:w-[260px]">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All uploads</SelectItem>
                <SelectItem value="PROFILE_IMAGE">Profile images</SelectItem>
                <SelectItem value="JOB_APPLICATION_ATTACHMENT">
                  Job attachments
                </SelectItem>
                <SelectItem value="WORKFORCE_APPLICATION_ATTACHMENT">
                  Workforce applications
                </SelectItem>
                <SelectItem value="WORKFORCE_DOCUMENT_ATTACHMENT">
                  Workforce documents
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="rounded-xl border border-border bg-background/50 px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Visible Size
              </p>
              <p className="mt-1 text-sm font-black italic text-primary">
                {formatBytes(visibleStorageBytes)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Asset Results
          </p>

          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            {meta?.total ?? 0} Files
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="animate-pulse text-xs font-black uppercase tracking-widest">
              Syncing Storage...
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
            <p className="text-sm font-bold italic text-destructive">{error}</p>
          </div>
        ) : null}

        {!loading && !error && uploads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-20 text-center">
            <p className="text-sm font-bold italic text-muted-foreground">
              No upload records found.
            </p>
          </div>
        ) : null}

        {!loading && !error && uploads.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {uploads.map((upload) => (
              <UploadCard key={upload.id} upload={upload} />
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-border/50 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              className="rounded-xl border-border bg-background/50 text-[10px] font-black uppercase tracking-widest"
              disabled={loading || !meta || page >= Math.max(1, meta.totalPages)}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}