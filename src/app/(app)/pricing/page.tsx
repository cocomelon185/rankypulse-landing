import type { Metadata } from "next";
import PricingClientPage from "./PricingClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "RankyPulse Pricing | Plans for Founders & Agencies";
  const description =
    "Choose a plan that fits your workflow — free audits, saved reports, and ongoing score tracking.";

  return {
    title,
    description,
    alternates: { canonical: "/pricing" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/pricing",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/pricing", width: 1200, height: 630, alt: "RankyPulse — Pricing" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/pricing"],
    },
  };
}

export default function PricingPage() {
  return <PricingClientPage />;
}
