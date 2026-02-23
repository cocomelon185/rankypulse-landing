import type { Metadata } from "next";
import AuditClientPage from "./AuditClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Run a Free SEO Audit | RankyPulse";
  const description =
    "Enter your URL to get an actionable SEO score and fixes. No signup required to start.";

  return {
    title,
    description,
    alternates: { canonical: "/audit" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/audit",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/audit", width: 1200, height: 630, alt: "RankyPulse — Audit" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/audit"],
    },
  };
}

export default function AuditPage() {
  return <AuditClientPage />;
}
