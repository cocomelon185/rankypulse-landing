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
      {/* Server-rendered content — visible to Googlebot before JS loads */}
      <div className="px-6 pt-8 pb-4 max-w-3xl">
        <nav className="text-xs text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-300">Home</a>
          {" › "}
          <a href="/audit" className="hover:text-gray-300">SEO Audit</a>
          {" › "}
          <span className="text-gray-300">{domain} Report</span>
        </nav>
        <h1 className="text-2xl font-bold text-white mb-2">
          Free SEO Audit for {domain}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          This page shows the full SEO audit results for <strong className="text-gray-200">{domain}</strong> — including
          health score, broken links, missing meta tags, page speed diagnostics, Core Web Vitals,
          and a prioritised list of issues with step-by-step fixes.
          Run a free audit below or{" "}
          <a href="/audit" className="text-blue-400 hover:underline">
            audit your own site
          </a>.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs text-gray-400 mb-6">
          {[
            "SEO Health Score",
            "Broken Link Checker",
            "Missing Meta Tags",
            "Page Speed Analysis",
            "Core Web Vitals",
            "Prioritised Fix List",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-1.5">
              <span className="text-green-400">✓</span> {feature}
            </div>
          ))}
        </div>
      </div>
      <Suspense fallback={null}>
        <AuditDomainClient domain={domain} />
      </Suspense>
    </ReportShell>
  );
}
