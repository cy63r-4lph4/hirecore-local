import type { JobStatus } from "@/lib/api/admin/tasks";

export function formatDate(value?: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GH", {
    dateStyle: "medium",
  }).format(date);
}

export function formatPay(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      maximumFractionDigits: 0,
    }).format(value);
  }

  return value;
}

export function humanize(value?: string | null) {
  if (!value) return "Not specified";
  return value.toLowerCase().replaceAll("_", " ");
}

export function statusClass(status: JobStatus) {
  switch (status) {
    case "OPEN":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "PENDING_APPROVAL":
      return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300";
    case "REJECTED":
      return "border-destructive/30 bg-destructive/10 text-destructive";
    case "CLOSED":
    default:
      return "border-muted-foreground/30 bg-muted/60 text-muted-foreground";
  }
}