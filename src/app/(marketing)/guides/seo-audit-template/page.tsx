import type { Metadata } from "next";
import SEOAuditTemplateClient from "./SEOAuditTemplateClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit Template | Free Spreadsheet & Checklist | RankyPulse";
  const description = "Free downloadable SEO audit template and spreadsheet. Track technical SEO, on-page optimization, content, links, and create actionable improvement roadmaps.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/guides/seo-audit-template" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit template", "free SEO template", "SEO audit spreadsheet", "audit checklist", "SEO tracking"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/seo-audit-template",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og/seo-audit-template.png",
          width: 1200,
          height: 630,
          alt: "SEO Audit Template",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/seo-audit-template.png"],
    },
  };
}

export default function SEOAuditTemplatePage() {
  return <SEOAuditTemplateClient />;
}
