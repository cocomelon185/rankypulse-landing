import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  title: {
    default: "RankyPulse | Instant SEO Audit & Fix List",
    template: "%s",
  },
  description:
    "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "RankyPulse | Instant SEO Audit & Fix List",
    description:
      "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
    url: "/",
    siteName: "RankyPulse",
    type: "website",
    images: [
      {
        url: "https://rankypulse.com/og.png",
        width: 1200,
        height: 630,
        alt: "RankyPulse — Instant SEO Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankyPulse | Instant SEO Audit & Fix List",
    description:
      "Run a free SEO audit in ~30 seconds. Get prioritized issues, clear fixes, and a score you can track over time.",
    images: ["https://rankypulse.com/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
