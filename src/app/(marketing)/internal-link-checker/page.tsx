import type { Metadata } from "next";
import InternalLinkCheckerClient from "./InternalLinkCheckerClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Internal Link Checker | Broken Links & Orphans | RankyPulse";
  const description = "Find broken internal links, orphaned pages, and linking opportunities. Analyze your internal link structure to improve crawlability, user experience, and page authority distribution.";

  return {
    title,
    description,
    alternates: { canonical: "https://rankypulse.com/internal-link-checker" },
    robots: { index: true, follow: true },
    keywords: ["internal link checker", "broken link checker", "orphaned pages", "internal linking", "link structure"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/internal-link-checker",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/internal-link-checker.png",
          width: 1200,
          height: 630,
          alt: "Internal Link Checker Tool by RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/internal-link-checker.png"],
    },
  };
}

export default function InternalLinkCheckerPage() {
  return <InternalLinkCheckerClient />;
}
