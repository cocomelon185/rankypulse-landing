import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 64,
          fontWeight: 700,
          background: "#0b0f19",
          color: "#ffffff"
        }}
      >
        RankyPulse
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
