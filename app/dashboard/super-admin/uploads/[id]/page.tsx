"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  FileArchive,
  FileCode2,
  FileText,
  ImageIcon,
  Loader2,
  Mail,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSuperAdminUploadDetails } from "@/hooks/super-admin/use-super-admin-upload-details";
import { getUploadPreviewUrl } from "@/lib/api/super-admin/uploads";

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatFileSize(sizeBytes?: number) {
  if (!sizeBytes) return "Unknown size";

  const kb = sizeBytes / 1024;
  const mb = kb / 1024;

  if (mb >= 1) return `${mb.toFixed(1)} MB`;

  return `${kb.toFixed(1)} KB`;
}

function humanize(value?: string | null) {
  if (!value) return "Not specified";

  return value.toLowerCase().replaceAll("_", " ");
}

function getFileKind(mimeType?: string | null) {
  if (!mimeType) return "unknown";

  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("text/")) return "text";

  if (
    mimeType.includes("json") ||
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("xml")
  ) {
    return "code";
  }

  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("tar") ||
    mimeType.includes("7z") ||
    mimeType.includes("wordprocessingml")
  ) {
    return "archive";
  }

  return "unknown";
}

function getFileIcon(kind: string) {
  if (kind === "image") return ImageIcon;
  if (kind === "pdf") return FileText;
  if (kind === "text") return FileText;
  if (kind === "code") return FileCode2;
  if (kind === "archive") return FileArchive;

  return FileText;
}

function getAttachmentCount(upload: {
  _count?: {
    applicationAttachments: number;
    workforceApplicationAttachments: number;
    workforceDocumentSubmissionAttachments: number;
    profileImageForUsers: number;
  };
}) {
  return (
    (upload._count?.applicationAttachments ?? 0) +
    (upload._count?.workforceApplicationAttachments ?? 0) +
    (upload._count?.workforceDocumentSubmissionAttachments ?? 0) +
    (upload._count?.profileImageForUsers ?? 0)
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">
        {value || "Not provided"}
      </span>
    </div>
  );
}

function UploadPreview({
  mimeType,
  url,
  name,
}: {
  mimeType?: string | null;
  url: string;
  name?: string | null;
}) {
  const kind = getFileKind(mimeType);

  if (kind === "image") {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-background/60">
        <div className="flex min-h-[420px] items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={name || "Uploaded image"}
            className="max-h-[720px] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
      </div>
    );
  }

  if (kind === "pdf") {
    return (
      <div className="overflow-hidden rounded-3xl border border-border bg-background/60">
        <iframe
          src={url}
          title={name || "PDF preview"}
          className="h-[720px] w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-dashed border-border bg-background/60 p-8 text-center">
      <div className="max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-lg font-semibold text-foreground">
          Preview not supported
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          This file type cannot be previewed directly in the browser yet. PDFs
          and images can render inline. DOCX files need conversion to PDF before
          they can be previewed cleanly.
        </p>
      </div>
    </div>
  );
}

export default function SuperAdminUploadDetailsPage() {
  const params = useParams<{ id: string }>();
  const uploadId = params.id;

  const { upload, loading, error, refetch } =
    useSuperAdminUploadDetails(uploadId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading upload details...</p>
        </div>
      </div>
    );
  }

  if (error || !upload) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg border-border/70 bg-card/80 text-center shadow-sm">
          <CardContent className="space-y-5 p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <XCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Could not load upload
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {error || "This upload may no longer exist."}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/super-admin/uploads">
                  Back to uploads
                </Link>
              </Button>

              <Button onClick={refetch}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const previewUrl = getUploadPreviewUrl(upload.id);
  const kind = getFileKind(upload.mimeType);
  const FileIcon = getFileIcon(kind);
  const attachmentCount = getAttachmentCount(upload);

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--muted)/0.65),transparent_30%)]" />

        <div className="relative z-10 space-y-6">
          <Button variant="ghost" size="sm" asChild className="gap-2 px-0">
            <Link href="/dashboard/super-admin/uploads">
              <ArrowLeft className="h-4 w-4" />
              Back to uploads
            </Link>
          </Button>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FileIcon className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {kind}
                  </Badge>

                  <Badge variant="outline" className="capitalize">
                    {humanize(upload.purpose)}
                  </Badge>

                  {upload.isAttached || attachmentCount > 0 ? (
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                      Attached
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unattached</Badge>
                  )}
                </div>

                <h1 className="mt-4 break-words text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {upload.originalName || "Untitled upload"}
                </h1>

                <p className="mt-3 text-sm text-muted-foreground">
                  Preview and inspect this upload without downloading it.
                </p>
              </div>
            </div>

            <Button variant="outline" asChild className="gap-2">
              <a href={previewUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Open preview
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  File preview
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Images and PDFs render directly here when the backend returns
                  them with inline content disposition.
                </p>
              </div>

              <UploadPreview
                mimeType={upload.mimeType}
                url={previewUrl}
                name={upload.originalName}
              />
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  File metadata
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Storage and type information.
                </p>
              </div>

              <div className="space-y-3">
                <DetailRow label="File name" value={upload.originalName} />
                <DetailRow label="MIME type" value={upload.mimeType} />
                <DetailRow
                  label="Size"
                  value={formatFileSize(upload.sizeBytes)}
                />
                <DetailRow label="Purpose" value={humanize(upload.purpose)} />
                <DetailRow
                  label="Attached to records"
                  value={attachmentCount}
                />
                <DetailRow label="Created" value={formatDate(upload.createdAt)} />
                <DetailRow label="Updated" value={formatDate(upload.updatedAt)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Uploaded by
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Account that submitted this file.
                </p>
              </div>

              {upload.owner ? (
                <div className="rounded-2xl bg-muted/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                      <UserRound className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {upload.owner.fullName}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {upload.owner.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <DetailRow
                      label="Role"
                      value={humanize(upload.owner.role)}
                    />

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {upload.owner.email}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No owner information is attached to this file.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Attachment usage
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Where this upload is currently linked.
                </p>
              </div>

              <div className="space-y-3">
                <DetailRow
                  label="Job applications"
                  value={upload._count?.applicationAttachments ?? 0}
                />
                <DetailRow
                  label="Workforce applications"
                  value={upload._count?.workforceApplicationAttachments ?? 0}
                />
                <DetailRow
                  label="Document submissions"
                  value={
                    upload._count?.workforceDocumentSubmissionAttachments ?? 0
                  }
                />
                <DetailRow
                  label="Profile image usage"
                  value={upload._count?.profileImageForUsers ?? 0}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Preview rules
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Images and PDFs can render directly. DOCX files are stored and
                  tracked, but browsers do not preview them cleanly without a
                  conversion service.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Viewed safely in admin mode
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}