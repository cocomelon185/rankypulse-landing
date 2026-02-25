import type { Metadata } from "next";
import { AppNavbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  robots: { index: true, follow: true },
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
  return (
    <>
      <AppNavbar />
      <div className="pt-16">{children}</div>
    </>
  );
}
