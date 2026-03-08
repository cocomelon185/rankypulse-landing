import type { Metadata } from "next";
import HowToSEOAuditClient from "./HowToSEOAuditClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "How to Do an SEO Audit | Step-by-Step Guide | RankyPulse";
  const description = "Complete step-by-step guide to conducting a professional SEO audit. Learn what to check, how to prioritize issues, and create an action plan to improve rankings.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/guides/how-to-do-seo-audit" },
    robots: { index: true, follow: true },
    keywords: ["how to do SEO audit", "SEO audit steps", "SEO audit process", "conduct SEO audit", "website audit"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/how-to-do-seo-audit",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og/how-to-do-seo-audit.png",
          width: 1200,
          height: 630,
          alt: "How to Do an SEO Audit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/how-to-do-seo-audit.png"],
    },
  };
}

export default function HowToSEOAuditPage() {
  return <HowToSEOAuditClient />;
}
