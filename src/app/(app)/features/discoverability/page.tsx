import type { Metadata } from "next";
import DiscoverabilityClientPage from "./DiscoverabilityClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Discoverability | RankyPulse";
  const description =
    "Track how findable your site is across search engines.";

  return {
    title,
    description,
    alternates: { canonical: "/features/discoverability" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/features/discoverability",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/discoverability", width: 1200, height: 630, alt: "RankyPulse — Discoverability" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/discoverability"],
    },
  };
}

export default function DiscoverabilityPage() {
  return <DiscoverabilityClientPage />;
}
