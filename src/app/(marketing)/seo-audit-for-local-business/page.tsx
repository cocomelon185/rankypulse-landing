import type { Metadata } from "next";
import LocalBusinessSEOClient from "./LocalBusinessSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Local SEO Audit | Rank Better in Local Search | RankyPulse";
  const description = "Local SEO strategy for service-based businesses. Optimize Google Business Profile, get reviews, and rank for local keywords to attract nearby customers.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-local-business" },
    robots: { index: true, follow: true },
    keywords: ["local SEO audit", "local business SEO", "Google Business Profile", "local rankings", "near me search"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-local-business",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-for-local-business.png", width: 1200, height: 630, alt: "Local SEO Audit | Rank Better in Local Search | RankyPulse"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-for-local-business.png"]},
  };
}

export default function Page() {
  return <LocalBusinessSEOClient />;
}
