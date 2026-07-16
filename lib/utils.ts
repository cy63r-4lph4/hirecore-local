import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "U";

  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "Unknown";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getApplicationStatusColor(status?: string | null) {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-600 border-amber-500/20";

    case "ACCEPTED":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

    case "REJECTED":
      return "bg-red-500/10 text-red-600 border-red-500/20";

    case "IN_PROGRESS":
      return "bg-blue-500/10 text-blue-600 border-blue-500/20";

    case "COMPLETED":
      return "bg-primary/10 text-primary border-primary/20";

    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

export function absoluteImageUrl(url?: string | null) {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

  const origin = apiBase.replace(/\/api\/?$/, "");

  return `${origin}${url}`;
}