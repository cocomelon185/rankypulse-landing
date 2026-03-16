import type { Metadata } from "next";
import SEOAuditToolClient from "./SEOAuditToolClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Free SEO Audit Tool | Complete Website Analysis | RankyPulse";
  const description = "Get a complete SEO audit in seconds. Analyze technical SEO, on-page issues, core web vitals, and more. Find actionable fixes to improve your rankings.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-tool" },
    robots: { index: true, follow: true },
    keywords: ["free SEO audit tool", "website SEO checker", "SEO analysis tool", "technical SEO audit", "on-page SEO checker"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-tool",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/seo-audit-tool.png",
          width: 1200,
          height: 630,
          alt: "Free SEO Audit Tool by RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/seo-audit-tool.png"],
    },
  };
}

export default function SEOAuditToolPage() {
  return <SEOAuditToolClient />;
}
