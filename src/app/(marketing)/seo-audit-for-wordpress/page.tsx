import type { Metadata } from "next";
import WordPressSEOClient from "./WordPressSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "WordPress SEO Audit | Plugins & Theme Fixes | RankyPulse";
  const description = "WordPress SEO audit with plugin recommendations, performance optimization, and site structure improvements. Fix technical SEO issues in your WordPress site.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-wordpress" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit for WordPress", "WordPress SEO", "WordPress optimization", "WordPress plugins", "WordPress ranking"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-wordpress",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-for-wordpress.png", width: 1200, height: 630, alt: "SEO Audit for WordPress | Optimize Plugin & Theme | RankyPulse"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-for-wordpress.png"]},
  };
}

export default function Page() {
  return <WordPressSEOClient />;
}
