import type { Metadata } from "next";
import CompetitorsClientPage from "./CompetitorsClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Competitors | RankyPulse";
  const description =
    "See why competitors outrank you and how to improve.";

  return {
    title,
    description,
    alternates: { canonical: "/features/competitors" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/features/competitors",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/competitors", width: 1200, height: 630, alt: "RankyPulse — Competitors" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/competitors"],
    },
  };
}

export default function CompetitorsPage() {
  return <CompetitorsClientPage />;
}
