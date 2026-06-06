import type { Metadata } from "next";
import TaskDetailClient from "./TaskDetailClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://gh.hirecore.org";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPublicTask(id: string) {
  try {
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

function cleanDescription(value?: string | null, max = 170) {
  const text = String(value || "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return "View this trusted local work opportunity on HireCore Local.";

  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

function formatPay(value: unknown) {
  if (value === null || value === undefined) return "GHS —";

  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return `GHS ${String(value)}`;

  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const task = await getPublicTask(id);

  if (!task) {
    return {
      title: "Task not found",
      description: "This HireCore Local task may have been removed or closed.",
      openGraph: {
        title: "Task not found | HireCore Local",
        description: "This HireCore Local task may have been removed or closed.",
        images: ["/og/hirecore-local-og.png"],
      },
      twitter: {
        card: "summary_large_image",
        images: ["/hirecore-local.png"],
      },
    };
  }

  const title = task.title || "Local work opportunity";
  const pay = formatPay(task.pay);
  const location = task.locationName || "Ghana";
  const taskUrl = `${SITE_URL}/tasks/${task.id}`;
  const ogImageUrl = `${SITE_URL}/api/og/tasks/${task.id}`;

  const description = `${pay} • ${location} • ${cleanDescription(
    task.description,
  )}`;

  return {
    title,
    description,
    alternates: {
      canonical: taskUrl,
    },
    openGraph: {
      title: `${title} | HireCore Local`,
      description,
      url: taskUrl,
      siteName: "HireCore Local",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} on HireCore Local`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | HireCore Local`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function TaskPage() {
  return <TaskDetailClient />;
}