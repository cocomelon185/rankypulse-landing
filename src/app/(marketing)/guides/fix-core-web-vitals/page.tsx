import type { Metadata } from "next";
import FixCoreWebVitalsClient from "./FixCoreWebVitalsClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "How to Fix Core Web Vitals | Complete Guide 2024 | RankyPulse";
  const description = "Step-by-step guide to fixing Core Web Vitals (LCP, FID, CLS). Improve page speed, interactivity, and visual stability to boost rankings and user experience.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/guides/fix-core-web-vitals" },
    robots: { index: true, follow: true },
    keywords: ["how to fix core web vitals", "core web vitals optimization", "improve page speed", "LCP FID CLS", "page experience"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/fix-core-web-vitals",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og/fix-core-web-vitals.png",
          width: 1200,
          height: 630,
          alt: "How to Fix Core Web Vitals",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/fix-core-web-vitals.png"],
    },
  };
}

export default function FixCoreWebVitalsPage() {
  return <FixCoreWebVitalsClient />;
}
