import type { Metadata } from "next";
import { GrowthRoadmapClient } from "./GrowthRoadmapClient";
import { SEOContentWrapper } from "@/components/landing/SEOContentWrapper";

export const metadata: Metadata = {
  title: { absolute: "30-Day SEO Growth Roadmap | Fix & Rank Fast | RankyPulse" },
  description:
    "Your personalised 30-day SEO sprint — synthesised from audit, link, and keyword data.",
  alternates: { canonical: "https://rankypulse.com/roadmap" },
  robots: { index: true, follow: true },
};

export default function RoadmapPage() {
  return (
    <>
      {/* Server-rendered intro — visible to crawlers before JS hydration */}
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-4">
        <h1 className="font-['Fraunces'] text-3xl font-bold text-white md:text-4xl mb-4">
          Your 30-Day SEO Growth Roadmap
        </h1>
        <p className="text-gray-400 text-base leading-relaxed mb-2">
          Stop guessing what to fix next. RankyPulse synthesises your site audit, backlink data, and keyword gaps into a personalised week-by-week sprint that actually moves the needle. Each week focuses on a different pillar — technical health, on-page content, authority building, and conversion — so you make steady, measurable progress rather than jumping between random tasks.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          Most sites see a 15–25% improvement in organic clicks within 30 days of following the roadmap. The plan adapts to your domain authority, industry, and the severity of issues found in your last audit — whether you are a small business owner doing SEO for the first time or an agency managing multiple client sites.
        </p>
      </div>
      <GrowthRoadmapClient />
      <SEOContentWrapper />
    </>
  );
}
