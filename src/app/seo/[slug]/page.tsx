import { clampTitle, clampDesc } from "@/lib/metadata";
import Link from "next/link";

interface PageContent {
  title: string;
  description: string;
  canonical: string;
  intro: string;
  sections: { heading: string; body: string }[];
  bullets: string[];
  cta: string;
}

const pages: Record<string, PageContent> = {
  "seo-audit-tool": {
    title: "Free SEO Audit Tool",
    description:
      "Run a free SEO audit and get a prioritised list of technical issues, on-page fixes, and quick wins that move the needle on your search rankings.",
    canonical: "https://rankypulse.com/seo-audit-tool",
    intro:
      "A site audit is the fastest way to understand why your pages aren't ranking. RankyPulse crawls your entire website in seconds and surfaces every technical and on-page issue that could be holding back your organic traffic — along with a clear fix priority and estimated traffic impact for each one.",
    sections: [
      {
        heading: "What the SEO Audit Checks",
        body: "The audit engine inspects over 100 ranking signals across six categories: crawlability, indexing, on-page metadata, page speed, internal linking, and structured data. Every issue is scored by severity so you always know what to fix first. You get broken down results for title tags, meta descriptions, canonical tags, robots directives, redirect chains, Core Web Vitals, missing alt text, and more — with exact file paths and line-level recommendations for Next.js, WordPress, Shopify, and plain HTML sites.",
      },
      {
        heading: "Why Regular Audits Matter",
        body: "Search engines re-crawl your site constantly, and a single misconfigured robots.txt or accidental noindex tag can wipe out months of ranking progress overnight. Running a monthly audit keeps your technical foundation solid, catches regressions before they compound, and gives you a measurable baseline to track improvement over time. Teams using RankyPulse typically resolve critical issues 3× faster than manual review because every finding comes with a copy-paste code fix — not a vague recommendation.",
      },
    ],
    bullets: [
      "Crawl any public URL — no signup required",
      "Instant results with severity scores and traffic-impact estimates",
      "AI-generated fix suggestions with ready-to-paste code",
      "Supports Next.js, WordPress, Shopify, and static sites",
      "Exportable PDF report for clients or stakeholders",
    ],
    cta: "Run your free audit now — no account needed.",
  },

  "technical-seo-audit": {
    title: "Technical SEO Audit",
    description:
      "Check every technical SEO signal — crawlability, indexing, Core Web Vitals, structured data, and redirect health — and get a prioritised fix list with copy-paste code.",
    canonical: "https://rankypulse.com/technical-seo-audit",
    intro:
      "Technical SEO is the foundation everything else builds on. Even the best content won't rank if search engines can't crawl and index it efficiently. RankyPulse's technical audit deep-dives into your site's infrastructure and pinpoints the exact issues that prevent Google from discovering, rendering, and ranking your pages.",
    sections: [
      {
        heading: "What Technical SEO Covers",
        body: "Technical SEO encompasses crawlability (are your pages accessible to bots?), indexability (are they allowed into the index?), page speed (do they load fast enough to meet Core Web Vitals thresholds?), and structured data (does Google understand your content type?). RankyPulse checks all four layers simultaneously — flagging blocked resources in robots.txt, duplicate canonicals, slow Largest Contentful Paint scores, missing schema markup, and HTTPS mixed-content errors in a single crawl pass.",
      },
      {
        heading: "How to Fix Technical Issues Fast",
        body: "Each issue in the audit comes with an AI-generated fix guide tailored to your specific tech stack. If you're on Next.js, you'll get the exact metadata export to add. On WordPress, you'll get the specific Yoast or Rank Math setting to toggle. The fix assistant also flags the traffic impact estimate so your team can triage by ROI, not just severity. Most critical technical issues can be resolved in under 30 minutes with the step-by-step guides provided.",
      },
    ],
    bullets: [
      "Crawl budget analysis and blocked-resource detection",
      "Core Web Vitals (LCP, CLS, INP) benchmarking",
      "Canonical tag validation and duplicate detection",
      "HTTPS & mixed-content security checks",
      "XML sitemap and robots.txt validation",
    ],
    cta: "Audit your technical SEO in seconds — free.",
  },

  "meta-tag-checker": {
    title: "Meta Tag Checker",
    description:
      "Analyse every title tag and meta description on your site. Find duplicates, missing tags, and character-limit violations that hurt click-through rates and search rankings.",
    canonical: "https://rankypulse.com/meta-tag-checker",
    intro:
      "Meta tags are the first thing both search engines and users see. A missing or poorly written meta description can cut your click-through rate by half, even if you rank on page one. RankyPulse's meta tag checker scans every page on your site and gives you a line-by-line report of what's working, what's broken, and exactly what to write instead.",
    sections: [
      {
        heading: "What the Meta Tag Checker Analyses",
        body: "The checker validates title tags against Google's 50–60 character display limit, flags descriptions shorter than 70 characters or longer than 160, detects duplicate titles and descriptions across multiple pages, and checks for missing Open Graph and Twitter Card tags. It also catches issues like title template duplication (where 'Page Name | Brand | Brand' appears because of misconfigured Next.js metadata templates) and descriptions that are pulled from body copy rather than written intentionally.",
      },
      {
        heading: "Why Meta Tags Impact Rankings",
        body: "Title tags are a confirmed on-page ranking signal. Descriptive, keyword-rich titles help Google understand page relevance and assign the right search intent. Meta descriptions don't directly affect rankings, but they drive click-through rate — and a high CTR sends a positive engagement signal that can lift your position over time. Pages with missing or duplicate descriptions are often rewritten by Google using random body text, which frequently performs worse than a crafted description.",
      },
    ],
    bullets: [
      "Character-count validation for titles and descriptions",
      "Duplicate metadata detection across the entire site",
      "Open Graph and Twitter Card tag verification",
      "Live SERP preview showing exactly how Google will display your snippet",
      "AI-suggested rewrites with optimal length and keyword placement",
    ],
    cta: "Check your meta tags for free — see your SERP preview instantly.",
  },

  "internal-link-checker": {
    title: "Internal Link Checker",
    description:
      "Find orphan pages, broken internal links, and link equity gaps across your site. Build a stronger internal linking structure that passes authority to your highest-value pages.",
    canonical: "https://rankypulse.com/internal-link-checker",
    intro:
      "Internal links are one of the most underutilised SEO levers. They tell search engines which pages are most important, how your content is organised, and how to navigate your site efficiently. RankyPulse maps every internal link across your domain and surfaces orphan pages, link depth problems, and missed opportunities to strengthen your most valuable pages.",
    sections: [
      {
        heading: "What the Internal Link Checker Finds",
        body: "The checker builds a complete link graph of your site — identifying pages with no inbound internal links (orphan pages that search engines rarely discover), pages buried more than three clicks from the homepage, anchor text patterns that fail to communicate page relevance, and broken links returning 404 errors. It also flags pages that receive disproportionately high or low internal link authority compared to their importance in your content strategy.",
      },
      {
        heading: "How to Build a Stronger Link Structure",
        body: "A healthy internal linking structure groups related content into topic clusters, uses descriptive anchor text that includes target keywords naturally, and routes link equity toward pages you want to rank. The RankyPulse link checker outputs a prioritised list of suggested links: which existing pages should link to which targets, with recommended anchor text for each. For most sites, adding 10–20 strategic internal links has a measurable impact on rankings within 4–6 weeks.",
      },
    ],
    bullets: [
      "Orphan page detection — pages with zero inbound internal links",
      "Link depth mapping — clicks from homepage to every page",
      "Broken internal link scanning with 404 identification",
      "Anchor text analysis and keyword optimisation suggestions",
      "Topic cluster visualisation to spot content gaps",
    ],
    cta: "Scan your internal links free — find orphan pages in seconds.",
  },

  "redirect-checker": {
    title: "Redirect Checker",
    description:
      "Detect redirect chains, loops, and incorrect redirect types across your site. Fix the technical issues that dilute link equity and slow down Googlebot's crawl.",
    canonical: "https://rankypulse.com/redirect-checker",
    intro:
      "Redirects are necessary for SEO — but poorly implemented redirects destroy it. A single redirect chain (A → B → C instead of A → C) can reduce the link equity passed to the final destination by up to 15%. A redirect loop brings everything to a complete halt. RankyPulse traces every redirect path on your site and flags the exact chains, loops, and misconfigurations that cost you ranking power.",
    sections: [
      {
        heading: "Redirect Issues That Hurt SEO",
        body: "The most common redirect problems are chains (multiple hops before reaching the final URL), loops (circular redirects that never resolve), incorrect redirect types (302 temporary redirects used where 301 permanent redirects are needed), HTTP-to-HTTPS redirects that add unnecessary hops, and redirects that point to 404 pages. Each issue has a different SEO impact: chains dilute PageRank, loops block crawling entirely, and wrong redirect types can prevent link equity transfer.",
      },
      {
        heading: "How to Audit and Fix Redirects",
        body: "RankyPulse crawls every URL on your site and follows each redirect chain to its final destination, logging the full path, HTTP status codes at each step, and the total number of hops. The fix guide for each issue is specific to your stack — whether you need to update an .htaccess file, a Next.js redirect config, a Cloudflare page rule, or a Shopify URL redirect. Consolidating redirect chains to single-hop 301s is one of the highest-ROI technical fixes you can make.",
      },
    ],
    bullets: [
      "Full redirect chain tracing with hop count and status codes",
      "Redirect loop detection with exact circular path",
      "301 vs 302 vs 307 type validation",
      "HTTP to HTTPS redirect efficiency check",
      "Stack-specific fix guides (.htaccess, Next.js, Shopify, Cloudflare)",
    ],
    cta: "Scan your redirects free — fix chains and loops in minutes.",
  },

  "competitor-seo-analysis": {
    title: "Competitor SEO Analysis",
    description:
      "Benchmark your SEO performance against up to 5 competitors. Identify keyword gaps, backlink opportunities, and content angles your rivals are winning on.",
    canonical: "https://rankypulse.com/seo/competitor-seo-analysis",
    intro:
      "Understanding where you stand relative to your competitors is the fastest way to prioritise your SEO roadmap. RankyPulse's competitor analysis puts your domain side-by-side with up to five rivals across domain authority, organic keyword count, top-ranking pages, and backlink profile — so you can see exactly where the gaps are and what it would take to close them.",
    sections: [
      {
        heading: "What Competitor Analysis Reveals",
        body: "The analysis compares your site against competitors on four dimensions: keyword overlap (keywords you both rank for, and at what positions), keyword gaps (terms competitors rank for that you don't target at all), content performance (which of their pages generate the most organic traffic and why), and backlink sources (high-authority domains linking to competitors but not to you). Each insight is paired with an opportunity score so you can prioritise the highest-ROI moves first.",
      },
      {
        heading: "Turning Competitor Data Into Strategy",
        body: "The most actionable output of a competitor analysis is the keyword gap list — terms your competitors rank in positions 1–20 for, where you have no ranking at all. These represent existing search demand with proven intent, ready for you to capture with targeted content. RankyPulse also identifies competitor backlink sources that accept third-party contributions, making link outreach more efficient by focusing on sites that have already said yes to similar brands.",
      },
    ],
    bullets: [
      "Side-by-side domain authority and traffic comparison",
      "Keyword gap analysis — terms competitors rank for that you don't",
      "Top competitor pages ranked by estimated organic traffic",
      "Shared and exclusive backlink source breakdown",
      "Opportunity scores for every gap to prioritise by ROI",
    ],
    cta: "Compare your SEO against competitors — free analysis in 60 seconds.",
  },

  "keyword-gap-analysis": {
    title: "Keyword Gap Analysis",
    description:
      "Find every keyword your competitors rank for but you don't. Prioritise the highest-traffic, lowest-difficulty gaps and build a content plan that closes them fast.",
    canonical: "https://rankypulse.com/seo/keyword-gap-analysis",
    intro:
      "Keyword gap analysis is the most efficient way to grow organic traffic: instead of guessing what to write, you find terms that already have proven search demand and that competitors are already ranking for — then you build better content for those exact terms. RankyPulse automates the entire process, from gap identification to difficulty scoring to content brief generation.",
    sections: [
      {
        heading: "How Keyword Gap Analysis Works",
        body: "Enter your domain and up to five competitor domains. RankyPulse pulls the full keyword ranking data for each domain and cross-references them to find three categories: shared keywords (terms you all rank for — where you can benchmark position and CTR), competitor-only keywords (terms at least one competitor ranks for that you don't target — your primary opportunities), and your exclusive keywords (terms only you rank for — your current moat to defend). Each gap keyword is scored for search volume, keyword difficulty, current competition density, and estimated traffic potential if you ranked in the top 3.",
      },
      {
        heading: "Prioritising Which Gaps to Close First",
        body: "Not all gaps are equal. A high-volume keyword with KD 80 may be less valuable to pursue than a mid-volume keyword with KD 25 where a competitor ranks #8 with thin content. RankyPulse's opportunity score factors in volume, difficulty, your domain's current authority, and the quality of existing ranking content to surface the gaps where you have the highest probability of breaking into the top 10. The output is a ranked list of target keywords with suggested content formats — pillar pages, comparison posts, tool pages — for each.",
      },
    ],
    bullets: [
      "Cross-domain keyword comparison for up to 5 competitors",
      "Gap keywords scored by volume, difficulty, and opportunity",
      "Filter by intent (informational, commercial, transactional)",
      "Content format recommendations for each target keyword",
      "Exportable keyword list for direct import into content calendars",
    ],
    cta: "Find your keyword gaps now — free competitor comparison.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];

  if (!page) {
    return { title: "Page Not Found | RankyPulse" };
  }

  return {
    title: { absolute: clampTitle(`${page.title} | RankyPulse`) },
    description: clampDesc(page.description),
    alternates: { canonical: page.canonical },
  };
}

export function generateStaticParams() {
  return Object.keys(pages).map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = pages[slug as keyof typeof pages];

  if (!page) {
    return (
      <main style={{ maxWidth: 900, margin: "80px auto", padding: "0 24px" }}>
        <h1>Page not found</h1>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: 820,
        margin: "80px auto",
        padding: "0 24px 80px",
        fontFamily: "Inter, sans-serif",
        color: "#e2e8f0",
        lineHeight: 1.75,
      }}
    >
      {/* Hero */}
      <h1
        style={{
          fontSize: "2.25rem",
          fontWeight: 800,
          color: "#f8fafc",
          marginBottom: "1rem",
          letterSpacing: "-0.02em",
        }}
      >
        {page.title}
      </h1>
      <p
        style={{
          fontSize: "1.125rem",
          color: "#94a3b8",
          marginBottom: "2rem",
          maxWidth: 640,
        }}
      >
        {page.description}
      </p>

      {/* CTA button */}
      <Link
        href="/audit"
        style={{
          display: "inline-block",
          background: "#FF642D",
          color: "#fff",
          fontWeight: 700,
          padding: "0.75rem 1.75rem",
          borderRadius: "0.75rem",
          textDecoration: "none",
          fontSize: "0.95rem",
          marginBottom: "3rem",
        }}
      >
        {page.cta}
      </Link>

      {/* Intro */}
      <p style={{ fontSize: "1rem", color: "#cbd5e1", marginBottom: "2.5rem" }}>
        {page.intro}
      </p>

      {/* Content sections */}
      {page.sections.map((s) => (
        <section key={s.heading} style={{ marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: "0.75rem",
            }}
          >
            {s.heading}
          </h2>
          <p style={{ color: "#cbd5e1" }}>{s.body}</p>
        </section>
      ))}

      {/* Feature bullets */}
      <section style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "1.375rem",
            fontWeight: 700,
            color: "#f1f5f9",
            marginBottom: "1rem",
          }}
        >
          Key Features
        </h2>
        <ul style={{ paddingLeft: "1.25rem", color: "#94a3b8" }}>
          {page.bullets.map((b) => (
            <li key={b} style={{ marginBottom: "0.5rem" }}>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* Footer CTA */}
      <div
        style={{
          borderTop: "1px solid #1e293b",
          paddingTop: "2rem",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#64748b", marginBottom: "1rem" }}>
          Ready to fix your SEO?
        </p>
        <Link
          href="/audit"
          style={{
            display: "inline-block",
            background: "#FF642D",
            color: "#fff",
            fontWeight: 700,
            padding: "0.75rem 2rem",
            borderRadius: "0.75rem",
            textDecoration: "none",
          }}
        >
          Start Free Audit →
        </Link>
      </div>
    </main>
  );
}
