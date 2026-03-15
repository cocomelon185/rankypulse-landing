import type { Metadata } from "next";
import { AppNavbar } from "@/components/layout/Navbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import Link from "next/link";

export const metadata: Metadata = {
    title: { absolute: "Free SEO Tools | RankyPulse" },
    description:
        "Use our free SEO tools: site audit, meta tag checker, keyword research, backlink analyzer, and more. Start with a free site crawl — no signup required.",
    alternates: { canonical: "/tools" },
    robots: { index: true, follow: true },
    openGraph: {
        title: "Free SEO Tools | RankyPulse",
        description: "Audit your site, check SEO optimization, analyze competitors, track rankings, and research keywords with our suite of free and Pro tools.",
        url: "/tools",
        siteName: "RankyPulse",
        type: "website",
        images: [{ url: "https://rankypulse.com/og.jpg", width: 1200, height: 630, alt: "RankyPulse Free SEO Tools" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Free SEO Tools | RankyPulse",
        description: "Everything for SEO success: free site audits, meta tag analysis, rank tracking, backlink insights, and competitive intelligence.",
    },
};

const TOOLS = [
    {
        name: "Free Site Audit",
        description:
            "Crawl any website in seconds. Get a full breakdown of technical issues, on-page SEO problems, and quick wins.",
        href: "/audit",
        icon: "🔍",
        badge: "Free",
    },
    {
        name: "Meta Tag Checker",
        description:
            "Check if your title tags and meta descriptions are well-optimized for click-through rate.",
        href: "/audit",
        icon: "🏷️",
        badge: "Free",
    },
    {
        name: "Keyword Research",
        description:
            "Discover high-opportunity keywords with low difficulty for your niche.",
        href: "/app/keywords",
        icon: "📊",
        badge: "Pro",
    },
    {
        name: "Backlink Analyzer",
        description:
            "See who's linking to your site, their domain rating, and detect toxic links.",
        href: "/app/backlinks",
        icon: "🔗",
        badge: "Pro",
    },
    {
        name: "Rank Tracker",
        description:
            "Track daily rankings for your target keywords on desktop and mobile.",
        href: "/app/rank-tracking",
        icon: "📈",
        badge: "Pro",
    },
    {
        name: "Competitor Analysis",
        description:
            "Benchmark your SEO metrics against up to 5 competitors side by side.",
        href: "/app/competitors",
        icon: "⚔️",
        badge: "Pro",
    },
];

export default function ToolsPage() {
    return (
        <>
            <AppNavbar />
            <main className="min-h-screen pt-24 pb-16 px-6" style={{ background: "#0d0f14" }}>
                <div className="mx-auto max-w-5xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-4">Free SEO Tools</h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Everything you need to audit, analyze, and grow your organic search
                            presence — from a free site crawl to full Pro-grade analytics.
                        </p>
                    </div>

                    {/* Tools grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TOOLS.map((tool) => (
                            <Link
                                key={tool.name}
                                href={tool.href}
                                className="group block rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-orange-500/40 hover:bg-white/8 transition-all"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <span className="text-3xl">{tool.icon}</span>
                                    <span
                                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tool.badge === "Free"
                                            ? "bg-green-500/20 text-green-400"
                                            : "bg-orange-500/20 text-orange-400"
                                            }`}
                                    >
                                        {tool.badge}
                                    </span>
                                </div>
                                <h2 className="text-white font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                                    {tool.name}
                                </h2>
                                <p className="text-gray-400 text-sm">{tool.description}</p>
                            </Link>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center rounded-2xl border border-orange-500/30 bg-orange-500/5 p-10">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Start with a Free Site Audit
                        </h2>
                        <p className="text-gray-400 mb-6">
                            Run a complete SEO analysis in under 30 seconds. No signup required.
                        </p>
                        <Link
                            href="/audit"
                            className="inline-block px-8 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-400 transition-colors"
                        >
                            Run Free Audit ↗
                        </Link>
                    </div>
                </div>
            </main>
            <LandingFooter />
        </>
    );
}
