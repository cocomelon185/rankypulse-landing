/**
 * Programmatic SEO audit landing pages dataset.
 * Used for traffic generation and internal linking.
 */

export type AuditLanding = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  bullets: string[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
  checklist?: { category: string; items: string[] }[];
  howItWorks?: { step: string; desc: string }[];
  whatIsSection?: string;
};

export const AUDIT_PAGES: AuditLanding[] = [
  {
    slug: "wordpress-seo-audit",
    title: "WordPress SEO Audit",
    metaTitle: "WordPress SEO Audit Tool — Free Site Analysis | RankyPulse",
    metaDescription:
      "Run a free WordPress SEO audit to find technical issues, plugin conflicts, and on-page gaps. Get actionable fixes in under 30 seconds.",
    intro:
      "WordPress powers over 40% of the web, but default setups often leave rankings on the table. A WordPress SEO audit reveals plugin conflicts, slow queries, and schema gaps that block your content from ranking.",
    bullets: [
      "Detect plugin conflicts and bloat that slow down your site and hurt Core Web Vitals",
      "Identify missing or duplicate meta tags, canonicals, and schema markup across posts",
      "Surface indexability issues, orphaned pages, and crawl waste that dilute link equity",
    ],
    faqs: [
      {
        q: "How often should I run a WordPress SEO audit?",
        a: "Run a full audit quarterly and spot-checks after major updates, plugin adds, or theme changes. Core Web Vitals shifts warrant a refresh too.",
      },
      {
        q: "Can a WordPress SEO audit fix issues automatically?",
        a: "RankyPulse surfaces what to fix and how. Some fixes are one-click; others require edits in your theme or plugins. We prioritize by impact.",
      },
      {
        q: "Does RankyPulse work with WooCommerce and page builders?",
        a: "Yes. We audit standard WordPress, WooCommerce, and sites built with Elementor, Divi, or Gutenberg. Schema and performance insights apply across setups.",
      },
    ],
    relatedSlugs: ["technical-seo-audit", "site-speed-seo-audit", "on-page-seo-audit", "core-web-vitals-audit"],
  },
  {
    slug: "shopify-seo-audit",
    title: "Shopify SEO Audit",
    metaTitle: "Shopify SEO Audit — Free E‑commerce SEO Check | RankyPulse",
    metaDescription:
      "Free Shopify SEO audit for stores. Fix duplicate content, meta tags, and site speed. Improve product page rankings and visibility.",
    intro:
      "Shopify stores face unique SEO challenges: duplicate content from collections, thin product descriptions, and slow checkout paths. A targeted audit pinpoints what's holding your store back from search visibility.",
    bullets: [
      "Uncover duplicate and thin content across collections, filters, and product variants",
      "Optimize meta titles, descriptions, and schema for products and category pages",
      "Check Core Web Vitals and mobile experience so Google favors your store",
    ],
    faqs: [
      {
        q: "Is a Shopify SEO audit different from a general site audit?",
        a: "Yes. We focus on Shopify-specific issues like collection URL structure, product schema, and internal linking for catalog pages. Generic audits miss these.",
      },
      {
        q: "Will this audit slow down my Shopify store?",
        a: "No. RankyPulse crawls your store from the outside, like Google. No code is installed on your site.",
      },
    ],
    relatedSlugs: ["ecommerce-seo-audit", "technical-seo-audit", "on-page-seo-audit"],
  },
  {
    slug: "wix-seo-audit",
    title: "Wix SEO Audit",
    metaTitle: "Wix SEO Audit — Free Wix Site Check | RankyPulse",
    metaDescription:
      "Run a free Wix SEO audit. Find meta issues, sitemap problems, and page speed blockers. Actionable fixes in 30 seconds.",
    intro:
      "Wix has improved its SEO tools, but many sites still suffer from weak meta tags, limited schema support, and suboptimal structure. A Wix SEO audit shows exactly where to improve.",
    bullets: [
      "Verify meta titles, descriptions, and Open Graph tags on every key page",
      "Check sitemap coverage and indexability for blog posts and landing pages",
      "Assess Core Web Vitals and identify images or scripts slowing the site",
    ],
    faqs: [
      {
        q: "Can I fix Wix SEO issues without coding?",
        a: "Most fixes are possible in the Wix dashboard. RankyPulse tells you what to change and where; some may require Wix SEO tools or Velo.",
      },
    ],
    relatedSlugs: ["squarespace-seo-audit", "on-page-seo-audit", "site-speed-seo-audit"],
  },
  {
    slug: "squarespace-seo-audit",
    title: "Squarespace SEO Audit",
    metaTitle: "Squarespace SEO Audit — Free Site Analysis | RankyPulse",
    metaDescription:
      "Free Squarespace SEO audit. Check meta tags, schema, and site speed. Get actionable fixes for better rankings.",
    intro:
      "Squarespace sites look polished but can miss SEO basics: custom meta per page, rich snippets, and fast load times. An audit reveals gaps before competitors outrank you.",
    bullets: [
      "Audit meta titles and descriptions across pages, blog posts, and portfolio items",
      "Identify missing or incorrect schema markup for local and product pages",
      "Score Core Web Vitals and get targeted recommendations for images and scripts",
    ],
    faqs: [
      {
        q: "How does RankyPulse compare to Squarespace Analytics?",
        a: "Squarespace shows traffic. RankyPulse shows what's wrong technically and how to fix it—meta, schema, speed—so you can improve rankings.",
      },
    ],
    relatedSlugs: ["wix-seo-audit", "on-page-seo-audit", "technical-seo-audit"],
  },
  {
    slug: "local-seo-audit",
    title: "Local SEO Audit",
    metaTitle: "Local SEO Audit — Free Local Business Check | RankyPulse",
    metaDescription:
      "Free local SEO audit for businesses. Check NAP consistency, local schema, and GBP signals. Improve local pack visibility.",
    intro:
      "Local SEO depends on NAP consistency, LocalBusiness schema, and page quality. A local SEO audit surfaces directory mismatches, missing schema, and content gaps that hurt local pack rankings.",
    bullets: [
      "Verify NAP consistency across your site and identify conflicting citations",
      "Check LocalBusiness and Service schema for proper local entity markup",
      "Assess location pages, service areas, and review signals for local intent",
    ],
    faqs: [
      {
        q: "Does this replace a Google Business Profile audit?",
        a: "No. We focus on your website's local signals. Use our audit alongside GBP optimization for full local visibility.",
      },
      {
        q: "How long until I see local rankings improve?",
        a: "Fixes can show impact in 2–8 weeks depending on competition. Consistency across citations and schema helps Google trust your local presence faster.",
      },
    ],
    relatedSlugs: ["restaurant-seo-audit", "dentist-seo-audit", "law-firm-seo-audit", "real-estate-seo-audit"],
  },
  {
    slug: "ecommerce-seo-audit",
    title: "E‑commerce SEO Audit",
    metaTitle: "E‑commerce SEO Audit — Free Store Analysis | RankyPulse",
    metaDescription:
      "Free e‑commerce SEO audit for online stores. Fix duplicate content, product schema, and technical issues. Improve product visibility.",
    intro:
      "E‑commerce sites face product cannibalization, thin content, and crawl budget waste. A focused audit identifies the highest-impact fixes for category and product page visibility.",
    bullets: [
      "Map duplicate content across filters, sorts, and URL variations",
      "Audit product schema, meta, and internal linking for search visibility",
      "Identify crawl waste, orphan pages, and indexability blockers",
    ],
    faqs: [
      {
        q: "What platforms does this work with?",
        a: "We audit any e‑commerce site—Shopify, WooCommerce, Magento, BigCommerce, custom—from the outside. Same insights apply across platforms.",
      },
    ],
    relatedSlugs: ["shopify-seo-audit", "technical-seo-audit", "on-page-seo-audit"],
  },
  {
    slug: "technical-seo-audit",
    title: "Technical SEO Audit",
    metaTitle: "Technical SEO Audit — Free Site Health Check | RankyPulse",
    metaDescription:
      "Free technical SEO audit. Find crawl errors, indexation issues, redirect chains, schema problems, and Core Web Vitals failures. Actionable fixes with copy-paste code in under 30 seconds.",
    intro:
      "Technical SEO is the foundation of any successful search strategy. While content and backlinks get the spotlight, technical issues silently sabotage rankings every day. Crawl errors prevent Google from discovering your pages. Redirect chains bleed link equity. Poor canonical configuration splits ranking power across duplicate URLs. Broken schema markup means you miss rich results. Core Web Vitals failures push you below faster competitors.",
    whatIsSection:
      "A technical SEO audit is the systematic process of evaluating every technical aspect of your website to ensure search engines can crawl, index, render, and rank your content effectively. Unlike on-page or content audits, technical audits examine the infrastructure: server configuration, site architecture, URL structure, crawl budget allocation, JavaScript rendering, mobile-friendliness, page speed, and structured data implementation. RankyPulse checks over 50 technical signals and ranks every issue by its estimated traffic impact — so you always know what to fix first. Instead of a 50-row spreadsheet, you get prioritized fixes with AI-generated instructions and copy-paste code snippets tailored to your CMS.",
    bullets: [
      "Detect indexability issues: noindex tags, robots.txt blocks, and sitemap gaps that hide your content from Google",
      "Surface redirect chains, 404 errors, broken internal links, and canonical conflicts that waste link equity",
      "Validate structured data (JSON-LD) for syntax errors, missing required fields, and rich result eligibility",
      "Evaluate Core Web Vitals — LCP, CLS, and INP — against Google's Page Experience thresholds",
      "Audit mobile usability: viewport configuration, tap target sizes, and responsive rendering issues",
      "Identify crawl budget waste from thin pages, paginated URLs, and excessive URL parameters",
      "Check HTTPS implementation: mixed content warnings, certificate validity, and HSTS header configuration",
      "Review internal linking architecture for orphan pages and excessive crawl depth (> 3 clicks from home)",
      "Validate XML sitemap accuracy, correct status codes, and submission in Google Search Console",
      "Detect hreflang conflicts and missing return tags for international or multilingual sites",
    ],
    howItWorks: [
      {
        step: "Enter your URL",
        desc: "Paste any website URL. No signup required for your first free audit.",
      },
      {
        step: "We crawl like Google",
        desc: "RankyPulse simulates Googlebot — checking headers, rendering JavaScript, and following links across your site.",
      },
      {
        step: "Get your health score",
        desc: "Receive an overall technical health score (0–100) broken down by category: crawl, speed, schema, and mobile.",
      },
      {
        step: "Review issues by impact",
        desc: "Every issue is ranked by estimated traffic impact so you fix the most important problems first.",
      },
      {
        step: "Apply AI-generated fixes",
        desc: "Each issue comes with plain-English instructions and copy-paste code snippets ready for your CMS or developer.",
      },
    ],
    checklist: [
      {
        category: "Crawl & Indexation",
        items: [
          "robots.txt is accessible and not blocking key pages",
          "XML sitemap is present, valid, and submitted to GSC",
          "No key pages blocked by noindex or meta robots",
          "Canonical tags are self-referential or point to preferred versions",
          "Site architecture keeps important pages within 3 clicks of homepage",
          "No orphan pages (pages with zero internal links pointing to them)",
          "Crawl budget not wasted on pagination, parameters, or thin pages",
        ],
      },
      {
        category: "Redirects & URL Structure",
        items: [
          "No redirect chains longer than 1 hop",
          "All 301 redirects point to the final destination directly",
          "No soft 404s returning 200 status for missing content",
          "HTTP redirects to HTTPS on all pages and assets",
          "Trailing slash usage is consistent across the site",
          "URL parameters handled via canonical or robots noindex",
          "No redirect loops detected",
        ],
      },
      {
        category: "Page Speed & Core Web Vitals",
        items: [
          "LCP (Largest Contentful Paint) under 2.5 seconds",
          "CLS (Cumulative Layout Shift) score below 0.1",
          "INP (Interaction to Next Paint) under 200ms",
          "TTFB (Time to First Byte) under 600ms",
          "Images optimized with WebP/AVIF and correct dimensions",
          "Render-blocking JavaScript deferred or asynchronous",
          "CSS delivery optimized and unused CSS removed",
        ],
      },
      {
        category: "Structured Data & Schema",
        items: [
          "JSON-LD is valid and passes Google Rich Results Test",
          "Schema type matches the page content (Article, Product, FAQ, etc.)",
          "All required properties are present and non-empty",
          "No conflicting or duplicate schema blocks on the same page",
          "FAQ schema matches visible on-page questions and answers",
          "BreadcrumbList schema matches actual navigation path",
        ],
      },
      {
        category: "Mobile & Security",
        items: [
          "Viewport meta tag is present on every page",
          "No horizontal scrolling on mobile viewports",
          "Tap targets (buttons, links) are at least 48×48px",
          "HTTPS/SSL certificate is valid and not expiring within 30 days",
          "No mixed content (HTTP assets on HTTPS pages)",
          "HSTS header is present and configured correctly",
        ],
      },
    ],
    faqs: [
      {
        q: "How is a technical SEO audit different from a general SEO audit?",
        a: "A technical SEO audit focuses specifically on crawlability, indexability, site architecture, page speed, mobile usability, and structured data — the infrastructure layer of SEO. A general SEO audit also covers on-page factors (meta tags, headings, content quality) and off-page factors (backlinks, authority). Technical issues are typically the most urgent because they can block Google from seeing your content entirely, regardless of how good that content is.",
      },
      {
        q: "How often should I run a technical SEO audit?",
        a: "We recommend running a full technical audit quarterly as a baseline. You should also run one immediately after: major site migrations or redesigns, switching CMS platforms, adding new URL structures or subdomains, noticing an unexplained drop in organic traffic, or deploying significant JavaScript framework changes. RankyPulse makes it easy to run on-demand audits in under 30 seconds, so there's no reason to wait.",
      },
      {
        q: "What are the most common technical SEO issues found in audits?",
        a: "The most frequently detected issues are: missing or misconfigured canonical tags (which create duplicate content), redirect chains with more than one hop (which bleed link equity), pages blocked by robots.txt or noindex that shouldn't be, slow LCP caused by unoptimized hero images, missing or invalid structured data that prevents rich results, broken internal links from old redirects or deleted pages, and XML sitemaps containing redirected or non-indexable URLs. Most of these are fixable within a few hours once you know they exist.",
      },
      {
        q: "How does JavaScript affect technical SEO and rendering?",
        a: "JavaScript-rendered content is harder for Google to index than server-rendered HTML. Googlebot crawls pages in two waves: a fast first pass that reads raw HTML, and a slower second pass that executes JavaScript (sometimes days or weeks later). If key content — navigation, links, product data — is only visible after JS executes, it may be indexed late or missed entirely. RankyPulse checks both the raw HTML and the rendered DOM to surface rendering gaps that could hurt your visibility.",
      },
      {
        q: "What is crawl budget and why does it matter?",
        a: "Crawl budget is the number of pages Googlebot will crawl on your site within a given time period. Larger sites with millions of pages or sites that serve many redirects, parameter URLs, and thin pages can exhaust their crawl budget before Google reaches important content. Signs of crawl budget problems include new pages taking weeks to appear in search, important pages dropping from the index, and Google Search Console showing a high number of crawled-but-not-indexed pages. RankyPulse identifies the pages that are wasting your crawl budget.",
      },
      {
        q: "What is a canonical tag and when should I use it?",
        a: "A canonical tag (rel='canonical') tells search engines which version of a URL is the 'preferred' or original one. Use canonicals when: the same content is accessible at multiple URLs (e.g., with and without trailing slash, with UTM parameters, or via HTTP and HTTPS), when syndicating content that appears elsewhere, or when paginated URLs share overlapping content with the main page. Every page should have a self-referential canonical at minimum. Misconfigured canonicals — pointing to redirected pages, non-indexable URLs, or cross-domain incorrectly — are among the most damaging technical issues we find.",
      },
      {
        q: "What Core Web Vitals scores does Google consider 'good'?",
        a: "Google defines 'Good' thresholds as: LCP (Largest Contentful Paint) under 2.5 seconds, CLS (Cumulative Layout Shift) below 0.1, and INP (Interaction to Next Paint) under 200ms. Pages that meet all three thresholds pass the Page Experience signal. 'Needs Improvement' is LCP 2.5–4s, CLS 0.1–0.25, INP 200–500ms. 'Poor' is anything above those ranges. Google uses the 75th percentile of field data from real users (via Chrome User Experience Report), not just lab scores from Lighthouse.",
      },
      {
        q: "How do I fix redirect chains in my site?",
        a: "A redirect chain occurs when URL A redirects to URL B, which then redirects to URL C. Each hop delays Googlebot and dilutes PageRank. To fix them: identify chains using RankyPulse or a crawler, then update the original redirect to point directly to the final destination URL. Also update any internal links and XML sitemap entries that still reference intermediate URLs. If you've migrated your site multiple times, chains of 3–5 hops are common and fixing them can have a noticeable positive impact on crawl efficiency and rankings.",
      },
      {
        q: "Can RankyPulse fix technical SEO issues automatically?",
        a: "RankyPulse provides AI-generated fix instructions and copy-paste code for every issue detected — including meta tag fixes, schema JSON-LD snippets, .htaccess redirect rules, and robots.txt corrections. Some issues (like adding missing canonical tags) can be applied in one click via popular CMS plugins. For custom-coded sites, we provide the exact code your developer needs. We prioritize fixes by traffic impact so you always start with the changes that will move the needle most.",
      },
      {
        q: "How long does it take to see results after fixing technical SEO issues?",
        a: "Results depend on how quickly Google re-crawls your site. Critical fixes like removing noindex from important pages or fixing canonical tags can be reflected in rankings within days once Google re-crawls those URLs. Speed improvements via Core Web Vitals take 4–8 weeks to appear in Google's field data. Redirect chain fixes typically show crawl efficiency improvements within 2–4 weeks. You can request re-crawling of specific URLs in Google Search Console to speed up the process. In our experience, most sites see measurable ranking improvements within 4–8 weeks of completing a full technical audit.",
      },
    ],
    relatedSlugs: ["indexability-audit", "site-speed-seo-audit", "core-web-vitals-audit", "wordpress-seo-audit"],
  },
  {
    slug: "on-page-seo-audit",
    title: "On‑Page SEO Audit",
    metaTitle: "On‑Page SEO Audit — Free Meta & Content Check | RankyPulse",
    metaDescription:
      "Free on‑page SEO audit. Check titles, meta descriptions, headings, and content structure. Improve rankings per page.",
    intro:
      "On‑page SEO is what you control directly: titles, meta, headings, and content. Even strong sites have underoptimized pages. An on‑page audit finds quick wins across your site.",
    bullets: [
      "Audit meta titles and descriptions for length, uniqueness, and keyword placement",
      "Check heading hierarchy and content structure for clarity and intent",
      "Identify thin content, keyword cannibalization, and internal linking gaps",
    ],
    faqs: [
      {
        q: "What pages should I prioritize for on‑page fixes?",
        a: "Start with high-traffic pages and those close to ranking. RankyPulse ranks issues by impact so you can tackle the biggest wins first.",
      },
    ],
    relatedSlugs: ["technical-seo-audit", "blog-seo-audit", "wordpress-seo-audit"],
  },
  {
    slug: "saas-seo-audit",
    title: "SaaS SEO Audit",
    metaTitle: "SaaS SEO Audit — Free Product Marketing Check | RankyPulse",
    metaDescription:
      "Free SaaS SEO audit. Fix landing pages, docs, and blog SEO. Improve signup and trial conversions from search.",
    intro:
      "SaaS sites juggle product pages, docs, and blog content. A SaaS SEO audit ensures each asset is built for search: clear meta, schema, and structure that support conversion from organic traffic.",
    bullets: [
      "Optimize landing pages and feature pages for target keywords and conversion",
      "Audit docs and help center for discoverability and internal linking",
      "Check blog and content hub structure for topical authority and intent",
    ],
    faqs: [
      {
        q: "Does this cover documentation and help centers?",
        a: "Yes. We audit any public URL on your domain. Docs and help pages often drive long-tail traffic and support funnel depth.",
      },
    ],
    relatedSlugs: ["blog-seo-audit", "on-page-seo-audit", "technical-seo-audit"],
  },
  {
    slug: "agency-seo-audit",
    title: "Agency SEO Audit",
    metaTitle: "Agency SEO Audit — White-Label & Client Audits | RankyPulse",
    metaDescription:
      "SEO audit tool for agencies. Audit client sites, run white-label reports, and scale audits. Free to try.",
    intro:
      "Agencies need fast, repeatable audits for pitches and ongoing work. An agency-focused audit gives you a structured report, prioritized fixes, and insights you can turn into client deliverables.",
    bullets: [
      "Run audits at scale for multiple clients with consistent methodology",
      "Get exportable, presentable reports with clear next steps",
      "Track progress over time with before/after scores and fix completion",
    ],
    faqs: [
      {
        q: "Can I white-label audit reports for clients?",
        a: "RankyPulse provides white-label options for agencies. Contact us for plans that fit your client volume.",
      },
    ],
    relatedSlugs: ["technical-seo-audit", "seo-audit-checklist", "ecommerce-seo-audit"],
  },
  {
    slug: "real-estate-seo-audit",
    title: "Real Estate SEO Audit",
    metaTitle: "Real Estate SEO Audit — Agent & Broker Check | RankyPulse",
    metaDescription:
      "Free real estate SEO audit for agents and brokers. Fix listing pages, local schema, and site structure. Get more leads from search.",
    intro:
      "Real estate sites compete on listings, area pages, and local visibility. A real estate SEO audit checks listing schema, location pages, and NAP consistency so you show up when buyers search.",
    bullets: [
      "Audit listing pages for meta, schema, and image optimization",
      "Check area and neighborhood pages for local relevance and structure",
      "Verify LocalBusiness schema and NAP consistency across the site",
    ],
    faqs: [
      {
        q: "Does this work with IDX and MLS integrations?",
        a: "We audit the public-facing output. IDX/MLS content is part of that—meta, schema, and page structure apply regardless of source.",
      },
    ],
    relatedSlugs: ["local-seo-audit", "on-page-seo-audit", "technical-seo-audit"],
  },
  {
    slug: "restaurant-seo-audit",
    title: "Restaurant SEO Audit",
    metaTitle: "Restaurant SEO Audit — Local Visibility Check | RankyPulse",
    metaDescription:
      "Free restaurant SEO audit. Fix menu pages, local schema, and GBP signals. Get more reservations from search.",
    intro:
      "Restaurants need local pack visibility and clear menu/reservation signals. An audit checks menu schema, location pages, and technical basics that help you appear when diners search nearby.",
    bullets: [
      "Optimize menu pages with schema and clear meta for food-related searches",
      "Check LocalBusiness and Restaurant schema for rich results",
      "Verify NAP and hours consistency for local pack eligibility",
    ],
    faqs: [
      {
        q: "How do I improve my restaurant's local rankings?",
        a: "Fix NAP consistency, add proper schema, and ensure menu and location pages are unique and crawlable. Our audit surfaces specific gaps.",
      },
    ],
    relatedSlugs: ["local-seo-audit", "dentist-seo-audit", "on-page-seo-audit"],
  },
  {
    slug: "law-firm-seo-audit",
    title: "Law Firm SEO Audit",
    metaTitle: "Law Firm SEO Audit — Free Legal Marketing Check | RankyPulse",
    metaDescription:
      "Free law firm SEO audit. Fix practice area pages, local schema, and site structure. Get more client inquiries from search.",
    intro:
      "Law firms compete on practice areas, location, and authority. A law firm SEO audit ensures practice pages, attorney bios, and local signals are optimized for both rankings and conversions.",
    bullets: [
      "Audit practice area and service pages for intent alignment and meta",
      "Check LocalBusiness and Attorney schema for rich results",
      "Identify content gaps and internal linking opportunities across practice areas",
    ],
    faqs: [
      {
        q: "Is this suitable for multi-location firms?",
        a: "Yes. We surface location-specific pages, NAP consistency, and schema per office. Multi-location audits help avoid cannibalization.",
      },
    ],
    relatedSlugs: ["local-seo-audit", "real-estate-seo-audit", "dentist-seo-audit"],
  },
  {
    slug: "dentist-seo-audit",
    title: "Dentist SEO Audit",
    metaTitle: "Dentist SEO Audit — Free Dental Practice Check | RankyPulse",
    metaDescription:
      "Free dentist SEO audit. Fix service pages, local schema, and GBP. Get more new patients from local search.",
    intro:
      "Dental practices rely heavily on local search. A dentist SEO audit checks service pages, LocalBusiness schema, and NAP consistency so you show up when patients search for dentists nearby.",
    bullets: [
      "Optimize service pages (cleanings, implants, orthodontics) for local intent",
      "Verify LocalBusiness and MedicalBusiness schema for rich results",
      "Check NAP consistency and location page structure for local pack",
    ],
    faqs: [
      {
        q: "How does this work with Google Business Profile?",
        a: "Our audit focuses on your website. Strong on-site signals (NAP, schema, content) support GBP performance. Use both for full local visibility.",
      },
    ],
    relatedSlugs: ["local-seo-audit", "restaurant-seo-audit", "law-firm-seo-audit"],
  },
  {
    slug: "blog-seo-audit",
    title: "Blog SEO Audit",
    metaTitle: "Blog SEO Audit — Free Content & Structure Check | RankyPulse",
    metaDescription:
      "Free blog SEO audit. Check meta, internal links, and content structure. Improve traffic and rankings for your posts.",
    intro:
      "Blogs drive traffic when each post is optimized: strong meta, clear structure, and internal links that pass authority. A blog SEO audit finds underperforming posts and structural gaps.",
    bullets: [
      "Audit meta titles and descriptions across posts for uniqueness and intent",
      "Check internal linking and topic clusters for authority distribution",
      "Identify thin content, outdated posts, and cannibalization issues",
    ],
    faqs: [
      {
        q: "How many posts can I audit?",
        a: "RankyPulse crawls your site and surfaces issues across all indexable pages. For large blogs, we prioritize high-traffic and high-potential posts.",
      },
    ],
    relatedSlugs: ["on-page-seo-audit", "saas-seo-audit", "technical-seo-audit"],
  },
  {
    slug: "site-speed-seo-audit",
    title: "Site Speed SEO Audit",
    metaTitle: "Site Speed SEO Audit — Free Performance Check | RankyPulse",
    metaDescription:
      "Free site speed SEO audit. Find slow pages, heavy resources, and Core Web Vitals issues. Improve rankings and UX.",
    intro:
      "Speed is a ranking factor and a conversion driver. A site speed audit pinpoints what's slowing your pages: images, scripts, server response—and what to fix first for SEO and UX.",
    bullets: [
      "Identify slow pages and heavy resources (images, JS, fonts)",
      "Check LCP, FID, and CLS against Core Web Vitals thresholds",
      "Get prioritized fixes for the biggest impact with minimal effort",
    ],
    faqs: [
      {
        q: "What's the difference between a speed audit and Lighthouse?",
        a: "We focus on SEO impact and actionable fixes. Lighthouse gives raw scores; we interpret them and rank fixes by effort and impact.",
      },
    ],
    relatedSlugs: ["core-web-vitals-audit", "technical-seo-audit", "wordpress-seo-audit"],
  },
  {
    slug: "core-web-vitals-audit",
    title: "Core Web Vitals Audit",
    metaTitle: "Core Web Vitals Audit — LCP, FID & CLS Check | RankyPulse",
    metaDescription:
      "Free Core Web Vitals audit. Check LCP, FID, and CLS. Get actionable fixes to pass Page Experience and rankings.",
    intro:
      "Core Web Vitals affect rankings and user experience. LCP, FID, and CLS tell Google how fast and stable your site feels. An audit shows where you fail and how to fix it.",
    bullets: [
      "Measure LCP (Largest Contentful Paint) and identify blocking resources",
      "Audit FID/INP and CLS (Cumulative Layout Shift) for interactivity and stability",
      "Get page-by-page breakdowns with clear, prioritized remediation steps",
    ],
    faqs: [
      {
        q: "Do I need to pass all Core Web Vitals to rank?",
        a: "Passing helps. Google uses Page Experience as a factor. We show which issues matter most for your specific pages.",
      },
    ],
    relatedSlugs: ["site-speed-seo-audit", "technical-seo-audit", "wordpress-seo-audit"],
  },
  {
    slug: "backlink-audit",
    title: "Backlink Audit",
    metaTitle: "Backlink Audit — Free Link Profile Check | RankyPulse",
    metaDescription:
      "Free backlink audit. Identify toxic links, anchor text issues, and link profile gaps. Protect and strengthen your authority.",
    intro:
      "Backlinks build authority, but bad links can hurt. A backlink audit surfaces toxic or spammy links, over-optimized anchor text, and opportunities to strengthen your profile.",
    bullets: [
      "Identify potentially toxic or spammy links that may trigger penalties",
      "Audit anchor text distribution for over-optimization risk",
      "Map link velocity and source diversity for authority building",
    ],
    faqs: [
      {
        q: "Does RankyPulse crawl external links?",
        a: "Our primary audit focuses on your site. For full backlink analysis, we integrate with third-party data where available. Contact us for link audit options.",
      },
    ],
    relatedSlugs: ["technical-seo-audit", "indexability-audit", "seo-audit-checklist"],
  },
  {
    slug: "indexability-audit",
    title: "Indexability Audit",
    metaTitle: "Indexability Audit — Free Crawl & Index Check | RankyPulse",
    metaDescription:
      "Free indexability audit. Find blocked pages, thin content, and crawl waste. Ensure Google indexes your best content.",
    intro:
      "If Google can't or won't index your pages, rankings are impossible. An indexability audit finds noindex tags, robots blocks, thin content, and crawl budget waste.",
    bullets: [
      "Detect noindex, nofollow, and robots.txt blocks that prevent indexing",
      "Identify thin or duplicate content that may be devalued",
      "Map crawl depth and orphan pages that never get discovered",
    ],
    faqs: [
      {
        q: "What causes indexability issues?",
        a: "Common causes: accidental noindex, aggressive robots.txt, duplicate content, and thin pages. Our audit flags each and explains the fix.",
      },
    ],
    relatedSlugs: ["technical-seo-audit", "seo-audit-checklist", "ecommerce-seo-audit"],
  },
  {
    slug: "seo-audit-checklist",
    title: "SEO Audit Checklist",
    metaTitle: "SEO Audit Checklist — Free Step-by-Step Guide | RankyPulse",
    metaDescription:
      "Free SEO audit checklist. Technical, on-page, and content checks. Run a complete audit in minutes with RankyPulse.",
    intro:
      "A comprehensive SEO audit covers technical, on-page, and content factors. Our checklist guides you through each area so nothing gets missed—and RankyPulse runs the checks automatically.",
    bullets: [
      "Technical: crawl, indexability, redirects, schema, Core Web Vitals",
      "On-page: meta, headings, internal links, and content structure",
      "Content: thin pages, cannibalization, and topical coverage gaps",
    ],
    faqs: [
      {
        q: "How long does a full SEO audit take?",
        a: "RankyPulse runs in under 30 seconds. Acting on the results depends on your site size and issues. We prioritize so you can tackle high-impact items first.",
      },
      {
        q: "Is this suitable for beginners?",
        a: "Yes. We explain each issue in plain language and suggest fixes. No SEO jargon required.",
      },
    ],
    relatedSlugs: ["technical-seo-audit", "on-page-seo-audit", "indexability-audit", "agency-seo-audit"],
  },
];

export function getAuditLanding(slug: string): AuditLanding | null {
  return AUDIT_PAGES.find((p) => p.slug === slug) ?? null;
}

export function getAllAuditLandings(): AuditLanding[] {
  return AUDIT_PAGES;
}
