import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  robots: { index: false, follow: false },
  openGraph: {
    siteName: "RankyPulse",
    type: "website",
    images: [
      {
        url: "/og",
        width: 1200,
        height: 630,
        alt: "RankyPulse — Instant SEO Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og"],
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
