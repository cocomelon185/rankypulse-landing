import type { Metadata } from "next";
import RedirectCheckerClient from "./RedirectCheckerClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Redirect Checker | Find & Fix Redirect Chains | RankyPulse";
  const description = "Check 301 redirects, find redirect chains, and validate health. Preserve SEO value and prevent crawl budget waste.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/redirect-checker" },
    robots: { index: true, follow: true },
    keywords: ["redirect checker", "301 redirect checker", "redirect chain", "redirect validator", "301 redirects"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/redirect-checker",
      siteName: "RankyPulse",
      type: "website",
      images: [
        {
          url: "https://rankypulse.com/og/redirect-checker.png",
          width: 1200,
          height: 630,
          alt: "Redirect Checker Tool by RankyPulse",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/redirect-checker.png"],
    },
  };
}

export default function RedirectCheckerPage() {
  return <RedirectCheckerClient />;
}
