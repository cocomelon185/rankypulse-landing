import { ImageResponse } from "next/og";

export const runtime = "edge";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function GET(req: Request, { params }: Props) {
  const { slug } = await params;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          justifyContent: "center",
          background: "#0b0f19",
          color: "#ffffff"
        }}
      >
        <div style={{ fontSize: 40, opacity: 0.85, marginBottom: 20 }}>RankyPulse</div>
        <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1 }}>{slug}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
