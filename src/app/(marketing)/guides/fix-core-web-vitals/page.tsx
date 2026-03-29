import type { Metadata } from "next";
import FixCoreWebVitalsClient from "./FixCoreWebVitalsClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "How to Fix Core Web Vitals | 2024 Guide | RankyPulse";
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Fix Core Web Vitals',
    description: 'Step-by-step guide to diagnosing and fixing LCP, INP, and CLS issues to pass Google\'s Core Web Vitals assessment.',
    url: 'https://rankypulse.com/guides/fix-core-web-vitals',
    tool: { '@type': 'HowToTool', name: 'RankyPulse SEO Audit Tool', url: 'https://rankypulse.com/audit' },
    step: [
      { '@type': 'HowToStep', name: 'Measure current scores', text: 'Run PageSpeed Insights or use RankyPulse to get your current LCP, INP, and CLS scores.' },
      { '@type': 'HowToStep', name: 'Fix Largest Contentful Paint (LCP)', text: 'Optimise server response time, eliminate render-blocking resources, and preload the hero image.' },
      { '@type': 'HowToStep', name: 'Fix Interaction to Next Paint (INP)', text: 'Reduce JavaScript execution time, split long tasks, and defer non-critical scripts.' },
      { '@type': 'HowToStep', name: 'Fix Cumulative Layout Shift (CLS)', text: 'Add explicit width/height to images and embeds, reserve space for dynamic content.' },
      { '@type': 'HowToStep', name: 'Verify fixes in field data', text: 'Monitor CrUX data in Google Search Console for 28-day rolling improvement.' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FixCoreWebVitalsClient />
    </>
  );
}
