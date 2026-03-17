/**
 * Static SEO insights for the 30 seed report domains.
 * Each entry powers the server-rendered case study sections on /report/[domain].
 * These sections make pages rank-worthy by turning raw audit data into interpreted insights.
 */

export interface DomainInsight {
  category: string;       // type of site
  verdict: string;        // 2–3 sentence SEO summary
  topIssues: string[];    // 3–4 common issues on sites like this
  fixes: string[];        // matching actionable fixes
  lessons: string[];      // what SEO pros can learn from this site
}

const insights: Record<string, DomainInsight> = {
  "shopify.com": {
    category: "E-commerce Platform",
    verdict: "Shopify is one of the most SEO-mature platforms on the web — their technical foundation is strong, with clean canonicals, fast CDN delivery, and structured data across product pages. However, at their scale, even small issues (duplicate category pages, thin collection descriptions, JS-heavy storefronts) compound across millions of URLs.",
    topIssues: [
      "Duplicate content from faceted navigation (colour/size filter variants generating unique URLs)",
      "Thin content on collection pages — often just a product grid with no descriptive copy",
      "JavaScript-dependent product descriptions that slow Googlebot rendering",
      "Canonical conflicts between www and non-www versions at scale",
    ],
    fixes: [
      "Use rel=canonical on all filter/sort parameter URLs to consolidate PageRank to the base collection page",
      "Add 150–300 words of descriptive copy to every collection page targeting its primary keyword",
      "Enable server-side rendering for product descriptions so Googlebot doesn't need to execute JS",
      "Enforce a single canonical protocol (https://shopify.com) site-wide via 301 redirects",
    ],
    lessons: [
      "At scale, canonical strategy matters more than on-page copy — one misconfigured template duplicates across thousands of pages",
      "Collection page copy is the most under-leveraged SEO asset in e-commerce",
      "CDN + edge caching is table stakes — if your store is slow, this is the first thing to fix",
    ],
  },

  "wordpress.com": {
    category: "CMS / Blogging Platform",
    verdict: "WordPress.com hosts millions of sites with highly variable SEO quality. The platform itself is technically sound — sitemaps are auto-generated, SSL is standard, and mobile responsiveness is built in. The SEO gaps are almost always at the content layer: thin posts, missing meta descriptions, and no internal linking strategy.",
    topIssues: [
      "Auto-generated category and tag archive pages creating thin duplicate content",
      "Default post titles that don't target any specific keyword",
      "Missing or auto-generated meta descriptions on most posts",
      "No structured internal linking — posts exist as isolated islands",
    ],
    fixes: [
      "Noindex category and tag archives unless they have meaningful unique content",
      "Rewrite post titles to front-load the primary keyword within 60 characters",
      "Write custom meta descriptions for every post using the outcome-first formula",
      "Add 3–5 contextual internal links per new post to related existing content",
    ],
    lessons: [
      "The biggest SEO lever on a blog is internal linking — it's free and has compounding returns",
      "Category archives without content are duplicate content traps — noindex them or add copy",
      "A consistent title tag formula across all posts is worth more than individual optimization",
    ],
  },

  "wix.com": {
    category: "Website Builder",
    verdict: "Wix has improved its SEO capabilities significantly — it now generates sitemaps, supports canonical tags, and has resolved most of its historical JavaScript rendering issues. The remaining SEO challenges are platform-level: limited control over URL structure, auto-generated page names, and restricted structured data implementation.",
    topIssues: [
      "URL slugs that default to auto-generated strings instead of keyword-rich paths",
      "Limited control over header tag hierarchy (H1/H2/H3 structure)",
      "Page speed issues from bundled Wix editor JavaScript loaded on every page",
      "No native support for advanced schema types (FAQPage, HowTo, Product reviews)",
    ],
    fixes: [
      "Manually rename every URL slug in the Wix SEO settings to match your target keyword",
      "Use only one H1 per page and build a logical H2/H3 hierarchy in the editor",
      "Defer or remove unused Wix app scripts that load on pages where they aren't needed",
      "Use JSON-LD injection workarounds for advanced schema types where Wix doesn't natively support them",
    ],
    lessons: [
      "URL structure is the first thing to fix on any Wix site — keyword-rich slugs have immediate impact",
      "Platform constraints are real but workable — know the ceiling before investing heavily",
      "Page speed on Wix is largely outside your control; content quality is where to compete instead",
    ],
  },

  "squarespace.com": {
    category: "Website Builder",
    verdict: "Squarespace generates clean HTML with good mobile performance and automatic SSL. Its SEO limitations are structural: rigid URL patterns, limited control over title tag templates, and no native JSON-LD support for rich results. Sites built on Squarespace typically score well on technical basics but underperform on content depth and schema.",
    topIssues: [
      "Title tags default to 'Page Title | Site Name' template with limited customization",
      "No native support for JSON-LD structured data without code injection workarounds",
      "Blog post URLs that include /blog/ prefix, creating deeper hierarchy than needed",
      "Image SEO gaps — alt text fields exist but are often left blank by default",
    ],
    fixes: [
      "Customize every page title in Squarespace SEO settings to match the keyword-first template",
      "Inject JSON-LD schema via Settings → Advanced → Code Injection for Organization and Article schema",
      "Fill alt text on every image — Squarespace crawl reports consistently show this as the top gap",
      "Use the Connected Accounts feature to signal authorship and brand presence to Google",
    ],
    lessons: [
      "Code injection is the key to unlocking advanced SEO on Squarespace — learn it once, use it everywhere",
      "Image alt text is consistently the highest-volume fixable issue on Squarespace sites",
      "For competitive keywords, Squarespace's content limitations mean you must outcompete on content depth",
    ],
  },

  "webflow.com": {
    category: "Visual Web Development Platform",
    verdict: "Webflow is arguably the most SEO-friendly visual builder — it generates clean semantic HTML, allows full control over meta tags and URL slugs, supports custom code injection for schema, and produces fast-loading pages with proper heading hierarchies. SEO gaps on Webflow sites are almost always content or strategy issues, not technical ones.",
    topIssues: [
      "CMS collection pages with thin template content repeated across hundreds of items",
      "Designer-built pages where H1 elements are styled as decorative elements, not semantic headings",
      "Missing canonical tags on filtered or sorted CMS collection views",
      "Rich results eligibility wasted — Webflow supports JSON-LD but few teams implement it",
    ],
    fixes: [
      "Add unique descriptive copy fields to every CMS collection item — don't rely on shared template text",
      "Audit heading hierarchy using browser DevTools — ensure each page has exactly one H1",
      "Add canonical tags to all CMS collection pages with filter/sort parameters",
      "Implement JSON-LD for Article, Organization, and FAQPage schema via custom embed components",
    ],
    lessons: [
      "Webflow removes the technical ceiling — the only limit is content quality and strategy",
      "CMS collections are a programmatic SEO opportunity — treat each item as a standalone page to optimize",
      "Webflow + proper schema = rich results without developer involvement",
    ],
  },

  "github.com": {
    category: "Developer Platform / Code Repository",
    verdict: "GitHub's SEO profile is unique: billions of indexed pages (repos, files, issues, profiles) with extremely high authority, but the vast majority of content is technical and non-commercial. Their SEO challenge is topical relevance and content canonicalization at a scale most teams will never encounter.",
    topIssues: [
      "Duplicate content across forks — identical codebases indexed at thousands of different URLs",
      "Thin README-only repositories with minimal descriptive content",
      "Tag and release pages with near-identical content to branch pages",
      "User and organization pages with minimal descriptive copy",
    ],
    fixes: [
      "Write detailed README files with keyword-rich descriptions for any public repository you want discovered",
      "Fill in repository description and topic tags — these appear in GitHub's own search and Google alike",
      "Add a project homepage URL to repository settings to create a link between your repo and your site",
      "For organizations, complete the profile with a full description, website link, and location",
    ],
    lessons: [
      "GitHub README files rank in Google — treat them as landing pages for developer tools",
      "Repository topics are like meta keywords that actually work — use all 20",
      "A well-documented public repo is a free backlink and brand authority signal",
    ],
  },

  "medium.com": {
    category: "Publishing Platform / Blog",
    verdict: "Medium's domain authority is high, which historically gave articles quick indexing and early ranking boosts. However, Google has de-emphasized Medium content over the years due to duplicate publishing (articles mirrored from personal blogs), thin content at scale, and paywalled pages that Googlebot can't fully access.",
    topIssues: [
      "Canonical tag conflicts when content is cross-posted from personal blogs to Medium",
      "Paywall content that Googlebot crawls but users can't fully read — soft 404 risk",
      "Tag and publication archive pages with thin auto-generated content",
      "Author pages with no descriptive bio or expertise signals",
    ],
    fixes: [
      "Always set canonical on Medium posts to point to your original blog if cross-posting",
      "Keep your best long-form content on your own domain — use Medium for distribution only",
      "Write a complete author bio that establishes topical authority and expertise (E-E-A-T signals)",
      "Use Medium's import feature with canonical set — this preserves SEO credit on your own domain",
    ],
    lessons: [
      "Platform authority is borrowed — own your canonical source and use Medium for reach",
      "Cross-posting without canonical is a self-inflicted duplicate content problem",
      "E-E-A-T signals (author credentials, expertise signals) matter more on publishing platforms",
    ],
  },

  "substack.com": {
    category: "Newsletter / Publishing Platform",
    verdict: "Substack generates clean, readable HTML with good performance characteristics. Its SEO weakness is structural: limited control over meta tags, no custom schema support, restricted URL structures, and the assumption that content is for subscribers rather than organic search discovery.",
    topIssues: [
      "Title tags auto-generated from post titles without keyword optimization",
      "No meta description control — Google generates its own from post content",
      "Subscriber-only posts visible to Googlebot but inaccessible to users — soft 404 risk",
      "No sitemap customization — all posts included regardless of SEO value",
    ],
    fixes: [
      "For SEO-targeted posts, write titles that follow the keyword-first formula (not just your newsletter's creative style)",
      "Write the first 150 characters of each post as a de facto meta description — it's what Google will use",
      "Publish key content as free posts to ensure Googlebot and users see identical content",
      "Consider migrating high-value content to your own domain for full SEO control",
    ],
    lessons: [
      "Substack is optimized for audience retention, not organic search — know the trade-off before committing",
      "The first sentence of every post is your meta description — write it accordingly",
      "Free posts on Substack can rank — paywalled posts cannot be indexed meaningfully",
    ],
  },

  "notion.so": {
    category: "Productivity / Knowledge Base Platform",
    verdict: "Public Notion pages can rank in Google, but the platform's SEO capabilities are extremely limited. Pages have no custom meta tags, no canonical control, minimal structured data, and JavaScript-heavy rendering. Companies using Notion as a public knowledge base or help center are trading SEO control for convenience.",
    topIssues: [
      "JavaScript-rendered content that delays Googlebot indexing by hours or days",
      "No custom title tags or meta descriptions — Google generates both from page content",
      "Deep URL structures with UUID-based paths that are not keyword-friendly",
      "Duplicate content when pages are shared via multiple workspace URLs",
    ],
    fixes: [
      "For any content where organic search matters, migrate to a dedicated CMS or static site",
      "Add a clear, keyword-rich heading as the very first element on every public Notion page",
      "Use Notion's custom domain feature with a subdomain (docs.yoursite.com) for brand authority",
      "Interlink public Notion pages from your main site to pass PageRank to the content you want ranked",
    ],
    lessons: [
      "Notion is not an SEO tool — public pages can rank but with severe limitations",
      "If you're using Notion for public documentation, a dedicated docs platform will outrank you",
      "Any content that drives business value needs to be on a domain you control",
    ],
  },

  "hubspot.com": {
    category: "Marketing / CRM Platform",
    verdict: "HubSpot's own website is a benchmark for content-driven SEO at scale. They pioneered the pillar-cluster content model, produce high-quality long-form content consistently, and have built exceptional domain authority through years of link acquisition. Their technical SEO is enterprise-grade.",
    topIssues: [
      "At scale, outdated blog posts accumulate — thin or historically accurate but now stale content",
      "Topic cluster pages occasionally have competing internal pages targeting the same keyword",
      "Free tool landing pages with thin descriptive copy (the tool itself is the content, but Google needs text)",
      "Localized content across multiple ccTLDs creating hreflang complexity",
    ],
    fixes: [
      "Regularly audit and update posts older than 2 years — 'content decay' is real and measurable",
      "Use a keyword map to ensure only one page targets each primary keyword",
      "Add 300+ words of descriptive copy to every free tool landing page explaining what the tool does",
      "Implement hreflang correctly — even one missing reciprocal tag invalidates the entire cluster",
    ],
    lessons: [
      "The pillar-cluster model works — one authoritative page per topic, supported by related subtopic posts",
      "Content freshness matters — Google rewards updated dates and new information",
      "Free tools are the best lead magnets for SEO — they attract links naturally",
    ],
  },

  "mailchimp.com": {
    category: "Email Marketing Platform",
    verdict: "Mailchimp has strong domain authority built over 20+ years and invests heavily in content marketing. Their SEO approach focuses on educational content targeting small business owners and marketers. Technical SEO is sound; their ongoing challenge is content maintenance at scale and competing against newer, more agile competitors.",
    topIssues: [
      "Legacy help documentation pages with thin content and outdated screenshots",
      "Product feature pages with minimal descriptive copy compared to competitor landing pages",
      "Blog content that covers topics broadly but lacks the depth needed for competitive queries",
      "Missing FAQ schema on help center pages that could capture People Also Ask placements",
    ],
    fixes: [
      "Audit help documentation annually — delete or consolidate thin/outdated articles",
      "Expand feature landing pages with use-case examples, comparison tables, and customer outcomes",
      "Add FAQPage schema to help center articles to capture rich result placements",
      "Target 'vs' and 'alternative' keywords where Mailchimp's brand authority provides an edge",
    ],
    lessons: [
      "Brand authority gives you ranking potential — but you still need content depth to activate it",
      "Help center content is undervalued SEO real estate — it ranks for high-intent queries",
      "FAQ schema on support pages is a quick win for platforms with large help centers",
    ],
  },

  "buffer.com": {
    category: "Social Media Management Tool",
    verdict: "Buffer has historically invested in content marketing with a transparent blog that covers marketing, culture, and social media strategy. Their SEO is content-forward with strong editorial quality. Technical gaps tend to be at the product marketing layer — feature pages that are visually polished but thin on text.",
    topIssues: [
      "Product pages optimized for design over text — limited crawlable content for Google",
      "Feature comparison pages missing keyword-targeted copy",
      "Older blog content not updated as social platform features change",
      "Pricing page with minimal SEO copy targeting high-intent 'buffer pricing' queries",
    ],
    fixes: [
      "Add 200–400 words of descriptive text to every product feature page below the visual elements",
      "Create dedicated comparison landing pages (Buffer vs Hootsuite, Buffer vs Sprout Social)",
      "Update high-traffic blog posts when the underlying social platforms make major changes",
      "Add FAQ schema to the pricing page targeting common pricing/plan questions",
    ],
    lessons: [
      "'Buffer vs competitor' pages are among the highest-converting SEO pages a SaaS can create",
      "Design-forward pages often sacrifice SEO — balance visual appeal with crawlable text",
      "Transparent company blogs build trust signals that correlate with E-E-A-T",
    ],
  },

  "hootsuite.com": {
    category: "Social Media Management Platform",
    verdict: "Hootsuite is a content marketing heavyweight with thousands of indexed pages, strong domain authority, and a mature SEO program. They excel at capturing educational and comparison queries. Like most enterprise SaaS sites, their challenge is scale management — keeping thousands of pages fresh and avoiding keyword cannibalization.",
    topIssues: [
      "Keyword cannibalization across multiple blog posts and landing pages targeting similar queries",
      "Enterprise-focused copy that overlooks the SMB segment searching for the same tool",
      "Resource library pages with thin descriptions — just titles, no excerpt content",
      "Localized pages that are thin translations of English content without local adaptation",
    ],
    fixes: [
      "Run a keyword map audit — consolidate pages targeting the same query via 301 redirects or canonical tags",
      "Create separate landing pages for different customer segments (enterprise vs. small business)",
      "Add descriptive excerpts and category descriptions to all resource library archive pages",
      "Localized pages need locally-relevant examples and data, not just translated English copy",
    ],
    lessons: [
      "At scale, keyword cannibalization is inevitable without a content map — maintain one from day one",
      "Segment-specific landing pages significantly outperform generic ones for conversion and ranking",
      "International SEO requires local adaptation, not just translation",
    ],
  },

  "canva.com": {
    category: "Design / Creative Platform",
    verdict: "Canva is one of the most impressive SEO operations in SaaS. Their programmatic template pages — 'free [design type] templates' — capture millions of transactional searches. They combine strong technical SEO with massive content scale. The result is Canva ranking for almost every design-related keyword globally.",
    topIssues: [
      "Programmatic template pages with near-duplicate thin content at scale",
      "Template category pages competing with each other for the same broad keyword",
      "User-generated content pages with variable quality that Google must evaluate individually",
      "Help center articles thin on practical examples and screenshots",
    ],
    fixes: [
      "Differentiate category pages with unique introductory copy, use-case descriptions, and curated featured templates",
      "Implement clear canonical strategy on template variants to prevent internal competition",
      "Add structured data (HowTo schema) to tutorial and help content",
      "Enrich user-generated content pages with platform-curated summaries and related template suggestions",
    ],
    lessons: [
      "Programmatic SEO at scale requires canonical strategy more than any other technical element",
      "Template-based sites succeed by ranking for '[specific use case] template' long-tail queries, not just '[category] template'",
      "User-generated content is SEO leverage — curate, don't just host",
    ],
  },

  "figma.com": {
    category: "Design Tool / Collaboration Platform",
    verdict: "Figma's SEO is strong but product-led rather than content-led. Their community pages (shared design files) generate enormous indexed content, and their blog and case studies are high quality. The SEO opportunity they're less aggressive on is educational content — 'how to design X' queries that competitors capture.",
    topIssues: [
      "Community file pages with thin auto-generated meta content",
      "Plugin directory pages with minimal descriptive content beyond the plugin name",
      "Missing structured data on tutorial and how-to content",
      "Feature pages that describe functionality without targeting how-to search queries",
    ],
    fixes: [
      "Add descriptive summaries and tags to community file pages to improve crawl quality",
      "Expand plugin directory listings with use-case descriptions and workflow examples",
      "Implement HowTo schema on tutorial content to capture rich results",
      "Create dedicated how-to landing pages for high-volume Figma workflow queries",
    ],
    lessons: [
      "Community-generated content (plugins, templates, files) is SEO leverage — enrich it, don't just index it",
      "How-to content outperforms feature content in organic search — users search for tasks, not features",
      "Product-led growth and SEO reinforce each other when community content is properly optimized",
    ],
  },

  "stripe.com": {
    category: "Payments Infrastructure",
    verdict: "Stripe's documentation is world-class from a developer SEO perspective — exhaustively detailed, well-structured, and technically accurate. Their marketing pages are polished but lean on the copy side. The brand's authority means they rank for almost anything payment-related, but smaller competitors outrank them on content depth for specific how-to queries.",
    topIssues: [
      "Marketing/product pages optimized for design with limited crawlable text",
      "Documentation so comprehensive it risks keyword cannibalization at scale",
      "Blog posts that are brand-focused rather than search-intent optimized",
      "Country/regional pages that are thin templates without local payment context",
    ],
    fixes: [
      "Add use-case narrative copy to product pages — explain the scenario, not just the feature",
      "Implement canonical strategy across overlapping documentation articles",
      "Create search-targeted developer guides ('how to implement X with Stripe API')",
      "Expand regional pages with local payment methods, regulations, and use cases",
    ],
    lessons: [
      "Developer documentation that solves real problems attracts the most valuable backlinks",
      "Design-first companies often have thin text content — a huge SEO opportunity gap",
      "Regional payment pages with genuine local depth rank against global competitors",
    ],
  },

  "vercel.com": {
    category: "Cloud / Deployment Platform",
    verdict: "Vercel's own site demonstrates excellent technical SEO — fast edge network delivery, clean HTML, strong Core Web Vitals, and well-structured documentation. Their content strategy targets developer queries effectively. As a Next.js creator, their site is also a live showcase of Next.js SEO best practices.",
    topIssues: [
      "Documentation pages occasionally thin for very specific configuration queries",
      "Framework guide pages compete with official framework documentation",
      "Customer showcase pages lack SEO copy beyond project name and URL",
      "Changelog entries thin on context — helpful for existing users, not for search discovery",
    ],
    fixes: [
      "Add step-by-step how-to content to configuration documentation for common developer tasks",
      "Expand customer showcase pages with use-case summaries and technology stack descriptions",
      "Create dedicated landing pages for common deployment scenarios ('deploy Next.js', 'deploy React app')",
      "Enrich changelogs with 'why this matters' context paragraphs for major feature releases",
    ],
    lessons: [
      "Developer tools SEO is won by solving specific problems in documentation, not by brand content",
      "Customer showcase pages with rich descriptions are backlink magnets — featured companies share them",
      "Performance IS content — fast pages rank better and that's table stakes for a deployment platform",
    ],
  },

  "netlify.com": {
    category: "Cloud / Deployment Platform",
    verdict: "Netlify has strong developer brand recognition and solid SEO fundamentals. Their content targets Jamstack, static site generation, and frontend development queries effectively. Like most developer platforms, their ongoing challenge is keeping documentation fresh as their platform evolves.",
    topIssues: [
      "Legacy documentation for deprecated features consuming crawl budget",
      "Feature pages with minimal copy for newer product additions",
      "Blog content heavy on announcements, lighter on SEO-targeted educational content",
      "Missing schema on tutorial and documentation content",
    ],
    fixes: [
      "Noindex or consolidate documentation for deprecated/legacy features",
      "Add educational context to feature announcement pages — not just 'here's what it does' but 'here's when to use it'",
      "Shift content mix toward educational how-to content targeting developer workflow queries",
      "Implement Article and HowTo schema across documentation and tutorials",
    ],
    lessons: [
      "Product announcement posts have short SEO lifespans — educational content compounds indefinitely",
      "Deprecated documentation consumes crawl budget — clean it up quarterly",
      "Developer platforms succeed in SEO by solving workflow problems, not announcing features",
    ],
  },

  "digitalocean.com": {
    category: "Cloud Infrastructure",
    verdict: "DigitalOcean's community tutorials are legendary in developer SEO — exhaustively detailed, accurate, and consistently updated. They are one of the best examples of content-as-SEO-strategy in tech. Their marketing site is solid; their tutorials are the real traffic engine.",
    topIssues: [
      "Tutorial content occasionally outdated for rapidly-evolving technologies",
      "Product pages more focused on pricing than on use-case depth",
      "Some tutorial pages lack internal links to related tutorials and product pages",
      "Q&A community content with variable quality affecting overall domain content quality",
    ],
    fixes: [
      "Implement a systematic review cycle for tutorials covering technologies that release major versions",
      "Add use-case scenario copy to product pages in addition to feature lists",
      "Improve internal linking between tutorials and the relevant product/pricing pages",
      "Add quality signals to community Q&A (verified answers, expert badges) to improve Google's content quality assessment",
    ],
    lessons: [
      "Long-form technical tutorials are the highest-ROI SEO content format for developer tools",
      "Content freshness for technical tutorials is non-negotiable — outdated tutorials rank until they're wrong enough to get flagged",
      "Community content scales SEO but requires quality curation to avoid diluting domain quality signals",
    ],
  },

  "cloudflare.com": {
    category: "CDN / Security / DNS Platform",
    verdict: "Cloudflare operates one of the most technically excellent websites on the internet, which is fitting given their product. Fast load times, clean HTML, strong Core Web Vitals, comprehensive documentation, and a blog that publishes authoritative Internet infrastructure content. Their SEO is mature and difficult to compete with directly.",
    topIssues: [
      "Developer documentation at massive scale — risk of outdated content across older protocol/API versions",
      "Blog covers broad topics — some posts are thin on actionable depth",
      "Product pages for newer offerings (Workers, Pages, R2) lighter on SEO copy than established products",
      "Support documentation with thin auto-generated article snippets",
    ],
    fixes: [
      "Version-tag documentation for older API/protocol versions rather than deleting — preserves historical rankings",
      "Expand Workers and R2 product pages with extensive use-case copy targeting developer workflow queries",
      "Add HowTo schema to all tutorial and guide content",
      "Improve support article first paragraphs — they're what Google uses as meta descriptions",
    ],
    lessons: [
      "Being the subject matter expert creates natural backlink acquisition — publish authoritative research",
      "CDN performance data and Internet reports are the most linkable content a infrastructure company can create",
      "Technical depth in documentation is a competitive moat that takes years to replicate",
    ],
  },

  "semrush.com": {
    category: "SEO / Digital Marketing Tool",
    verdict: "SEMrush is one of the largest SEO content operations on the web — thousands of blog posts, a comprehensive academy, and a tool database with millions of indexed queries. Their SEO is aggressive and sophisticated. They dominate mid-funnel 'how to do X SEO' queries through content volume and domain authority.",
    topIssues: [
      "Content at scale creates inevitable keyword cannibalization across similar topic areas",
      "Some older academy and blog content shows content decay — accurate when published, now outdated",
      "Tool landing pages can be verbose — users seeking quick answers may bounce, sending negative signals",
      "Aggressive internal linking sometimes feels unnatural to readers and crawlers alike",
    ],
    fixes: [
      "Regular content audits with a cannibalization focus — merge or redirect competing posts",
      "Annual refresh cycle for high-traffic educational content as SEO best practices evolve",
      "Add summary boxes and TL;DR sections to long content for higher dwell time",
      "Vary internal anchor text rather than repeating exact-match anchors across all posts",
    ],
    lessons: [
      "Volume + quality > quality alone at scale — but volume without quality maintenance creates technical debt",
      "Tool-specific landing pages that explain use cases outperform pure feature pages",
      "In competitive SEO niches, updating existing content beats creating new content on the same topic",
    ],
  },

  "ahrefs.com": {
    category: "SEO Tool",
    verdict: "Ahrefs runs one of the most respected SEO blogs in the industry with a strict quality-over-quantity approach. Every post is long-form, data-driven, and built around a specific target keyword. Their SEO is a masterclass in intentional content strategy — fewer posts than competitors, but consistently ranking in position 1–3 for competitive keywords.",
    topIssues: [
      "Fewer content pages means less long-tail keyword coverage compared to SEMrush or HubSpot",
      "Tool comparison pages occasionally outdated as competing tools add features",
      "Help documentation less comprehensive than the blog — gap for product-specific queries",
      "No programmatic SEO content — each page is manually crafted, limiting scale",
    ],
    fixes: [
      "Extend into programmatic SEO for keyword/topic comparison pages using Ahrefs' own data",
      "Quarterly review of comparison pages to reflect competitive landscape changes",
      "Expand help documentation to cover common advanced use cases that users search for",
      "Test lower-effort content formats (quick answers, definitions) for long-tail coverage",
    ],
    lessons: [
      "Quality over quantity works if you have domain authority and execution discipline",
      "Data-driven original research is the most link-worthy content in any industry",
      "Every piece of content should have a clearly defined target keyword before writing begins",
    ],
  },

  "moz.com": {
    category: "SEO Tool",
    verdict: "Moz pioneered modern SEO content marketing with Whiteboard Friday and the Beginner's Guide to SEO. Their brand authority remains strong, though content output has slowed compared to newer competitors. Their legacy content still drives significant traffic; the SEO challenge is freshness and maintaining leadership against faster-moving competitors.",
    topIssues: [
      "Legacy content published 2015–2019 that ranks but contains outdated best practices",
      "Whiteboard Friday videos with thin supporting text content on the page itself",
      "Tool pages that haven't been refreshed to reflect current feature set",
      "Some high-authority older posts lacking internal links to current Moz tools and resources",
    ],
    fixes: [
      "Systematic content refresh program for posts ranking in positions 5–20 with outdated information",
      "Add full transcripts and expanded written content to all Whiteboard Friday pages",
      "Rebuild tool comparison/feature pages with current 2026 feature parity",
      "Add contextual internal links from old high-authority posts to current product pages",
    ],
    lessons: [
      "Content decay is invisible until you measure it — run quarterly traffic decay audits",
      "Video content without accompanying text is SEO-incomplete — add transcripts and summaries",
      "Old high-authority pages passing internal links to current products is free PageRank reallocation",
    ],
  },

  "yoast.com": {
    category: "SEO Plugin / Education",
    verdict: "Yoast has built exceptional topical authority in the SEO plugin and WordPress SEO space. Their blog is comprehensive, their academy reaches millions of learners, and their brand is synonymous with WordPress SEO. Their SEO strength is educational content; their gap is coverage of non-WordPress SEO topics.",
    topIssues: [
      "Heavy WordPress-specific focus means missing traffic from non-WordPress SEO queries",
      "Academy content occasionally basic for experienced SEO practitioners",
      "Plugin documentation pages with thin content beyond installation instructions",
      "Limited coverage of technical SEO topics that don't directly involve their plugin",
    ],
    fixes: [
      "Expand content coverage to broader SEO topics beyond WordPress to capture wider audience",
      "Create advanced-level academy content for experienced practitioners, not just beginners",
      "Add use-case scenario copy to plugin documentation pages",
      "Publish original research content (studies, surveys) to attract non-WordPress SEO audiences",
    ],
    lessons: [
      "Topical authority in a narrow niche (WordPress SEO) is extremely defensible",
      "Educational content + tool = natural internal linking opportunity at massive scale",
      "Plugin documentation pages rank for '[plugin name] how to' queries — optimize them deliberately",
    ],
  },

  "sitebulb.com": {
    category: "SEO Audit Tool",
    verdict: "Sitebulb has built strong brand recognition in the technical SEO community through product quality and community engagement. Their content marketing is focused on audit methodology and technical SEO education — exactly the right targets for their audience. As a desktop tool, their SEO approach bridges tool-specific and general technical SEO queries.",
    topIssues: [
      "Limited content volume compared to larger SEO tool competitors",
      "Feature pages that describe what the tool does without explaining why it matters for rankings",
      "Missing comparison pages that capture 'sitebulb vs screaming frog' type searches",
      "Help documentation that's comprehensive but not optimized for how users search for help",
    ],
    fixes: [
      "Create dedicated comparison pages for high-volume competitor queries",
      "Add 'why this matters for SEO' sections to every feature page",
      "Optimize help documentation titles to match how users search (not feature names, but user problems)",
      "Increase content publishing cadence with a mix of quick-win posts and long-form guides",
    ],
    lessons: [
      "Comparison pages ('tool A vs tool B') are among the highest-converting SEO content for SaaS",
      "Technical SEO communities are tight-knit — community engagement drives natural link acquisition",
      "Feature pages that explain business outcomes outperform feature pages that explain functionality",
    ],
  },

  "seoptimer.com": {
    category: "SEO Audit Tool",
    verdict: "SEOptimer competes in the crowded free SEO audit tool space with a clean, focused product. Their SEO strategy relies heavily on the tool itself driving organic traffic — a programmatic report approach where audit results are indexed. This is the same strategy powering these RankyPulse report pages.",
    topIssues: [
      "Free tool report pages need server-rendered content to avoid Soft 404 issues with Googlebot",
      "Blog content volume lower than major competitors, limiting long-tail keyword coverage",
      "Feature pages generic — missing keyword-specific landing pages for common audit queries",
      "Missing structured data on tool and feature pages",
    ],
    fixes: [
      "Add server-rendered static content to all generated report pages (exactly what RankyPulse does)",
      "Create keyword-specific audit tool landing pages ('free meta description checker', 'free broken link checker')",
      "Increase blog publishing cadence targeting technical SEO how-to queries",
      "Implement SoftwareApplication schema on tool landing pages",
    ],
    lessons: [
      "Free tool report pages are valuable programmatic SEO only if they have crawlable static content",
      "Keyword-specific tool landing pages ('free X checker') outperform generic 'SEO audit tool' pages",
      "In the free tool space, content depth is the differentiator since the tools themselves are commoditized",
    ],
  },

  "woorank.com": {
    category: "SEO Audit & Monitoring Tool",
    verdict: "WooRank takes a website grader approach to SEO tooling with a clear, scorecard-style output. Their content strategy combines educational blog content with tool-driven programmatic pages. Like most tools in this space, the gap between product quality and SEO content quality represents their biggest growth opportunity.",
    topIssues: [
      "Programmatic audit pages with thin server-rendered content — Soft 404 risk",
      "Educational blog content less comprehensive than specialist competitors",
      "Feature comparison pages that list features without explaining use cases",
      "Missing schema markup on tool and report pages",
    ],
    fixes: [
      "Add meaningful server-rendered static content to every report page URL",
      "Create in-depth guides for each audit metric the tool measures",
      "Build out competitor comparison pages for high-intent switching queries",
      "Implement SoftwareApplication and FAQPage schema across tool pages",
    ],
    lessons: [
      "Website grader tools have a natural programmatic SEO opportunity — but only with proper static content",
      "Each tool metric is a blog post topic — write 'what is X and why does it matter for SEO'",
      "Switching traffic ('WooRank alternative') is high-intent and worth dedicated landing pages",
    ],
  },

  "ubersuggest.com": {
    category: "SEO Tool",
    verdict: "Ubersuggest (by Neil Patel) benefits from Neil's substantial personal brand and extensive digital marketing content empire. The tool itself targets small business owners and beginners rather than SEO professionals, which shapes the content strategy. High domain authority from the Neil Patel brand helps rank even moderate-quality content.",
    topIssues: [
      "Tool pages that rely on brand authority more than content depth",
      "Overlap between neilpatel.com and ubersuggest.com creates potential content duplication",
      "Tutorial content targeted at beginners — limited coverage for advanced SEO queries",
      "Aggressive internal linking to paid plan upgrades may increase bounce rates on educational content",
    ],
    fixes: [
      "Create advanced use-case content to capture experienced SEO practitioners, not just beginners",
      "Define clear canonical and content ownership between neilpatel.com and ubersuggest.com domains",
      "Implement cleaner separation between educational content and product upsell CTAs",
      "Add case study content showing real ranking improvements from Ubersuggest recommendations",
    ],
    lessons: [
      "Personal brand SEO is real — a founder's authority transfers to product domains",
      "Beginner-focused tools need beginner-focused content, but advanced content captures a valuable minority",
      "Two domains covering overlapping topics create canonical strategy complexity that must be managed deliberately",
    ],
  },

  "neilpatel.com": {
    category: "Digital Marketing Blog / Personal Brand",
    verdict: "Neil Patel's blog is one of the highest-authority digital marketing properties on the web with decades of compounding authority, thousands of indexed posts, and massive backlink acquisition through sheer content volume and personal brand. The SEO strategy is pure volume + authority — publish more, link more, be everywhere.",
    topIssues: [
      "Content decay at scale — many posts from 2014–2019 rank well but contain outdated tactics",
      "Keyword cannibalization inevitable with thousands of posts on overlapping topics",
      "Some high-volume posts broad enough to lack actionable depth for experienced marketers",
      "Internal linking volume so high it may dilute PageRank distribution efficiency",
    ],
    fixes: [
      "Systematic content refresh program prioritizing posts ranking 5–20 with significant traffic",
      "Content consolidation — merge thin overlapping posts into comprehensive guides",
      "Add more specific, tactical advice sections to high-traffic broad posts",
      "Audit internal link equity flow — ensure links point primarily to highest-value money pages",
    ],
    lessons: [
      "Personal brand authority is one of the most durable SEO assets — it takes years to build but compounds forever",
      "Volume content strategy requires proportional maintenance investment — without it, content decays",
      "At massive scale, content consolidation often outperforms new content creation",
    ],
  },

  "backlinko.com": {
    category: "SEO Blog / Education",
    verdict: "Backlinko is the gold standard of quality-over-quantity SEO content. Brian Dean's approach — fewer posts, each one exhaustively comprehensive, heavily researched, and meticulously updated — has produced a site that punches far above its content volume in rankings. Domain authority and content depth are both exceptional.",
    topIssues: [
      "Limited content volume means gaps in long-tail keyword coverage",
      "Highly competitive target keywords require constant freshness to maintain position 1",
      "Few programmatic or tool pages — content is almost entirely editorial",
      "Narrow topic focus limits audience expansion beyond SEO professionals",
    ],
    fixes: [
      "Maintain aggressive content update schedule — Backlinko's model depends on content being demonstrably current",
      "Expand into adjacent topics (content marketing, CRO) that attract SEO-adjacent audiences",
      "Create data-driven original research — Backlinko's studies are among their most-linked content",
      "Add more interactive elements (calculators, templates) to create additional link-worthy assets",
    ],
    lessons: [
      "One exceptional post beats ten average posts — quality creates compounding rankings",
      "Original research gets links no other content format can match — invest in it",
      "Content freshness is non-negotiable for competitive head terms — build update processes from day one",
    ],
  },
};

