import type { Metadata } from "next";
import GrowthClientPage from "./GrowthClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Growth | RankyPulse";
  const description =
    "Monitor rankings and discoverability trends in one place.";

  return {
    title,
    description,
    alternates: { canonical: "/features/growth" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/features/growth",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/growth", width: 1200, height: 630, alt: "RankyPulse — Growth" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/growth"],
    },
  };
}

export default function GrowthPage() {
  return <GrowthClientPage />;
}
