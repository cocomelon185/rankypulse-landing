import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://rankypulse.com"),
  // No global robots block — each page controls its own robots setting.
  // Tool pages (rank-tracking, backlinks, keywords, competitors) are index:true.
  // Private pages (dashboard, settings, action-center) keep robots:false in their own page.tsx.
  openGraph: {
    siteName: "RankyPulse",
    type: "website",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
