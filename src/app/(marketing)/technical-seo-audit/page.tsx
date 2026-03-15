import type { Metadata } from "next";
import TechnicalSEOClient from "./TechnicalSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Technical SEO Audit | Fix Crawlability Issues | RankyPulse";
  const description = "Technical SEO audit to identify crawlability, indexation, and site structure issues. Get actionable recommendations.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/technical-seo-audit" },
    robots: { index: true, follow: true },
    keywords: ["technical SEO audit", "technical SEO checker", "website crawlability", "indexation issues", "site structure"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/technical-seo-audit",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/technical-seo-audit.png",
          width: 1200,
          height: 630,
          alt: "Technical SEO Audit Tool by RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/technical-seo-audit.png"],
    },
  };
}

export default function TechnicalSEOAuditPage() {
  return <TechnicalSEOClient />;
}
