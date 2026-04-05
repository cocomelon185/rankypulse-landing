import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Check, X, Minus } from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "RankyPulse vs Ahrefs: Which SEO Tool Is Right for You? (2026)" },
  description:
    "RankyPulse vs Ahrefs compared head-to-head on price, features, ease of use, and who each tool is actually built for. Honest comparison for 2026.",
  alternates: { canonical: "https://rankypulse.com/compare/rankypulse-vs-ahrefs" },
  robots: { index: true, follow: true },
  keywords: ["rankypulse vs ahrefs", "ahrefs alternative", "ahrefs competitor", "cheap ahrefs alternative", "seo tool comparison 2026"],
  openGraph: {
    title: "RankyPulse vs Ahrefs: Which SEO Tool Is Right for You? (2026)",
    description: "An honest head-to-head comparison of RankyPulse and Ahrefs on price, features, ease of use, and target audience.",
    url: "https://rankypulse.com/compare/rankypulse-vs-ahrefs",
    siteName: "RankyPulse",
    type: "article",
    images: [{ url: "https://rankypulse.com/og.jpg", width: 1200, height: 630, alt: "RankyPulse vs Ahrefs comparison" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "RankyPulse vs Ahrefs: Which SEO Tool Is Right for You? (2026)",
    description: "Honest comparison for 2026 — price, features, ease of use, and who each tool is built for.",
    images: ["https://rankypulse.com/og.jpg"],
  },
};

type Status = "yes" | "no" | "partial";

interface Feature {
  name: string;
  rankypulse: Status;
  rankypulseNote?: string;
  ahrefs: Status;
  ahrefsNote?: string;
}

const FEATURES: Feature[] = [
  { name: "Free plan", rankypulse: "yes", rankypulseNote: "3 audits/month free", ahrefs: "no", ahrefsNote: "No free plan" },
  { name: "Starting price", rankypulse: "yes", rankypulseNote: "$9/month", ahrefs: "no", ahrefsNote: "$129/month" },
  { name: "No credit card to start", rankypulse: "yes", ahrefs: "no" },
  { name: "Site audit", rankypulse: "yes", ahrefs: "yes" },
  { name: "Keyword research", rankypulse: "yes", ahrefs: "yes" },
  { name: "Rank tracking", rankypulse: "yes", ahrefs: "yes" },
  { name: "Backlink analysis", rankypulse: "partial", rankypulseNote: "Basic backlink data", ahrefs: "yes", ahrefsNote: "Industry-leading backlink database" },
  { name: "Competitor intelligence", rankypulse: "yes", ahrefs: "yes" },
  { name: "Action Center with fix priority", rankypulse: "yes", rankypulseNote: "Built-in prioritised fix list", ahrefs: "no", ahrefsNote: "Raw data only" },
  { name: "Copy-ready fixes", rankypulse: "yes", rankypulseNote: "Plain-English fix instructions", ahrefs: "no", ahrefsNote: "Requires SEO knowledge to act" },
  { name: "Content Ideas", rankypulse: "yes", ahrefs: "yes" },
  { name: "Internal link analysis", rankypulse: "yes", ahrefs: "yes" },
  { name: "PDF export", rankypulse: "yes", rankypulseNote: "Pro plan", ahrefs: "yes" },
  { name: "Team seats", rankypulse: "partial", rankypulseNote: "Business plan", ahrefs: "yes" },
  { name: "Learning curve", rankypulse: "yes", rankypulseNote: "Beginner-friendly", ahrefs: "partial", ahrefsNote: "Steep for non-SEOs" },
  { name: "Built for non-SEOs", rankypulse: "yes", ahrefs: "no", ahrefsNote: "Built for SEO professionals" },
];

function StatusIcon({ status }: { status: Status }) {
  if (status === "yes") return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  if (status === "no") return <X className="w-5 h-5 text-red-400 mx-auto" />;
  return <Minus className="w-5 h-5 text-yellow-500 mx-auto" />;
}

export default function CompareRankyPulseVsAhrefsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "RankyPulse vs Ahrefs: Which SEO Tool Is Right for You?",
    description: "An honest head-to-head comparison of RankyPulse and Ahrefs on price, features, ease of use, and target audience.",
    url: "https://rankypulse.com/compare/rankypulse-vs-ahrefs",
    datePublished: "2026-03-01",
    dateModified: "2026-04-01",
    publisher: { "@type": "Organization", name: "RankyPulse", url: "https://rankypulse.com" },
  };

  return (
    <div className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pt-24 pb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 mb-6">
            Honest comparison — updated April 2026
          </div>
          <h1 className="text-4xl font-bold text-gray-900 md:text-5xl mb-6 leading-tight">
            RankyPulse vs Ahrefs:<br />Which SEO Tool Is Right for You?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ahrefs is the industry standard for SEO professionals. RankyPulse is built for everyone else — founders, marketers, and small business owners who need results without the complexity or the price tag.
          </p>
        </section>

        {/* Quick verdict */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">RP</div>
                <div>
                  <div className="font-bold text-gray-900">RankyPulse</div>
                  <div className="text-sm text-indigo-600 font-medium">From $0 — $9/month</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                Best for founders, marketers, and small business owners who want to fix their SEO without hiring an expert. Gives you a prioritised action list, plain-English fixes, and a clear score — not raw data that requires interpretation.
              </p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Best for:</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>✓ First-time SEO users</li>
                <li>✓ Founders doing SEO themselves</li>
                <li>✓ Small businesses on a budget</li>
                <li>✓ Agencies wanting affordable client reporting</li>
              </ul>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gray-800 flex items-center justify-center text-white font-bold text-sm">Ah</div>
                <div>
                  <div className="font-bold text-gray-900">Ahrefs</div>
                  <div className="text-sm text-gray-600 font-medium">From $129/month</div>
                </div>
              </div>
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                Best for professional SEOs, large agencies, and enterprise teams who need the deepest backlink data on the market and are comfortable extracting insights from raw data dashboards.
              </p>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Best for:</p>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>✓ Professional SEO consultants</li>
                <li>✓ Enterprise marketing teams</li>
                <li>✓ Large agencies with SEO expertise</li>
                <li>✓ Link building specialists</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Price comparison */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Price Comparison</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700">Plan</th>
                  <th className="text-center px-6 py-4 font-semibold text-indigo-700">RankyPulse</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">Ahrefs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 text-gray-700">Free / Trial</td>
                  <td className="px-6 py-4 text-center text-green-700 font-medium">Free plan (3 audits/mo)</td>
                  <td className="px-6 py-4 text-center text-gray-500">No free plan</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">Entry plan</td>
                  <td className="px-6 py-4 text-center text-green-700 font-medium">$9/month (Starter)</td>
                  <td className="px-6 py-4 text-center text-gray-700">$129/month (Lite)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-gray-700">Mid tier</td>
                  <td className="px-6 py-4 text-center text-green-700 font-medium">$29/month (Pro)</td>
                  <td className="px-6 py-4 text-center text-gray-700">$249/month (Standard)</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-gray-700">Annual discount</td>
                  <td className="px-6 py-4 text-center text-green-700 font-medium">20% off</td>
                  <td className="px-6 py-4 text-center text-gray-700">~16% off</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            At $9/month, RankyPulse Starter costs <strong>93% less</strong> than Ahrefs Lite. For founders and small businesses, that difference matters.
          </p>
        </section>

        {/* Feature comparison table */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Feature Comparison</h2>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-semibold text-gray-700 w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-indigo-700">RankyPulse</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">Ahrefs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {FEATURES.map((f, i) => (
                  <tr key={i} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="px-6 py-4 text-gray-700 font-medium">{f.name}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusIcon status={f.rankypulse} />
                      {f.rankypulseNote && <div className="text-xs text-gray-500 mt-1">{f.rankypulseNote}</div>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusIcon status={f.ahrefs} />
                      {f.ahrefsNote && <div className="text-xs text-gray-500 mt-1">{f.ahrefsNote}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to choose each */}
        <section className="mx-auto max-w-4xl px-6 pb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">When to Choose Each Tool</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-indigo-700 mb-4">Choose RankyPulse if you…</h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Are doing SEO for the first time and need a tool that tells you exactly what to fix</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Run a small business or startup with a budget under $30/month</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Want actionable priorities, not raw data spreadsheets</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Need to audit client sites without paying $129+/month per account</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />Want to track keyword rankings without a learning curve</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Choose Ahrefs if you…</h3>
              <ul className="space-y-3 text-gray-700 text-sm">
                <li className="flex gap-3"><Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Are a professional SEO consultant needing deep backlink analysis</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Run a large agency with multiple staff who live in SEO tools daily</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Need the most comprehensive backlink database available</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Require advanced keyword difficulty and SERP analysis for competitive niches</li>
                <li className="flex gap-3"><Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />Budget is not a constraint and you need enterprise-grade data</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-4xl px-6 pb-24">
          <div className="rounded-2xl bg-indigo-600 px-8 py-12 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Try RankyPulse free — no credit card needed</h2>
            <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
              Run your first SEO audit in under 60 seconds. See exactly what is holding your site back and get a prioritised fix list — for free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/audit"
                className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors"
              >
                Run a free audit →
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg border border-indigo-400 px-8 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
              >
                View pricing
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Also comparing:{" "}
            <Link href="/blog/rankypulse-vs-screaming-frog-vs-ahrefs" className="text-indigo-600 hover:underline">
              RankyPulse vs Screaming Frog vs Ahrefs
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
