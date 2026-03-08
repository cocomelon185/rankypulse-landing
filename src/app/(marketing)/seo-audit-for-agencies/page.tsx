import type { Metadata } from "next";
import AgencySEOClient from "./AgencySEOClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit for Agencies | White Label Solution | RankyPulse";
  const description = "White-label SEO audits for agencies. Rebrand reports, improve client results, and scale your service offerings.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/seo-audit-for-agencies" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit for agencies", "white label SEO", "agency tools", "client reporting", "reseller SEO"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/seo-audit-for-agencies",
      siteName: "RankyPulse",
      type: "website",
      images: [{url: "https://rankypulse.com/og/seo-audit-for-agencies.png", width: 1200, height: 630, alt: "SEO Audit for Agencies | White Label Solution | RankyPulse"}],
    },
    twitter: {card: "summary_large_image", title, description, images: ["https://rankypulse.com/og/seo-audit-for-agencies.png"]},
  };
}

export default function Page() {
  return <AgencySEOClient />;
}
