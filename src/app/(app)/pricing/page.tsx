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
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function PricingPage() {
  return <PricingClientPage />;
}
