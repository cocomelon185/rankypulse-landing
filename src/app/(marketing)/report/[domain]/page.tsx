import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditDomainClient } from "./AuditDomainClient";
import { ReportShell } from "@/components/layout/ReportShell";

const BASE = "https://rankypulse.com";

type Props = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  return {
    title: { absolute: `Free SEO Audit for ${domain} — Scores, Issues & Fixes | RankyPulse` },
    description: `See the full SEO audit for ${domain}: health score, broken links, missing meta tags, page speed, Core Web Vitals and a prioritised fix list. Free and instant.`,
    robots: { index: true, follow: true },
    alternates: { canonical: `${BASE}/report/${domain}` },
    openGraph: {
      title: `SEO Audit Report: ${domain}`,
      description: `Full SEO analysis for ${domain} — health score, issues, and step-by-step fixes.`,
      url: `${BASE}/report/${domain}`,
      siteName: "RankyPulse",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `SEO Audit Report: ${domain}`,
      description: `Full SEO analysis for ${domain} — health score, issues, and step-by-step fixes.`,
    },
  };
}

export default async function AuditDomainPage({ params }: Props) {
  const { domain } = await params;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `SEO Audit Report for ${domain}`,
    description: `Free SEO audit for ${domain}. See health score, broken links, missing meta tags, Core Web Vitals and a prioritised fix list.`,
    url: `${BASE}/report/${domain}`,
    isPartOf: {
      "@type": "WebSite",
      name: "RankyPulse",
      url: BASE,
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BASE },
        { "@type": "ListItem", position: 2, name: "SEO Audit", item: `${BASE}/audit` },
        { "@type": "ListItem", position: 3, name: `${domain} Report`, item: `${BASE}/report/${domain}` },
      ],
    },
  };

  return (
    <ReportShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense fallback={null}>
        <AuditDomainClient domain={domain} />
      </Suspense>
    </ReportShell>
  );
}
