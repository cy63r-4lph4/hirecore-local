// app/tasks/[id]/page.tsx

import type { Metadata } from "next";
import TaskDetailClient from "./TaskDetailClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://hirecorelocal.com";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getPublicTask(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
    // Use this if tasks update often
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
}

function stripText(value?: string | null, max = 160) {
  const text = String(value || "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= max) return text;

  return `${text.slice(0, max - 1).trim()}…`;
}

function formatPay(value: unknown) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) return `GHS ${String(value || "—")}`;

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
      title: "Task not found | HireCore Local",
      description: "This HireCore Local task may have been removed or closed.",
    };
  }

  const title = `${task.title} | HireCore Local`;
  const description = stripText(
    `${formatPay(task.pay)} • ${task.locationName || "Ghana"} • ${task.description}`,
    180,
  );

  const taskUrl = `${SITE_URL}/tasks/${task.id}`;
  const ogImageUrl = `${SITE_URL}/api/og/tasks/${task.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: taskUrl,
    },
    openGraph: {
      title,
      description,
      url: taskUrl,
      siteName: "HireCore Local",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${task.title} on HireCore Local`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function TaskPage() {
  return <TaskDetailClient />;
}