import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { absolute: "Changelog | What's New in RankyPulse" },
  description:
    "See everything new in RankyPulse — feature releases, bug fixes, and improvements to your SEO audit and rank tracking tools.",
  alternates: { canonical: "https://rankypulse.com/changelog" },
  robots: { index: true, follow: true },
};

const CHANGELOG = [
  {
    date: "April 1, 2026",
    version: "v1.8",
    tag: "Feature",
    tagColor: "bg-green-100 text-green-800",
    title: "Keyword Research Now Shows Real Search Volumes",
    description:
      "Fixed a data mapping issue where search volume was displaying as 'undefined'. Keyword research now surfaces accurate monthly search volume, CPC, and competition data for every keyword opportunity. The tool also shows clear 'Quick Win', 'Low Competition', and 'High CPC' opportunity signals.",
  },
  {
    date: "March 28, 2026",
    version: "v1.7",
    tag: "Content",
    tagColor: "bg-purple-100 text-purple-800",
    title: "New SEO Guides: Technical SEO Audit & Free Audit Tool",
    description:
      "Published two new in-depth guides targeting high-intent search queries. The Technical SEO Audit guide covers all 8 audit elements with prioritised fix guides. The Free Technical SEO Audit guide explains exactly what each check means and how to act on results.",
  },
  {
    date: "March 18, 2026",
    version: "v1.6",
    tag: "Fix",
    tagColor: "bg-orange-100 text-orange-800",
    title: "Duplicate Blog Slug Resolved",
    description:
      "Resolved a duplicate URL issue where two blog posts shared the same slug ('seo-audit-checklist-2026'). The older, thinner version has been renamed to 'free-seo-audit-checklist'. Google was splitting ranking signal between both — this consolidates authority to the stronger, more comprehensive guide.",
  },
  {
    date: "March 15, 2026",
    version: "v1.5",
    tag: "Feature",
    tagColor: "bg-green-100 text-green-800",
    title: "Action Center: Prioritised Fix List",
    description:
      "The Action Center now shows your 8 most impactful SEO fixes, broken down by Content and Performance. Each fix shows its potential score impact so you know which to tackle first. Filter by To Do, Done, and All Tasks.",
  },
  {
    date: "March 10, 2026",
    version: "v1.4",
    tag: "Feature",
    tagColor: "bg-green-100 text-green-800",
    title: "Rank Tracking: Daily Keyword Visibility Updates",
    description:
      "Rank Tracking now refreshes daily at 6am UTC. Track up to 500 keywords per project. The Keyword Visibility Trend chart shows your composite ranking score over 7, 30, and 90-day windows. Bulk import via CSV supported.",
  },
  {
    date: "February 24, 2026",
    version: "v1.3",
    tag: "Feature",
    tagColor: "bg-green-100 text-green-800",
    title: "Thematic SEO Reports: 6 Category Breakdown",
    description:
      "The site audit now produces six thematic reports — Crawlability, HTTPS, Site Performance, Internal Linking, Markup, and Core Web Vitals — each with a 0–100 score and per-issue details. Score history tracks your improvement over time.",
  },
  {
    date: "February 10, 2026",
    version: "v1.2",
    tag: "Feature",
    tagColor: "bg-green-100 text-green-800",
    title: "Competitor Intelligence Dashboard",
    description:
      "Added Competitor Intelligence to the app sidebar. Set up monitoring for up to 5 competitor domains. Track their SEO score changes, new pages, and ranking movements alongside your own.",
  },
  {
    date: "January 20, 2026",
    version: "v1.1",
    tag: "Launch",
    tagColor: "bg-blue-100 text-blue-800",
    title: "Public Beta Launch",
    description:
      "RankyPulse launched in public beta with a free SEO audit tool, dashboard, keyword research, and rank tracking. Free plan includes 3 audits per month. Starter plan at $9/month adds 25 audits, keyword gap analysis, and score tracking.",
  },
];

export default function ChangelogPage() {
  return (
    <div className="page-shell">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Changelog</h1>
          <p className="text-lg text-gray-600">
            Everything new in RankyPulse — features, fixes, and improvements.
            Follow our progress as we build the simplest SEO tool for site owners.
          </p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 ml-[7px]" />

          <div className="space-y-12">
            {CHANGELOG.map((entry, i) => (
              <div key={i} className="relative pl-8">
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow" />

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <time className="text-sm text-gray-500">{entry.date}</time>
                    <span className="text-xs text-gray-400">{entry.version}</span>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.tagColor}`}>
                      {entry.tag}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{entry.title}</h2>
                  <p className="text-gray-600 leading-relaxed">{entry.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-xl border border-indigo-200 bg-indigo-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stay up to date</h3>
          <p className="text-gray-600 mb-6">
            Get notified when we ship new features. Run a free SEO audit while you are here.
          </p>
          <Link
            href="/audit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Run a free SEO audit →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
