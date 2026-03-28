import type { Metadata } from "next";
import CompetitorAnalysisClient from "./CompetitorAnalysisClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Competitor SEO Analysis | Keywords & Backlinks | RankyPulse";
  const description = "Analyze competitors' SEO strategies, compare keyword rankings, and identify content gaps. Discover untapped ranking opportunities.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/competitor-seo-analysis" },
    robots: { index: true, follow: true },
    keywords: ["competitor SEO analysis", "competitor analysis tool", "keyword gap analysis", "backlink analysis", "SEO competitor research"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/competitor-seo-analysis",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/competitor-seo-analysis.png",
          width: 1200,
          height: 630,
          alt: "Competitor SEO Analysis Tool by RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/competitor-seo-analysis.png"],
    },
  };
}

export default function CompetitorAnalysisPage() {
  return <CompetitorAnalysisClient />;
}
