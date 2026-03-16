import type { Metadata } from "next";
import SaaSSEOClient from "./SaaSSEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit for SaaS | Product Growth Strategy | RankyPulse";
  const description = "SaaS SEO strategy focused on free trial signups and product-led growth. Rank for high-value keywords and attract qualified users.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-saas" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit SaaS", "SaaS SEO", "SaaS marketing", "free trial signups", "product-led growth"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-saas",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-for-saas.png", width: 1200, height: 630, alt: "SEO Audit for SaaS | Product-Led Growth Strategy | RankyPulse"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-for-saas.png"]},
  };
}

export default function Page() {
  return <SaaSSEOClient />;
}
