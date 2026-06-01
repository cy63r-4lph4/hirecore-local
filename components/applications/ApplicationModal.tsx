"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { applyForJob } from "@/lib/api/applications";
import { uploadFiles } from "@/lib/api/uploads";

type ApplicationModalProps = {
  open: boolean;
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

function formatFileSize(size: number) {
  const mb = size / (1024 * 1024);

  if (mb >= 1) {
    return `${mb.toFixed(1)} MB`;
  }

  return `${Math.round(size / 1024)} KB`;
}

function getUploadedAssetIds(response: any): string[] {
  if (Array.isArray(response?.data)) {
    return response.data.map((asset: any) => asset.id).filter(Boolean);
  }

  if (Array.isArray(response?.assets)) {
    return response.assets.map((asset: any) => asset.id).filter(Boolean);
  }

  if (Array.isArray(response)) {
    return response.map((asset: any) => asset.id).filter(Boolean);
  }

  return [];
}

export function ApplicationModal({
  open,
  jobId,
  jobTitle,
  onClose,
  onSuccess,
}: ApplicationModalProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const canSubmit = useMemo(() => {
    return !submitting;
  }, [submitting]);

  if (!open) return null;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) return;

    const combined = [...files, ...selectedFiles];

    if (combined.length > MAX_FILES) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: `You can attach up to ${MAX_FILES} files.`,
      });

      event.target.value = "";
      return;
    }

    const invalidFile = selectedFiles.find((file) => {
      const sizeMb = file.size / (1024 * 1024);
      return sizeMb > MAX_FILE_SIZE_MB || !allowedTypes.includes(file.type);
    });

    if (invalidFile) {
      toast({
        variant: "destructive",
        title: "Unsupported file",
        description:
          "Upload PDF, DOC, DOCX, PNG, or JPG files under 10 MB each.",
      });

      event.target.value = "";
      return;
    }

    setFiles(combined);
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setUploadProgress(0);

    try {
      let assetIds: string[] = [];

      if (files.length > 0) {
        const uploadResponse = await uploadFiles(
          files,
          "JOB_APPLICATION_ATTACHMENT",
          setUploadProgress,
        );

        assetIds = getUploadedAssetIds(uploadResponse);
      }

      await applyForJob({
        jobId,
        message: message.trim() || undefined,
        assetIds,
      });

      toast({
        title: "Application submitted",
        description: "Your application has been sent successfully.",
      });

      setMessage("");
      setFiles([]);
      setUploadProgress(0);

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const rawMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while submitting your application.";

      toast({
        variant: "destructive",
        title: "Could not apply",
        description: Array.isArray(rawMessage)
          ? rawMessage.join(", ")
          : rawMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/75 px-4 py-8 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Close modal"
        onClick={submitting ? undefined : onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-primary">
                <Send className="h-3.5 w-3.5" />
                Apply for task
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight">
                Send your application
              </h2>

              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {jobTitle}
              </p>
            </div>

            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6">
          <div>
            <label
              htmlFor="application-message"
              className="text-sm font-black tracking-tight"
            >
              Message to employer
            </label>

            <textarea
              id="application-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Introduce yourself, mention why you fit this task, and share anything useful..."
              rows={6}
              className="mt-3 w-full resize-none rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-7 outline-none transition placeholder:text-muted-foreground focus:border-primary"
            />

            <p className="mt-2 text-xs text-muted-foreground">
              Optional, but a clear message can make your application stronger.
            </p>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black tracking-tight">
                  Optional attachments
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, DOC, DOCX, PNG, or JPG. Max {MAX_FILES} files, 10 MB
                  each.
                </p>
              </div>

              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground">
                {files.length}/{MAX_FILES}
              </span>
            </div>

            <label
              htmlFor="application-files"
              className={cn(
                "mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background/70 px-5 py-8 text-center transition hover:border-primary/40 hover:bg-primary/5",
                submitting && "pointer-events-none opacity-60",
              )}
            >
              <UploadCloud className="h-8 w-8 text-primary" />
              <p className="mt-3 text-sm font-bold text-foreground">
                Click to upload supporting files
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                CV, certificate, portfolio, or work proof.
              </p>

              <input
                id="application-files"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={submitting}
              />
            </label>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => removeFile(index)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {submitting && files.length > 0 && (
              <div className="mt-4 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Uploading attachments</span>
                  <span>{uploadProgress}%</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p className="text-xs leading-6 text-muted-foreground">
                Only upload files you are comfortable sharing with HireCore and
                the task owner. Do not upload sensitive documents unless they
                are relevant to this application.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
              className="h-12 rounded-full"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="h-12 rounded-full bg-primary px-7 text-primary-foreground shadow-[var(--glow-primary)]"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Paperclip className="mr-2 h-4 w-4" />
                  Submit application
                </>
              )}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
