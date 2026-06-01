"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileQuestion,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  XCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import {
  type SuperAdminWorkforceApplication,
  type WorkforceApplicationStatus,
  type WorkforceDocumentRequestStatus,
} from "@/lib/api/super-admin/workforce";
import { useSuperAdminWorkforceApplicationDetails } from "@/hooks/super-admin/use-super-admin-workforce-application-details";

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function humanize(value?: string | null) {
  if (!value) return "Not specified";

  return value.toLowerCase().replaceAll("_", " ");
}

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "W";

  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function applicationStatusClass(status: WorkforceApplicationStatus) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "REJECTED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "UNDER_REVIEW":
      return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300";
    case "NEEDS_DOCUMENTS":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
    case "PENDING":
    default:
      return "border-muted-foreground/30 bg-muted/60 text-muted-foreground";
  }
}

function documentRequestStatusClass(status: WorkforceDocumentRequestStatus) {
  switch (status) {
    case "SUBMITTED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "CANCELLED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "OPEN":
    default:
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }
}

function trustClass(score: number) {
  if (score >= 80) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }

  if (score >= 50) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }

  return "border-destructive/30 bg-destructive/10 text-destructive";
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

function ReviewActions({
  application,
  reviewing,
  requestingDocs,
  onOpenDecision,
  onOpenDocuments,
}: {
  application: SuperAdminWorkforceApplication;
  reviewing: boolean;
  requestingDocs: boolean;
  onOpenDecision: (status: WorkforceApplicationStatus) => void;
  onOpenDocuments: () => void;
}) {
  const locked =
    application.status === "APPROVED" || application.status === "REJECTED";

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Button
        disabled={reviewing || locked}
        onClick={() => onOpenDecision("APPROVED")}
        className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Approve
      </Button>

      <Button
        variant="destructive"
        disabled={reviewing || locked}
        onClick={() => onOpenDecision("REJECTED")}
        className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Reject
      </Button>

      <Button
        variant="outline"
        disabled={reviewing || locked}
        onClick={() => onOpenDecision("UNDER_REVIEW")}
        className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        <ShieldCheck className="mr-2 h-4 w-4" />
        Under Review
      </Button>

      <Button
        variant="outline"
        disabled={requestingDocs || locked}
        onClick={onOpenDocuments}
        className="h-11 rounded-xl text-[10px] font-black uppercase tracking-widest"
      >
        {requestingDocs ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <AlertCircle className="mr-2 h-4 w-4" />
        )}
        Need Docs
      </Button>
    </div>
  );
}

