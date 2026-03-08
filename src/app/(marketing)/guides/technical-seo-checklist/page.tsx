import type { Metadata } from "next";
import TechnicalSEOChecklistClient from "./TechnicalSEOChecklistClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Technical SEO Checklist | 2024 Guide | RankyPulse";
  const description = "Complete technical SEO checklist covering site speed, mobile-friendliness, XML sitemaps, robots.txt, structured data, and more. Ensure your website's technical foundation is SEO-ready.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/guides/technical-seo-checklist" },
    robots: { index: true, follow: true },
    keywords: ["technical SEO checklist", "SEO checklist", "technical SEO guide", "site optimization", "SEO best practices"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/technical-seo-checklist",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og/technical-seo-checklist.png",
          width: 1200,
          height: 630,
          alt: "Technical SEO Checklist",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/technical-seo-checklist.png"],
    },
  };
}

export default function TechnicalSEOChecklistPage() {
  return <TechnicalSEOChecklistClient />;
}
