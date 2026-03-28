"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GLOSSARY: Record<string, string> = {
  Cannibalization:
    "When two or more pages on your site compete for the same keyword, diluting each other's ranking potential.",
  "Orphan Pages":
    "Pages that have no internal links pointing to them. Search engines struggle to find and index these pages.",
  Canonical:
    "An HTML tag that tells search engines which URL is the 'official' version of a page, preventing duplicate content issues.",
  "Core Web Vitals":
    "Google's set of real-world performance metrics: Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and Cumulative Layout Shift (CLS).",
  "Crawl Budget":
    "The number of pages search engine bots will crawl on your site within a given timeframe. Large sites need to optimize this.",
  "Structured Data":
    "Schema markup added to HTML that helps search engines understand your content and enables rich results (stars, FAQs, etc.).",
  "Thin Content":
    "Pages with little or no substantial content. Google may devalue or ignore these, hurting your overall site quality.",
  "Redirect Chain":
    "Multiple redirects chained together (A → B → C). Each hop wastes crawl budget and adds latency.",
  Hreflang:
    "An HTML attribute that tells search engines which language/region a page targets, used for international SEO.",
  noindex:
    'A meta tag or HTTP header telling search engines not to index a page. Use intentionally — accidentally set, it can remove pages from search.',
  "robots.txt":
    "A file that instructs search engine bots which pages or sections of your site they are allowed to crawl.",
  Sitemap:
    "An XML file listing all important URLs on your site. Helps search engines discover and index your content faster.",
  "Domain Authority":
    "A third-party score (by Moz) predicting how well a domain will rank. Not a direct Google ranking factor, but a useful benchmark.",
  "Bounce Rate":
    "The percentage of visitors who leave after viewing only one page. High bounce rate can signal poor relevance or UX.",
  CTR: "Click-Through Rate — the percentage of people who click your link after seeing it in search results. Higher CTR = more free traffic.",
};

interface GlossaryTooltipProps {
  term: keyof typeof GLOSSARY;
  children: React.ReactNode;
}

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const definition = GLOSSARY[term];
  if (!definition) return <>{children}</>;

  return (
    <span
      ref={containerRef}
      className="relative inline"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span className="cursor-help border-b border-dashed border-[var(--text-muted)] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
        {children}
      </span>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-56 rounded-lg border border-white/10 bg-[var(--bg-card,#151B27)] p-3 text-xs text-[var(--text-secondary)] shadow-xl"
            style={{ pointerEvents: "none" }}
          >
            <p className="mb-1 font-semibold text-[var(--text-primary)]">{term}</p>
            <p className="leading-relaxed">{definition}</p>
            {/* Small arrow */}
            <div className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 border-b border-r border-white/10 bg-[var(--bg-card,#151B27)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// Export the glossary so other components can use it for term detection
export { GLOSSARY };
