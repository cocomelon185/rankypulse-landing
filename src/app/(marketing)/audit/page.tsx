import type { Metadata } from "next";
import AuditHubClientPage from "./AuditHubClientPage";

export const metadata: Metadata = {
  title: "SEO Audit Guides | Run a Free Audit | RankyPulse",
  description:
    "Browse SEO audit guides by niche and platform. WordPress, Shopify, e‑commerce, local SEO, and more. Run a free audit in 30 seconds.",
  alternates: { canonical: "/audit" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "SEO Audit Guides | Run a Free Audit | RankyPulse",
    description:
      "Browse SEO audit guides by niche and platform. Run a free audit in 30 seconds. No signup required.",
    url: "/audit",
    siteName: "RankyPulse",
    type: "website",
    images: [{ url: "https://rankypulse.com/og.png", width: 1200, height: 630, alt: "RankyPulse — Audit" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SEO Audit Guides | Run a Free Audit | RankyPulse",
    description:
      "Browse SEO audit guides by niche and platform. Run a free audit in 30 seconds.",
  },
};

export default function AuditHubPage() {
  return <AuditHubClientPage />;
}