function ReviewDecisionDialog({
  open,
  status,
  loading,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  status: WorkforceApplicationStatus | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reviewNote: string) => Promise<void> | void;
}) {
  const [reviewNote, setReviewNote] = useState("");

  const label =
    status === "APPROVED"
      ? "Approve application"
      : status === "REJECTED"
        ? "Reject application"
        : status === "UNDER_REVIEW"
          ? "Move to under review"
          : "Update application";

  const description =
    status === "APPROVED"
      ? "Add an approval note for the audit trail."
      : status === "REJECTED"
        ? "Explain why this applicant is being rejected."
        : status === "UNDER_REVIEW"
          ? "Explain why this applicant needs manual review."
          : "Add a review note.";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
          setReviewNote("");
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="review-note">Review note</Label>
          <Textarea
            id="review-note"
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            placeholder="Write the reason for this decision..."
            className="min-h-32"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {reviewNote.length}/1000 characters
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={loading || !status}
            onClick={async () => {
              await onSubmit(reviewNote);
              setReviewNote("");
            }}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RequestDocumentsDialog({
  open,
  loading,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    description?: string;
    requestedDocuments: string[];
    reviewNote?: string;
  }) => Promise<void> | void;
}) {
  const [title, setTitle] = useState("Additional documents required");
  const [description, setDescription] = useState("");
  const [documentsText, setDocumentsText] = useState("");
  const [reviewNote, setReviewNote] = useState("");

  const requestedDocuments = documentsText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

  const reset = () => {
    setTitle("Additional documents required");
    setDescription("");
    setDocumentsText("");
    setReviewNote("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        onOpenChange(nextOpen);

        if (!nextOpen) {
          reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request documents</DialogTitle>
          <DialogDescription>
            Specify exactly what the applicant must submit. One document per
            line.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="document-title">Request title</Label>
            <Input
              id="document-title"
              value={title}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => setTitle(event.target.value)}
              maxLength={180}
              placeholder="Example: Identity verification required"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-description">Message to applicant</Label>
            <Textarea
              id="document-description"
              value={description}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
              className="min-h-28"
              maxLength={1500}
              placeholder="Explain why these documents are needed..."
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1500 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requested-documents">Requested documents</Label>
            <Textarea
              id="requested-documents"
              value={documentsText}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDocumentsText(event.target.value)}
              className="min-h-32"
              placeholder={`Ghana Card or passport\nProof of skill\nPortfolio screenshots\nCertificate or work sample`}
            />
            <p className="text-xs text-muted-foreground">
              One document per line. At least one is required.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-review-note">Internal review note</Label>
            <Textarea
              id="document-review-note"
              value={reviewNote}
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(event.target.value)}
              className="min-h-24"
              maxLength={1000}
              placeholder="Optional note for admins..."
            />
            <p className="text-xs text-muted-foreground">
              {reviewNote.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            disabled={
              loading || !title.trim() || requestedDocuments.length === 0
            }
            onClick={async () => {
              await onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
                requestedDocuments,
                reviewNote: reviewNote.trim() || undefined,
              });

              reset();
            }}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SuperAdminWorkforceApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;

  const [decisionStatus, setDecisionStatus] =
    useState<WorkforceApplicationStatus | null>(null);
  const [decisionDialogOpen, setDecisionDialogOpen] = useState(false);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);

  const {
    application,
    loading,
    error,
    reviewing,
    requestingDocs,
    refetch,
    quickReviewApplication,
    requestDocuments,
  } = useSuperAdminWorkforceApplicationDetails(applicationId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-sm">Loading workforce application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card className="w-full max-w-lg border-border/70 bg-card/80 text-center shadow-sm">
          <CardContent className="space-y-5 p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <XCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Could not load application
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {error || "This workforce application may no longer exist."}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/dashboard/super-admin/workforce">
                  Back to workforce
                </Link>
              </Button>

              <Button onClick={refetch}>Try again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = application.workerProfile;
  const user = profile.user;
  const documentRequests = application.documentRequests ?? [];
  const statusHistory = application.statusHistory ?? [];

  const openDocumentRequests = documentRequests.filter(
    (request) => request.status === "OPEN",
  ).length;

  return (
    <main className="space-y-8 pb-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.16),transparent_35%),radial-gradient(circle_at_bottom_left,hsl(var(--muted)/0.65),transparent_30%)]" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild className="gap-2 px-0">
              <Link href="/dashboard/super-admin/workforce">
                <ArrowLeft className="h-4 w-4" />
                Back to workforce
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={loading}
              className="gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              <RefreshCw className="h-4 w-4" />
              Sync
            </Button>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex max-w-3xl gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <span className="text-lg font-black">
                  {getInitials(user.fullName, user.email)}
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize",
                      applicationStatusClass(application.status),
                    )}
                  >
                    {humanize(application.status)}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={cn("capitalize", trustClass(profile.trustScore))}
                  >
                    Trust {profile.trustScore}
                  </Badge>

                  {profile.isVerified ? (
                    <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-300">
                      Verified profile
                    </Badge>
                  ) : null}

                  {profile.isWorkforceMember ? (
                    <Badge className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/10">
                      Workforce member
                    </Badge>
                  ) : null}
                </div>

                <h1 className="mt-4 break-words text-3xl font-black italic tracking-tighter text-foreground md:text-5xl">
                  {user.fullName}
                </h1>

                <p className="mt-3 max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
                  Review this applicant’s profile, message, experience, document
                  requests, and status trail before making a workforce decision.
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-primary" />
                    {user.email}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary" />
                    {user.phoneNumber || "No phone"}
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    {profile.location || "No location"}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full rounded-3xl border border-border/70 bg-background/70 p-5 shadow-sm lg:max-w-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Review Actions
              </p>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Move the applicant through the verification pipeline.
              </p>

              <div className="mt-5">
                <ReviewActions
                  application={application}
                  reviewing={reviewing}
                  requestingDocs={requestingDocs}
                  onOpenDecision={(status) => {
                    setDecisionStatus(status);
                    setDecisionDialogOpen(true);
                  }}
                  onOpenDocuments={() => setDocumentsDialogOpen(true)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Applied
              </p>
            </div>
            <p className="mt-2 text-sm font-black italic">
              {formatDate(application.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileQuestion className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Doc Requests
              </p>
            </div>
            <p className="mt-2 text-sm font-black italic">
              {documentRequests.length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Open Requests
              </p>
            </div>
            <p className="mt-2 text-sm font-black italic">
              {openDocumentRequests}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">
                Reviewed
              </p>
            </div>
            <p className="mt-2 text-sm font-black italic">
              {formatDate(application.reviewedAt)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-foreground">
                  Application Statement
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  What the applicant submitted during workforce registration.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <MessageSquareText className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Message
                    </p>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {application.message || "No message was provided."}
                  </p>
                </div>

                <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest">
                      Experience
                    </p>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    {application.experience || "No experience was provided."}
                  </p>
                </div>

                {application.portfolioUrl ? (
                  <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                    <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        Portfolio
                      </p>
                    </div>

                    <a
                      href={application.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-sm font-bold text-primary hover:underline"
                    >
                      {application.portfolioUrl}
                    </a>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-foreground">
                  Worker Profile Snapshot
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Current profile state connected to this workforce application.
                </p>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-5">
                <p className="text-sm leading-7 text-muted-foreground">
                  {profile.bio || "No worker bio has been added yet."}
                </p>

                {profile.skills?.length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="rounded-lg text-[10px] font-black uppercase tracking-tight"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-foreground">
                  Document Requests
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Extra documents requested by admins during review.
                </p>
              </div>

              {documentRequests.length > 0 ? (
                <div className="space-y-3">
                  {documentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-3xl border border-border/70 bg-background/70 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-foreground">
                            {request.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {request.description ||
                              "No request description was provided."}
                          </p>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            documentRequestStatusClass(request.status),
                          )}
                        >
                          {humanize(request.status)}
                        </Badge>
                      </div>

                      {request.requestedDocuments?.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {request.requestedDocuments.map((document) => (
                            <Badge
                              key={document}
                              variant="secondary"
                              className="rounded-lg text-[10px] font-black uppercase tracking-tight"
                            >
                              {document}
                            </Badge>
                          ))}
                        </div>
                      ) : null}

                      {request.submittedMessage ? (
                        <div className="mt-4 rounded-2xl border border-border/70 bg-card/70 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                            Submitted Message
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {request.submittedMessage}
                          </p>
                        </div>
                      ) : null}

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                        <DetailRow
                          label="Created"
                          value={formatDate(request.createdAt)}
                        />
                        <DetailRow
                          label="Submitted"
                          value={formatDate(request.submittedAt)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                  <FileQuestion className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-bold italic text-muted-foreground">
                    No document requests have been created for this application.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h2 className="text-xl font-black italic tracking-tight text-foreground">
                  Status History
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Timeline of decisions and review changes.
                </p>
              </div>

              {statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((history) => (
                    <div
                      key={history.id}
                      className="rounded-3xl border border-border/70 bg-background/70 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            applicationStatusClass(history.status),
                          )}
                        >
                          {humanize(history.status)}
                        </Badge>

                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {formatDate(history.changedAt)}
                        </span>
                      </div>

                      {history.note ? (
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {history.note}
                        </p>
                      ) : null}

                      {history.changedByAdmin ? (
                        <p className="mt-3 text-xs font-bold text-muted-foreground">
                          Changed by {history.changedByAdmin.fullName}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                  <Clock3 className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-bold italic text-muted-foreground">
                    No status history has been recorded yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-black italic tracking-tight text-foreground">
                  Applicant
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Identity and account information.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">
                      {user.fullName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <DetailRow label="Phone" value={user.phoneNumber} />
                <DetailRow
                  label="Email verified"
                  value={user.verifiedAt ? "Yes" : "No"}
                />
                <DetailRow
                  label="Available"
                  value={profile.isAvailable ? "Yes" : "No"}
                />
                <DetailRow
                  label="Profile verified"
                  value={profile.isVerified ? "Yes" : "No"}
                />
                <DetailRow
                  label="Workforce member"
                  value={profile.isWorkforceMember ? "Yes" : "No"}
                />
              </div>

              <Button variant="outline" className="w-full rounded-xl" asChild>
                <Link href={`/dashboard/super-admin/users/${user.id}`}>
                  View user profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <h3 className="text-base font-black italic tracking-tight text-foreground">
                  Review Metadata
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Admin decision trail.
                </p>
              </div>

              <div className="space-y-3">
                <DetailRow
                  label="Current status"
                  value={humanize(application.status)}
                />
                <DetailRow
                  label="Reviewed at"
                  value={formatDate(application.reviewedAt)}
                />
                <DetailRow
                  label="Reviewed by"
                  value={application.reviewedByAdmin?.fullName}
                />
                <DetailRow
                  label="Created"
                  value={formatDate(application.createdAt)}
                />
                <DetailRow
                  label="Updated"
                  value={formatDate(application.updatedAt)}
                />
              </div>

              {application.reviewNote ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                    Review Note
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {application.reviewNote}
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/80 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <h3 className="text-base font-black italic tracking-tight text-foreground">
                  Review Rule
                </h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Use review actions only after checking the applicant’s
                  profile, experience, documents, and status trail.
                </p>
              </div>

              <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                No blind approvals. The gate should open only when the signal is
                clean.
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>

      <ReviewDecisionDialog
        open={decisionDialogOpen}
        status={decisionStatus}
        loading={reviewing}
        onOpenChange={(open) => {
          setDecisionDialogOpen(open);

          if (!open) {
            setDecisionStatus(null);
          }
        }}
        onSubmit={async (reviewNote) => {
          if (!decisionStatus) return;

          await quickReviewApplication(
            decisionStatus,
            reviewNote.trim() || undefined,
          );

          setDecisionDialogOpen(false);
          setDecisionStatus(null);
        }}
      />

      <RequestDocumentsDialog
        open={documentsDialogOpen}
        loading={requestingDocs}
        onOpenChange={setDocumentsDialogOpen}
        onSubmit={async (payload) => {
          await requestDocuments(payload);
          setDocumentsDialogOpen(false);
        }}
      />
    </main>
  );
}