import type { Job } from "@/lib/api/jobs";

export function formatPay(value: unknown): string {
  if (value === null || value === undefined) return "GHS —";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return `GHS ${String(value)}`;

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export function formatAssignmentType(value?: string | null): string {
  if (!value) return "Task";

  if (value === "OPEN") return "Open marketplace";
  if (value === "HIRECORE_ASSIGNED") return "HireCore assigned";

  return value.replaceAll("_", " ");
}

export function formatPostedDate(value?: string | Date | null): string {
  if (!value) return "Recently posted";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently posted";

  return new Intl.DateTimeFormat("en-GH", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getEmployerTrust(job: Job): number | null {
  return job.employer?.employerProfile?.trustScore ?? null;
}

export function getEmployerName(job: Job): string {
  return (
    job.employer?.employerProfile?.companyName ||
    job.employer?.fullName ||
    "Employer"
  );
}

export function getInitials(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "HC";
}

export function isHireCoreManaged(job: Job): boolean {
  return (
    job.assignmentType === "HIRECORE_ASSIGNED" ||
    getEmployerName(job).toLowerCase().includes("hirecore")
  );
}

export function getTrustLabel(job: Job, score: number | null): string {
  if (isHireCoreManaged(job)) return "Reviewed by HireCore";

  if (score === null) return "New employer";
  if (score >= 600) return "Strong trust";
  if (score >= 350) return "Trusted";
  if (score >= 180) return "Rising trust";

  return "Foundation trust";
}

export function getTrustBadgeText(job: Job, score: number | null): string {
  if (isHireCoreManaged(job)) return "Managed";

  return score === null ? "New" : `${score} trust`;
}

export function getTaskCardSummary(job: Job): string {
  const description = String(job.description || "");

  if (isHireCoreManaged(job)) {
    return "HireCore is reviewing applicants and will assign the best fit for this local task.";
  }

  const firstCleanLine = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .find((line) => !line.startsWith("*") && !line.endsWith(":"));

  if (firstCleanLine) {
    return firstCleanLine.length > 130
      ? `${firstCleanLine.slice(0, 127).trim()}...`
      : firstCleanLine;
  }

  return "A local work opportunity is available. View details before applying.";
}

export function extractNearbyAreas(description?: string | null): string[] {
  const text = String(description || "").toLowerCase();

  return ["Circle", "Caprice", "Newtown", "Nima", "Kokomlemle", "ATTC"].filter(
    (area) => text.includes(area.toLowerCase()),
  );
}

export function extractSkillBullets(description?: string | null): string[] {
  return String(description || "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("*"))
    .map((line) => line.replace(/^\*\s*/, "").trim())
    .filter(Boolean);
}