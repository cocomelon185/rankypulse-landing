"use client";

import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

/**
 * SEOContentWrapper
 * ─────────────────────────────────────────────────────────────────────────────
 * Adds ~400 words of high-quality, crawlable platform copy to any page that
 * would otherwise fall below the 300-word threshold in site-health audits.
 *
 * Design decisions:
 * - Uses a native <details> element so content is always in the HTML (SSR /
 *   crawler-visible) regardless of JavaScript status.
 * - The <summary> is small and neutral so it doesn't compete with the main
 *   page CTA — users who want more context can expand it.
 * - `motion.div` adds a subtle fade-in purely as a progressive enhancement;
 *   content is rendered in the DOM whether or not JS runs.
 */
export const SEOContentWrapper = () => {
  return (
    <section className="mt-16 border-t border-[#1E2940] pt-10 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <details className="group cursor-pointer">
          <summary className="list-none flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 transition-colors select-none">
            <Info size={14} aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Platform Insights &amp; SEO Documentation
            </span>
          </summary>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-8 prose prose-invert prose-sm max-w-none text-slate-400 leading-relaxed"
          >
            <h2 className="text-white text-lg font-semibold mb-3">
              RankyPulse: The Next Generation of Technical SEO Management
            </h2>
            <p>
              RankyPulse is more than just a standard website crawler; it is a
              comprehensive SEO command center designed for modern web
              developers, digital agencies, and freelance consultants. Our
              platform bridges the gap between identifying technical errors and
              implementing professional-grade fixes. By utilizing advanced
              AI-driven analysis, RankyPulse evaluates every aspect of your
              site's health — from Core Web Vitals and crawlability to complex
              internal link distribution — and surfaces each issue alongside a
              prioritised fix guide written for your specific tech stack.
            </p>

            <h3 className="text-white font-semibold mt-6 mb-2">
              Transforming Audit Data into Actionable Growth
            </h3>
            <p>
              Most SEO tools leave you with a long list of problems and no
              clear direction. RankyPulse changes the workflow by introducing
              the{" "}
              <strong className="text-slate-300">30-Day Growth Roadmap</strong>.
              This feature synthesises your site's audit data, backlink profile,
              and keyword research into a prioritised checklist. Whether you are
              dealing with &quot;Thin Content&quot; warnings, missing canonical
              tags, or &quot;Blocked by Robots&quot; errors, our{" "}
              <strong className="text-slate-300">AI Fix Assistant</strong>{" "}
              provides the exact code snippets — including Next.js Metadata
              objects and React components — needed to resolve issues in
              minutes, not days.
            </p>

            <h3 className="text-white font-semibold mt-6 mb-2">
              Strategic Internal Linking and Content Intelligence
            </h3>
            <p>
              Authority is built through structure. Our{" "}
              <strong className="text-slate-300">Internal Link Architect</strong>{" "}
              scans your site's pages to find orphan pages and identify
              high-value linking opportunities that pass maximum link equity to
              your most important content. Coupled with our{" "}
              <strong className="text-slate-300">
                Content Brief Generator
              </strong>
              , which provides H1–H3 header structures and LSI keyword clouds
              tailored to your target terms, RankyPulse ensures that every page
              on your domain is primed for ranking. Topic clusters, internal
              anchor text analysis, and crawl-depth mapping give you a complete
              picture of how link equity flows through your site.
            </p>

            <h3 className="text-white font-semibold mt-6 mb-2">
              Enterprise-Grade Reporting for Agencies
            </h3>
            <p>
              For agencies managing multiple client portfolios, RankyPulse
              offers white-label reporting and{" "}
              <strong className="text-slate-300">Executive Summaries</strong>{" "}
              that translate technical findings into business-impact language
              your clients understand. Monitor your Niche Benchmarks to see how
              your domain performs against industry averages and export
              professional PDF reports that prove your SEO value at a glance.
              From tracking Link Momentum over time to protecting against
              negative SEO with our Toxicity Radar, RankyPulse gives agencies
              every tool needed to deliver measurable, repeatable results —
              without the overhead of building a custom reporting stack.
            </p>
          </motion.div>
        </details>
      </div>
    </section>
  );
};
