import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditDomainClient } from "./AuditDomainClient";
import { ReportShell } from "@/components/layout/ReportShell";
import { getDomainInsight } from "@/lib/report-insights";

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
  const insight = getDomainInsight(domain);

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

      {/* ── Server-rendered case study — visible to Googlebot before JS loads ── */}
      <div className="px-6 pt-8 pb-2 max-w-3xl">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-500 mb-4">
          <a href="/" className="hover:text-gray-300">Home</a>
          {" › "}
          <a href="/audit" className="hover:text-gray-300">SEO Audit</a>
          {" › "}
          <span className="text-gray-300">{domain} Report</span>
        </nav>

        {/* H1 + category tag */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded px-2 py-0.5">
            {insight.category}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          Free SEO Audit for {domain}
        </h1>

        {/* Feature checklist */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs text-gray-400 mb-6">
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

        {/* ── Section 1: SEO Summary ── */}
        <section className="mb-6 border border-white/5 rounded-xl p-5 bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white mb-2">
            SEO Summary for {domain}
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            {insight.verdict}
          </p>
        </section>

        {/* ── Section 2: Top Issues ── */}
        <section className="mb-6 border border-white/5 rounded-xl p-5 bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white mb-3">
            Common SEO Issues on Sites Like {domain}
          </h2>
          <ul className="space-y-2">
            {insight.topIssues.map((issue, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-400">
                <span className="text-red-400 mt-0.5 shrink-0">✗</span>
                {issue}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Section 3: How to Fix ── */}
        <section className="mb-6 border border-white/5 rounded-xl p-5 bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white mb-3">
            How to Fix These Issues
          </h2>
          <ol className="space-y-2">
            {insight.fixes.map((fix, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-400">
                <span className="text-blue-400 font-mono shrink-0">{i + 1}.</span>
                {fix}
              </li>
            ))}
          </ol>
        </section>

        {/* ── Section 4: What You Can Learn ── */}
        <section className="mb-6 border border-white/5 rounded-xl p-5 bg-white/[0.02]">
          <h2 className="text-base font-semibold text-white mb-3">
            What SEO Professionals Learn From Auditing {domain}
          </h2>
          <ul className="space-y-2">
            {insight.lessons.map((lesson, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-gray-400">
                <span className="text-yellow-400 mt-0.5 shrink-0">→</span>
                {lesson}
              </li>
            ))}
          </ul>
        </section>

        {/* ── CTA ── */}
        <section className="mb-6 rounded-xl p-5 bg-blue-600/10 border border-blue-500/20">
          <p className="text-sm text-gray-300 mb-3">
            <strong className="text-white">Run a free audit on your own site</strong> — get the same analysis in under 30 seconds.
            No signup required.
          </p>
          <a
            href="/audit"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Audit My Website Free →
          </a>
        </section>

        {/* ── Internal Links ── */}
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Learn more about SEO
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: "Technical SEO Checklist", href: "/guides/technical-seo-checklist" },
              { label: "How to Do an SEO Audit", href: "/guides/how-to-do-seo-audit" },
              { label: "Fix Core Web Vitals", href: "/guides/fix-core-web-vitals" },
              { label: "What is LCP and How to Fix It", href: "/blog/lcp-fix-guide" },
              { label: "Internal Linking Strategy", href: "/blog/internal-linking-strategy" },
              { label: "SEO Pricing & Plans", href: "/pricing" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors"
              >
                <span className="text-blue-500/60">›</span>
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* Divider before live results */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-white/5" />
          <span className="text-xs text-gray-500">Live Audit Results</span>
          <div className="flex-1 border-t border-white/5" />
        </div>
      </div>

      {/* ── Dynamic client audit ── */}
      <Suspense fallback={null}>
        <AuditDomainClient domain={domain} />
      </Suspense>
    </ReportShell>
  );
}