const GENERIC_INSIGHT: DomainInsight = {
  category: "Website",
  verdict: "This page shows a live SEO audit for {domain}. The audit checks all major technical SEO factors — from crawlability and indexing signals to on-page optimization, Core Web Vitals, and internal link structure. Use the results below to understand what's holding this site back in Google search rankings.",
  topIssues: [
    "Missing or poorly-optimized title tags that don't target any specific keyword",
    "Meta descriptions absent or auto-generated by Google rather than written manually",
    "Slow page load times (LCP > 2.5 seconds) that suppress rankings and increase bounce rates",
    "Thin or duplicate content pages that Google devalues compared to competitor pages",
    "Broken internal links creating dead ends for both users and Googlebot",
  ],
  fixes: [
    "Rewrite every title tag to front-load the primary keyword within 60 characters",
    "Write custom meta descriptions for all pages using the outcome-first formula",
    "Identify the LCP element and add a preload hint — this typically cuts load time by 0.5–1.5 seconds",
    "Expand thin pages to 300+ words of unique, useful content targeting a specific keyword",
    "Run a broken link audit and fix or redirect all 404 errors",
  ],
  lessons: [
    "Technical SEO issues are fixable in hours — content and authority gaps take months",
    "Start with critical issues on your most important pages, not low-impact issues across all pages",
    "Every SEO audit is a prioritized to-do list — the score is just a summary",
  ],
};

export function getDomainInsight(domain: string): DomainInsight {
  return insights[domain] ?? {
    ...GENERIC_INSIGHT,
    verdict: GENERIC_INSIGHT.verdict.replace("{domain}", domain),
  };
}
