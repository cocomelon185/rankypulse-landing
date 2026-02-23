import { ImageResponse } from "next/og";

/**
 * Default OG image (fallback when no slug is provided).
 * Used when social bots request /og or as generic fallback.
 */
export const runtime = "edge";
export const alt = "RankyPulse — Instant SEO Audit";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #f6f8fb 0%, #e9ecf5 50%, #f0f4ff 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1B2559",
            marginBottom: 12,
          }}
        >
          RankyPulse
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#4318ff",
            marginBottom: 16,
          }}
        >
          Instant SEO Audit & Fix List
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#64748b",
          }}
        >
          Score + fixes in minutes. Free to start.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
