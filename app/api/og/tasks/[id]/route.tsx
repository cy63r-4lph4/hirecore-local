import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

async function getPublicTask(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;

  return res.json();
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = await getPublicTask(id);

  if (!task) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#07130d",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 56,
          fontWeight: 900,
        }}
      >
        HireCore Local
      </div>,
      { width: 1200, height: 630 },
    );
  }

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: 64,
        background:
          "radial-gradient(circle at top left, #22c55e 0, transparent 34%), linear-gradient(135deg, #06120b 0%, #081b10 55%, #020617 100%)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            background: "rgba(34,197,94,0.18)",
            border: "1px solid rgba(34,197,94,0.35)",
            fontSize: 26,
            fontWeight: 800,
          }}
        >
          HireCore Local
        </div>

        <div
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.10)",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {task.assignmentType === "HIRECORE_ASSIGNED"
            ? "HireCore Managed"
            : "Open Task"}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.02,
            fontWeight: 950,
            letterSpacing: "-0.06em",
            maxWidth: 920,
          }}
        >
          {task.title}
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            gap: 20,
            fontSize: 30,
            fontWeight: 800,
            color: "#d1fae5",
          }}
        >
          <span>{formatPay(task.pay)}</span>
          <span>•</span>
          <span>{task.locationName || "Ghana"}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#bbf7d0",
          fontSize: 24,
          fontWeight: 700,
        }}
      >
        <span>Find trusted local work opportunities</span>
        <span>hirecorelocal.com</span>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
