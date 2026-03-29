import type { Metadata } from "next";
import TechnicalSEOChecklistClient from "./TechnicalSEOChecklistClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Technical SEO Checklist | 2024 Guide | RankyPulse";
  const description = "Technical SEO checklist: site speed, mobile, XML sitemaps, robots.txt, structured data, and more. Ensure your site's technical foundation is SEO-ready.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/guides/technical-seo-checklist" },
    robots: { index: true, follow: true },
    keywords: ["technical SEO checklist", "SEO checklist", "technical SEO guide", "site optimization", "SEO best practices"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/technical-seo-checklist",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og/technical-seo-checklist.png",
          width: 1200,
          height: 630,
          alt: "Technical SEO Checklist",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://rankypulse.com/og/technical-seo-checklist.png"],
    },
  };
}

export default function TechnicalSEOChecklistPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Technical SEO Checklist',
    description: 'A complete technical SEO checklist covering crawlability, indexation, page speed, Core Web Vitals, structured data, and mobile SEO.',
    url: 'https://rankypulse.com/guides/technical-seo-checklist',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Crawlability & Indexation', description: 'Audit robots.txt, XML sitemap, canonical tags, and noindex directives.' },
      { '@type': 'ListItem', position: 2, name: 'Site Architecture', description: 'Check URL structure, internal linking depth, and orphan pages.' },
      { '@type': 'ListItem', position: 3, name: 'Page Speed & Core Web Vitals', description: 'Optimise LCP, INP, and CLS for mobile and desktop.' },
      { '@type': 'ListItem', position: 4, name: 'HTTPS & Security', description: 'Confirm valid SSL, HSTS headers, and no mixed content.' },
      { '@type': 'ListItem', position: 5, name: 'Structured Data', description: 'Implement JSON-LD schema relevant to your content type.' },
      { '@type': 'ListItem', position: 6, name: 'Mobile Usability', description: 'Pass Google mobile usability test and use responsive design.' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TechnicalSEOChecklistClient />
    </>
  );
}
