import type { Metadata } from "next";
import SEOAuditTemplateClient from "./SEOAuditTemplateClient";

export async function generateMetadata(): Promise<Metadata> {
  const title = "SEO Audit Template | Free Checklist | RankyPulse";
  const description = "Free downloadable SEO audit template and spreadsheet. Track technical SEO, on-page optimization, content, links, and create actionable improvement roadmaps.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "https://rankypulse.com/guides/seo-audit-template" },
    robots: { index: true, follow: true },
    keywords: ["SEO audit template", "free SEO template", "SEO audit spreadsheet", "audit checklist", "SEO tracking"],
    openGraph: {
      title,
      description,
      url: "https://rankypulse.com/guides/seo-audit-template",
      siteName: "RankyPulse",
      type: "article",
      images: [
        {
          url: "https://rankypulse.com/og.jpg",
          width: 1200,
          height: 630,
          alt: "SEO Audit Template",
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

export default function SEOAuditTemplatePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'SEO Audit Template',
    description: 'A free, ready-to-use SEO audit template covering technical SEO, on-page SEO, content quality, and backlink analysis.',
    url: 'https://rankypulse.com/guides/seo-audit-template',
    tool: { '@type': 'HowToTool', name: 'RankyPulse SEO Audit Tool', url: 'https://rankypulse.com/audit' },
    step: [
      { '@type': 'HowToStep', name: 'Technical SEO section', text: 'Audit crawlability, indexation, page speed, HTTPS, and structured data.' },
      { '@type': 'HowToStep', name: 'On-page SEO section', text: 'Review title tags, meta descriptions, heading hierarchy, and keyword usage.' },
      { '@type': 'HowToStep', name: 'Content quality section', text: 'Check for thin content, duplicate pages, and topical coverage gaps.' },
      { '@type': 'HowToStep', name: 'Internal linking section', text: 'Map internal link structure, identify orphan pages, and improve link equity flow.' },
      { '@type': 'HowToStep', name: 'Backlink profile section', text: 'Assess referring domains, anchor text distribution, and toxic links.' },
      { '@type': 'HowToStep', name: 'Priority action plan', text: 'Rank all found issues by impact and effort to build a prioritised fix schedule.' },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SEOAuditTemplateClient />
    </>
  );
}
