import type { Metadata } from "next";
import HowToSEOAuditClient from "./HowToSEOAuditClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "How to Do an SEO Audit | Step-by-Step Guide | RankyPulse";
  const description = "Step-by-step guide to conducting a professional SEO audit. Learn what to check, how to prioritize issues, and build an action plan to improve rankings.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/guides/how-to-do-seo-audit" },
    robots: { index: true, follow: true },
    keywords: ["how to do SEO audit", "SEO audit steps", "SEO audit process", "conduct SEO audit", "website audit"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/how-to-do-seo-audit",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og.jpg",
          width: 1200,
          height: 630,
          alt: "How to Do an SEO Audit",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og.jpg"],
    },
  };
}

export default function HowToSEOAuditPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Do an SEO Audit',
    description: 'Step-by-step guide to conducting a professional SEO audit. Learn what to check, how to prioritize issues, and build an action plan to improve rankings.',
    url: 'https://rankypulse.com/guides/how-to-do-seo-audit',
    tool: { '@type': 'HowToTool', name: 'RankyPulse SEO Audit Tool', url: 'https://rankypulse.com/audit' },
    step: [
      { '@type': 'HowToStep', name: 'Crawl your site', text: 'Run a full crawl using an SEO audit tool to discover all pages and surface technical errors.' },
      { '@type': 'HowToStep', name: 'Check technical SEO', text: 'Review canonical tags, redirect chains, meta tags, page speed, and Core Web Vitals.' },
      { '@type': 'HowToStep', name: 'Audit on-page SEO', text: 'Evaluate title tags, meta descriptions, heading structure, and internal linking.' },
      { '@type': 'HowToStep', name: 'Analyse content quality', text: 'Check for thin content, duplicate pages, and missing keyword targeting.' },
      { '@type': 'HowToStep', name: 'Review backlink profile', text: 'Identify toxic links, lost backlinks, and link-building opportunities.' },
      { '@type': 'HowToStep', name: 'Build a prioritised fix list', text: 'Rank issues by impact and effort. Fix critical errors first, then work through medium and low priorities.' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HowToSEOAuditClient />
    </>
  );
}
