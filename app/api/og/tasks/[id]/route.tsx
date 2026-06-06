import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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

function getTaskType(value?: string | null) {
  if (value === "HIRECORE_ASSIGNED") return "HireCore Managed";
  if (value === "OPEN") return "Open Marketplace";

  return "Local Task";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const task = await getPublicTask(id);

  if (!task) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            padding: 72,
            background:
              "linear-gradient(135deg, #04130a 0%, #062314 55%, #020617 100%)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontFamily: "Arial",
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: "#86efac",
            }}
          >
            HireCore Local
          </div>

          <div
            style={{
              fontSize: 74,
              fontWeight: 950,
              letterSpacing: "-0.06em",
              lineHeight: 1,
              maxWidth: 900,
            }}
          >
            Trusted local work near you
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#bbf7d0",
            }}
          >
            Verified tasks • Local workers • Safer hiring
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }

  const title = task.title || "Local work opportunity";
  const pay = formatPay(task.pay);
  const location = task.locationName || "Ghana";
  const taskType = getTaskType(task.assignmentType);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding: 64,
          background:
            "radial-gradient(circle at 12% 10%, rgba(34,197,94,0.42) 0, transparent 30%), radial-gradient(circle at 88% 18%, rgba(16,185,129,0.24) 0, transparent 32%), linear-gradient(135deg, #03150b 0%, #062314 55%, #020617 100%)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Arial",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -80,
            bottom: -80,
            width: 330,
            height: 330,
            borderRadius: 999,
            border: "2px solid rgba(134,239,172,0.18)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 64,
            bottom: 64,
            width: 140,
            height: 140,
            borderRadius: 36,
            background: "rgba(34,197,94,0.14)",
            border: "1px solid rgba(134,239,172,0.24)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 18,
                background: "#22c55e",
                color: "#022c16",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 950,
              }}
            >
              HC
            </div>

            <div
              style={{
                fontSize: 32,
                fontWeight: 950,
                color: "#dcfce7",
              }}
            >
              HireCore Local
            </div>
          </div>

          <div
            style={{
              padding: "14px 22px",
              borderRadius: 999,
              background: "rgba(34,197,94,0.16)",
              border: "1px solid rgba(134,239,172,0.30)",
              color: "#bbf7d0",
              fontSize: 24,
              fontWeight: 850,
            }}
          >
            {taskType}
          </div>
        </div>

        <div>
          <div
            style={{
              maxWidth: 930,
              fontSize: title.length > 45 ? 58 : 72,
              lineHeight: 1.02,
              fontWeight: 950,
              letterSpacing: "-0.06em",
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 30,
              display: "flex",
              gap: 18,
              alignItems: "center",
              color: "#d1fae5",
              fontSize: 31,
              fontWeight: 850,
            }}
          >
            <span>{pay}</span>
            <span style={{ color: "rgba(209,250,229,0.5)" }}>•</span>
            <span>{location}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#bbf7d0",
            fontSize: 24,
            fontWeight: 750,
          }}
        >
          <span>Trusted local work opportunities</span>
          <span>gh.hirecore.org</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}