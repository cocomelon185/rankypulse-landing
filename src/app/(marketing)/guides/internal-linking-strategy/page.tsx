import type { Metadata } from "next";
import InternalLinkingStrategyClient from "./InternalLinkingStrategyClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Internal Linking Strategy | Ultimate Guide 2024 | RankyPulse";
  const description = "Master internal linking strategy to improve rankings and user experience. Learn anchor text, link placement, authority distribution, and proven tactics.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/guides/internal-linking-strategy" },
    robots: { index: true, follow: true },
    keywords: ["internal linking strategy", "internal links", "link structure", "anchor text", "SEO linking"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/internal-linking-strategy",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og/internal-linking-strategy.png",
          width: 1200,
          height: 630,
          alt: "Internal Linking Strategy",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/internal-linking-strategy.png"],
    },
  };
}

export default function InternalLinkingStrategyPage() {
  return <InternalLinkingStrategyClient />;
}
