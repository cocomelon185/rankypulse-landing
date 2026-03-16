import type { Metadata } from "next";
import NonprofitSEOClient from "./NonprofitSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit for Nonprofits | Mission Impact | RankyPulse";
  const description = "Free and affordable SEO for nonprofits. Increase donor awareness, volunteer recruitment, and mission impact through search visibility.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-nonprofits" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit nonprofit", "nonprofit marketing", "nonprofit SEO", "donor acquisition", "volunteer recruitment"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-nonprofits",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-for-nonprofits.png", width: 1200, height: 630, alt: "SEO Audit for Nonprofits | Mission-Driven Marketing | RankyPulse"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-for-nonprofits.png"]},
  };
}

export default function Page() {
  return <NonprofitSEOClient />;
}
