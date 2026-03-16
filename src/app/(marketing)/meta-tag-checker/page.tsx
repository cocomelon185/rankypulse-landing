import type { Metadata } from "next";
import MetaTagCheckerClient from "./MetaTagCheckerClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Meta Tag Checker | OG Tag Generator & Validator | RankyPulse";
  const description = "Check and validate meta tags, title tags, and Open Graph tags. Get instant feedback on SEO and social sharing optimization.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/meta-tag-checker" },
    robots: { index: true, follow: true },
    keywords: ["meta tag checker", "free meta tag checker", "OG tag generator", "meta tag validator", "title tag checker"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/meta-tag-checker",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/meta-tag-checker.png",
          width: 1200,
          height: 630,
          alt: "Meta Tag Checker Tool by RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/meta-tag-checker.png"],
    },
  };
}

export default function MetaTagCheckerPage() {
  return <MetaTagCheckerClient />;
}
