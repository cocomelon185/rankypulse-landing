import type { Metadata } from "next";
import InternalLinkingStrategyClient from "./InternalLinkingStrategyClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Internal Linking Strategy | 2026 Guide | RankyPulse";
  const description = "Master internal linking strategy to improve rankings and user experience. Learn anchor text, link placement, authority distribution, and proven tactics.";

  return {
    title: { absolute: title },
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
          url: "https://rankypulse.com/og.jpg",
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
      images: ["https://rankypulse.com/og.jpg"],
    },
  };
}

export default function InternalLinkingStrategyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Internal Linking Strategy for SEO',
    description: 'How to build an internal linking strategy that distributes PageRank, reduces orphan pages, and improves crawlability.',
    url: 'https://rankypulse.com/guides/internal-linking-strategy',
    tool: { '@type': 'HowToTool', name: 'RankyPulse Internal Link Checker', url: 'https://rankypulse.com/internal-link-checker' },
    step: [
      { '@type': 'HowToStep', name: 'Audit current internal links', text: 'Crawl your site to map all internal links and find orphan pages with no inbound links.' },
      { '@type': 'HowToStep', name: 'Identify your pillar pages', text: 'Determine which pages you most want to rank and ensure they receive the most internal links.' },
      { '@type': 'HowToStep', name: 'Use descriptive anchor text', text: 'Link using keyword-rich anchor text that describes the destination page topic.' },
      { '@type': 'HowToStep', name: 'Build topic clusters', text: 'Group related content together with bi-directional links to create clear topical authority.' },
      { '@type': 'HowToStep', name: 'Fix broken internal links', text: 'Identify and redirect or repair any broken internal links that waste crawl budget.' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <InternalLinkingStrategyClient />
    </>
  );
}
