/**
 * RankyPulse SEO Issue Knowledge Base
 * ─────────────────────────────────────────────────────────────────────────────
 * Maps every audit issue code → rich structured content for the Fix page,
 * Action Center, and Quick Wins UI.
 *
 * Keys must match the `id` values returned by the crawler API.
 * Unknown codes fall back to GENERIC_FALLBACK.
 */

export type IssueTool = {
  name: string;
  url: string;
  free: boolean;
  description?: string;
};

export type IssueContent = {
  title: string;
  impact: "HIGH" | "MED" | "LOW";
  effortMinutes: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  whyItMatters: string;
  manualSteps: string[];
  validationSteps: string[];
  estimatedImpact: string;
  canAutoFix: boolean;           // true = show "AI Fix" button; false = "Find Expert"
  exampleBefore?: string;        // bad HTML/config snippet
  exampleAfter?: string;         // corrected snippet
  aiFixPreview: string;          // 1–2 lines shown to Free users
  aiFixFull: string;             // full AI prompt/output shown to Pro
  templateSnippet?: string;      // copyable template
  // ── NEW: what beats SEMrush ────────────────────────────────────────────────
  proTip?: string;               // one sharp expert insight not in generic docs
  relatedIssues?: string[];      // IDs of related issues → fix-journey navigation
  tools?: IssueTool[];           // free/paid tools relevant to this specific issue
  platformSteps?: {              // platform-specific fix steps (SEMrush never does this)
    wordpress?: string[];
    shopify?: string[];
    wix?: string[];
  };
};

const CATALOG: Record<string, IssueContent> = {

  // ─── TITLES ───────────────────────────────────────────────────────────────

  no_title: {
    title: "Missing Page Title",
    impact: "HIGH",
    effortMinutes: 2,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "The <title> tag is the single strongest on-page SEO signal. It's the first thing searchers read in Google results, and missing it can cost you 2–4 ranking positions.",
    manualSteps: [
      "Open your page's HTML <head> section in your CMS or code editor",
      "Add a unique <title> tag with your primary keyword near the start",
      "Keep it 50–60 characters for best display in search results",
      "Add your brand name at the end, separated by | or —",
    ],
    validationSteps: [
      "View page source (Ctrl+U) and search for <title>",
      "Paste the URL into Google Search Console → URL Inspection to confirm Google sees it",
      "Re-run your RankyPulse audit to clear the issue",
    ],
    estimatedImpact: "+2–4 ranking positions",
    canAutoFix: true,
    exampleBefore: `<head>\n  <!-- No title tag! -->\n</head>`,
    exampleAfter: `<head>\n  <title>Best Running Shoes for Beginners | YourBrand</title>\n</head>`,
    aiFixPreview: "Add a unique <title> tag with your primary keyword (50–60 chars).",
    aiFixFull: `<title>Your Primary Keyword | Brand Name</title>\n\nPlace inside <head>. Keep under 60 characters. Lead with the keyword users search for, end with your brand.`,
    templateSnippet: "<title>Primary Keyword — Page Topic | Brand</title>",
    proTip: "Google assigns more weight to words that appear early in your title. Put your primary keyword in the first 3–6 words for the strongest ranking signal.",
    relatedIssues: ["title_too_long", "title_too_short", "duplicate_title"],
    tools: [
      { name: "Portent Title Tag Tester", url: "https://portent.com/tools/title-tag-tester", free: true, description: "Preview how your title looks in Google" },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "Inspect URL and confirm Google reads your title" },
    ],
    platformSteps: {
      wordpress: [
        "Open the page/post in WordPress editor",
        "Scroll to the Yoast SEO or Rank Math panel at the bottom",
        "Click 'Edit snippet' and type your title in the SEO Title field",
        "Watch the pixel bar — keep it in the green zone (under 600px)",
      ],
      shopify: [
        "Go to your product/page editor in the Shopify admin",
        "Scroll down to 'Search engine listing preview'",
        "Click 'Edit website SEO'",
        "Update the Page title field (50–60 characters)",
      ],
      wix: [
        "In Wix Editor, click the page settings icon (three dots next to page name)",
        "Select 'SEO (Google)'",
        "Update the Title Tag field",
        "Click Save and publish",
      ],
    },
  },

  missing_title: {
    title: "Missing Page Title",
    impact: "HIGH",
    effortMinutes: 2,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "The <title> tag is the single strongest on-page SEO signal. Missing it can cost you 2–4 ranking positions and reduces click-through from search results.",
    manualSteps: [
      "Open your page's HTML <head> section",
      "Add a unique <title> tag with your primary keyword near the start",
      "Keep it 50–60 characters for best display in SERPs",
      "Add your brand name at the end",
    ],
    validationSteps: [
      "View page source and search for <title>",
      "Check Google Search Console URL Inspection",
      "Re-run your RankyPulse audit",
    ],
    estimatedImpact: "+2–4 ranking positions",
    canAutoFix: true,
    exampleBefore: `<head>\n  <!-- No title tag -->\n</head>`,
    exampleAfter: `<head>\n  <title>Best Running Shoes | YourBrand</title>\n</head>`,
    aiFixPreview: "Add a <title> tag (50–60 chars) with your primary keyword.",
    aiFixFull: `<title>Primary Keyword | Brand Name</title>\n\nPlace in <head>. Lead with the keyword, end with brand. Keep under 60 characters.`,
    templateSnippet: "<title>Primary Keyword | Brand</title>",
    proTip: "Google assigns more weight to words that appear early in your title. Put your primary keyword in the first 3–6 words for the strongest ranking signal.",
    relatedIssues: ["title_too_long", "title_too_short", "duplicate_title"],
    tools: [
      { name: "Portent Title Tag Tester", url: "https://portent.com/tools/title-tag-tester", free: true },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Open the page/post in WordPress editor",
        "Scroll to the Yoast SEO or Rank Math panel",
        "Click 'Edit snippet' and enter your SEO title",
        "Keep the pixel width bar in the green zone",
      ],
      shopify: [
        "Open the product/page editor in Shopify admin",
        "Scroll to 'Search engine listing preview' → 'Edit website SEO'",
        "Add your page title (50–60 characters)",
      ],
      wix: [
        "Click the page settings → SEO (Google)",
        "Update the Title Tag field",
        "Save and publish",
      ],
    },
  },

  title_too_long: {
    title: "Page Title Too Long (>60 chars)",
    impact: "MED",
    effortMinutes: 3,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "Google truncates titles beyond ~600px (roughly 60 characters) in search results, replacing your carefully written copy with '…'. This hurts click-through rates.",
    manualSteps: [
      "Find your current title tag in your CMS or HTML",
      "Count the characters — aim for 50–60 max",
      "Remove filler words like 'the', 'a', 'and', 'for'",
      "Keep the primary keyword at the start; move brand to end",
    ],
    validationSteps: [
      "Paste your new title into Portent's SERP Preview Tool to see how it renders",
      "Confirm character count is under 60",
      "Re-run your RankyPulse audit",
    ],
    estimatedImpact: "+10–20% CTR",
    canAutoFix: true,
    exampleBefore: `<title>The Complete Guide to Finding the Best Running Shoes for Beginners and Intermediate Runners in 2026</title>`,
    exampleAfter: `<title>Best Running Shoes for Beginners (2026) | Brand</title>`,
    aiFixPreview: "Shorten the title to 50–60 characters, keeping the primary keyword first.",
    aiFixFull: `Shorten your title to under 60 characters:\n\nRemove: filler words, repeated phrases, date ranges that aren't needed\nKeep: primary keyword (at the start), brand name (at the end)\n\nExample:\n"The Complete Guide to Finding the Best Running Shoes..." (85 chars)\n→ "Best Running Shoes for Beginners (2026) | Brand" (47 chars)`,
    proTip: "When your title is cut off, Google often rewrites it entirely — and you lose control of your SERP click copy. Short, keyword-dense titles consistently outperform long ones.",
    relatedIssues: ["no_title", "title_too_short", "duplicate_title"],
    tools: [
      { name: "Portent Title Tag Tester", url: "https://portent.com/tools/title-tag-tester", free: true },
      { name: "SERP Simulator", url: "https://serpsimulator.io", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Go to the Yoast SEO or Rank Math panel in your page editor",
        "Edit the SEO Title field — watch the pixel width bar",
        "Remove your site name if Yoast is auto-appending it and the total is too long",
      ],
      shopify: [
        "Open the product/page editor → Search engine listing → Edit website SEO",
        "Shorten the Page title to under 60 characters",
        "The preview box shows how it will appear in Google",
      ],
      wix: [
        "Page settings → SEO (Google) → Title Tag",
        "Trim to under 60 characters — the character counter guides you",
      ],
    },
  },

  title_too_short: {
    title: "Page Title Too Short (<30 chars)",
    impact: "LOW",
    effortMinutes: 3,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "Titles under 30 characters often lack enough keywords and context for Google to understand the page topic, potentially reducing rankings for long-tail queries.",
    manualSteps: [
      "Find your current title in your CMS",
      "Add your primary keyword if not present",
      "Add a descriptor, year, or brand to reach 40–60 characters",
      "Avoid keyword stuffing — keep it readable",
    ],
    validationSteps: [
      "Count characters — aim for 40–60",
      "Preview in a SERP tool",
      "Re-run audit to clear the issue",
    ],
    estimatedImpact: "Better keyword targeting",
    canAutoFix: true,
    exampleBefore: `<title>Our Blog</title>`,
    exampleAfter: `<title>SEO & Marketing Blog | Tips for Growing Organic Traffic</title>`,
    aiFixPreview: "Expand the title to 40–60 characters with your primary keyword.",
    aiFixFull: `Expand your short title:\n\nAdd: primary keyword, year, descriptor, or benefit\nTarget: 40–60 characters\n\nExample: "Our Blog" → "SEO Tips & Marketing Strategy Blog | Brand" (42 chars)`,
    proTip: "Use the title to answer a user's implicit question. 'Our Blog' tells Google nothing. 'SEO Tips for Small Business Owners | Brand' tells Google exactly what to rank you for.",
    relatedIssues: ["no_title", "title_too_long", "duplicate_title"],
    tools: [
      { name: "Portent Title Tag Tester", url: "https://portent.com/tools/title-tag-tester", free: true },
    ],
  },

  duplicate_title: {
    title: "Duplicate Title Tags",
    impact: "MED",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Title & Meta",
    whyItMatters: "Pages with the same title confuse Google about which page should rank for a given keyword. It splits your ranking signal and can cause both pages to rank lower.",
    manualSteps: [
      "Use RankyPulse to see which pages share titles",
      "Make each title unique and specific to that page's topic",
      "For product/category pages: include distinguishing details (color, size, location)",
      "Update your CMS template if titles are generated automatically",
    ],
    validationSteps: [
      "Site-search Google for: site:yourdomain.com \"exact duplicate title\"",
      "Re-run audit and confirm 0 duplicate titles",
    ],
    estimatedImpact: "Clearer ranking signals, better keyword targeting",
    canAutoFix: false,
    exampleBefore: `Page A: <title>Product Page | Brand</title>\nPage B: <title>Product Page | Brand</title>`,
    exampleAfter: `Page A: <title>Blue Running Shoes — Men's | Brand</title>\nPage B: <title>Red Running Shoes — Women's | Brand</title>`,
    aiFixPreview: "Identify the duplicate pages and write unique titles for each.",
    aiFixFull: `Fix duplicate titles by making each unique:\n1. List all pages with the same title\n2. For each, identify the unique topic/product/location\n3. Rewrite the title to reflect that uniqueness\n4. For CMS-generated titles, update the template to include a dynamic field (category, SKU, city)`,
    proTip: "The most common cause of duplicate titles is a CMS template using a default fallback. Fix the template — not each individual page — so all future pages are unique by default.",
    relatedIssues: ["keyword_cannibalization", "no_title", "duplicate_meta_description"],
    tools: [
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "Search Appearance → HTML Improvements → Duplicate titles" },
    ],
    platformSteps: {
      wordpress: [
        "Go to Yoast SEO → Search Appearance → Content Types",
        "Update the title template for Posts/Pages to use %%title%% or %%sitename%% dynamically",
        "Use Yoast's Bulk Editor (SEO → Tools → Bulk Editor) to fix existing duplicates",
      ],
      shopify: [
        "In the theme editor, find where the page title is generated (usually in layout/theme.liquid)",
        "Ensure it uses {{ page_title }} or {{ product.title }} — not a hardcoded string",
        "Update individual product/page titles in the admin under 'Edit website SEO'",
      ],
      wix: [
        "Wix SEO Wiz → Site Structure → review page titles",
        "Edit each duplicate page and update its Title Tag in SEO settings",
      ],
    },
  },

  // ─── META DESCRIPTIONS ─────────────────────────────────────────────────────

  no_meta_description: {
    title: "Missing Meta Description",
    impact: "HIGH",
    effortMinutes: 5,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "Meta descriptions are your ad copy in Google search results. Pages without one get auto-generated snippets that are rarely compelling, costing you 15–30% CTR.",
    manualSteps: [
      "Add <meta name=\"description\" content=\"...\"> inside your page <head>",
      "Write 150–160 characters — lead with the user benefit",
      "Include your primary keyword naturally",
      "End with a soft call to action (Learn more, Get started, See pricing)",
    ],
    validationSteps: [
      "View page source and search for meta name=\"description\"",
      "Use Google's SERP Preview Tool to see how it renders",
      "Re-run your RankyPulse audit",
    ],
    estimatedImpact: "+15–30% CTR",
    canAutoFix: true,
    exampleBefore: `<head>\n  <!-- No meta description -->\n</head>`,
    exampleAfter: `<head>\n  <meta name="description" content="Find the best running shoes for beginners. Expert reviews, size guides, and free shipping on orders over $50. Shop now.">\n</head>`,
    aiFixPreview: "Add a <meta name=\"description\"> of 150–160 chars with your keyword and a CTA.",
    aiFixFull: `<meta name="description" content="[User benefit]. [Primary keyword]. [CTA].">\n\nFormula: Who this is for + what they get + why act now. Keep to 150–160 characters.`,
    templateSnippet: `<meta name="description" content="Your compelling description here — include keyword and a call to action (150–160 chars)">`,
    proTip: "Your meta description is free advertising space. Lead with the user's desire, include your keyword, and end with a specific CTA. Pages with compelling descriptions regularly see 20–30% higher CTR than those with auto-generated ones.",
    relatedIssues: ["meta_desc_too_long", "meta_desc_too_short", "duplicate_meta_description"],
    tools: [
      { name: "SERP Simulator", url: "https://serpsimulator.io", free: true, description: "Preview how your description looks in Google" },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Scroll to the Yoast SEO or Rank Math box in the page/post editor",
        "Click 'Edit snippet' and fill in the Meta description field",
        "Keep the bar in the green zone (150–160 characters)",
        "Include your primary keyword and a call to action",
      ],
      shopify: [
        "Open the page/product editor → scroll to 'Search engine listing preview'",
        "Click 'Edit website SEO'",
        "Add your description in the Meta description field (150–160 chars)",
      ],
      wix: [
        "Page settings → SEO (Google) → Description",
        "Write a 150–160 character description with your keyword and a CTA",
        "Save and publish",
      ],
    },
  },

  missing_meta_description: {
    title: "Missing Meta Description",
    impact: "HIGH",
    effortMinutes: 5,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "Meta descriptions are your ad copy in Google results. Pages without one lose 15–30% potential clicks because Google auto-generates mediocre snippets.",
    manualSteps: [
      "Add <meta name=\"description\" content=\"...\"> in your <head>",
      "Write 150–160 characters with your primary keyword",
      "Make it compelling — describe the value of the page",
      "Add a soft CTA at the end",
    ],
    validationSteps: [
      "View source and search for meta name=\"description\"",
      "Preview using a SERP simulator",
      "Re-run audit",
    ],
    estimatedImpact: "+15–30% CTR",
    canAutoFix: true,
    exampleBefore: `<!-- No meta description -->`,
    exampleAfter: `<meta name="description" content="Expert running shoe reviews for beginners. Free size guide, free shipping over $50. Find your perfect fit today.">`,
    aiFixPreview: "Add a 150–160 char meta description with your keyword and a CTA.",
    aiFixFull: `<meta name="description" content="[Benefit]. [Keyword]. [CTA] (150–160 chars)">\n\nLead with what the user gets. Mention your keyword. End with action words.`,
    templateSnippet: `<meta name="description" content="Your description here (150–160 chars)">`,
    proTip: "Write your meta description before you write your page content — it forces you to nail your value proposition in 160 characters, which then guides the rest of the page.",
    relatedIssues: ["meta_desc_too_long", "meta_desc_too_short", "duplicate_meta_description"],
    tools: [
      { name: "SERP Simulator", url: "https://serpsimulator.io", free: true },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Go to the Yoast SEO / Rank Math panel in the page editor",
        "Click 'Edit snippet' and fill in the Meta description",
        "Keep it 150–160 characters with your keyword and CTA",
      ],
      shopify: [
        "Page/product editor → 'Search engine listing preview' → 'Edit website SEO'",
        "Fill in Meta description (150–160 chars)",
      ],
      wix: [
        "Page settings → SEO (Google) → Description field",
        "Write your 150–160 character description",
      ],
    },
  },

  meta_desc_too_long: {
    title: "Meta Description Too Long (>160 chars)",
    impact: "MED",
    effortMinutes: 3,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "Google truncates descriptions beyond ~920px (≈160 characters) with a '…', cutting off your call to action. Shorter descriptions display fully and get more clicks.",
    manualSteps: [
      "Find the meta description in your CMS",
      "Trim to 150–160 characters — cut filler words first",
      "Move the most important information to the first 120 characters",
      "Keep your CTA intact at the end",
    ],
    validationSteps: [
      "Use a character counter — aim for 150–160 max",
      "Preview with a SERP tool to confirm full display",
      "Re-run audit",
    ],
    estimatedImpact: "Full description shown in SERPs → better CTR",
    canAutoFix: true,
    exampleBefore: `<meta name="description" content="We are the leading provider of high-quality, expertly crafted, artisanal running shoes that are perfect for beginners and intermediate runners who want to improve their performance and comfort in 2026.">`,
    exampleAfter: `<meta name="description" content="High-quality running shoes for beginners and intermediates. Expert fit guides, free shipping. Find your perfect pair today.">`,
    aiFixPreview: "Trim the description to 150–160 characters without losing the key message.",
    aiFixFull: `Shorten your meta description:\n\nRemove: repeated words, filler phrases ('we are the leading...'), unnecessary adjectives\nKeep: primary keyword, main benefit, call to action\nTarget: 150–160 characters\n\nFormula: [Keyword] + [benefit] + [CTA] = ~155 chars`,
    proTip: "Put your most important message in the first 120 characters. Even if Google sometimes truncates at a different length, the opening always shows. Your CTA can still be at the end — just don't bury your value prop there.",
    relatedIssues: ["no_meta_description", "meta_desc_too_short", "duplicate_meta_description"],
    tools: [
      { name: "SERP Simulator", url: "https://serpsimulator.io", free: true },
    ],
  },

  meta_desc_too_short: {
    title: "Meta Description Too Short",
    impact: "LOW",
    effortMinutes: 5,
    difficulty: "Easy",
    category: "Title & Meta",
    whyItMatters: "Very short meta descriptions leave empty space in search results and miss the opportunity to convince users to click. A well-written 150-character description can significantly improve CTR.",
    manualSteps: [
      "Find your current meta description in your CMS",
      "Expand it to 150–160 characters",
      "Add your primary keyword if not present",
      "Add a benefit statement and a call to action",
    ],
    validationSteps: [
      "Confirm character count is 150–160",
      "Preview in a SERP tool",
      "Re-run audit",
    ],
    estimatedImpact: "+10–20% CTR from better SERP snippet",
    canAutoFix: true,
    exampleBefore: `<meta name="description" content="Running shoes for sale.">`,
    exampleAfter: `<meta name="description" content="Shop our range of running shoes for beginners and pros. Expert reviews, size guides, and free next-day delivery on orders over $50.">`,
    aiFixPreview: "Expand the description to 150–160 chars with keyword and benefit.",
    aiFixFull: `Expand your meta description to 150–160 characters:\n\nAdd: primary keyword, user benefit, social proof or offer, CTA\nExample: "[Keyword] — [benefit]. [Offer/proof]. [CTA]."`,
    proTip: "Use the 'Benefit + Proof + CTA' formula: 'Free SEO audit for any website [benefit]. Trusted by 10,000+ site owners [proof]. Start your free audit now [CTA].' This reliably produces high-CTR descriptions.",
    relatedIssues: ["no_meta_description", "meta_desc_too_long", "duplicate_meta_description"],
    tools: [
      { name: "SERP Simulator", url: "https://serpsimulator.io", free: true },
    ],
  },

  duplicate_meta_description: {
    title: "Duplicate Meta Descriptions",
    impact: "MED",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Title & Meta",
    whyItMatters: "Google may ignore duplicate meta descriptions and generate its own, often less compelling, snippet. Unique descriptions ensure each page has its best chance at a good click-through rate.",
    manualSteps: [
      "Use RankyPulse to identify which pages share descriptions",
      "Write a unique description for each, based on that page's specific content",
      "For programmatically generated pages, update your template to include a dynamic field",
      "Prioritize high-traffic pages first",
    ],
    validationSteps: [
      "Search Google for: site:yourdomain.com + the shared description text",
      "Re-run audit and confirm 0 duplicates",
    ],
    estimatedImpact: "Each page gets its best SERP snippet",
    canAutoFix: false,
    aiFixPreview: "Identify duplicates and write unique descriptions for each page.",
    aiFixFull: `Fix duplicate descriptions:\n1. List pages sharing the same description\n2. For each page, identify its unique value proposition\n3. Rewrite: [Page-specific keyword] + [unique benefit] + [CTA]\n4. For CMS templates: add dynamic variables (product name, category, location)`,
    proTip: "It's better to have no meta description than a duplicate one. Google will generate its own snippet — often pulling the most relevant paragraph from the page — which can actually be more specific than a generic duplicate.",
    relatedIssues: ["no_meta_description", "duplicate_title", "keyword_cannibalization"],
    tools: [
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "Search Appearance → HTML Improvements → Duplicate meta descriptions" },
    ],
    platformSteps: {
      wordpress: [
        "Go to Yoast SEO → Tools → Bulk Editor → Description tab",
        "See all pages with identical descriptions and update each individually",
        "Or update your post type template to dynamically generate descriptions using %%excerpt%%",
      ],
      shopify: [
        "Products/Pages with duplicate descriptions are usually from a template",
        "Edit each product/page → 'Edit website SEO' → update Meta description",
        "For bulk: use a CSV export → edit descriptions → re-import via bulk actions",
      ],
      wix: [
        "Go to SEO Tools → SEO Settings for each page with a duplicate description",
        "Update the Description field to be unique for each page",
      ],
    },
  },

  // ─── HEADINGS ──────────────────────────────────────────────────────────────

  no_h1: {
    title: "Missing H1 Heading",
    impact: "MED",
    effortMinutes: 3,
    difficulty: "Easy",
    category: "Structure",
    whyItMatters: "Google uses the H1 as its primary signal for the topic of your page. Missing it leaves search engines guessing, weakening your topical relevance and ranking potential.",
    manualSteps: [
      "Add exactly one <h1> tag to the page, in the main content area",
      "Include your primary keyword naturally — don't force it",
      "Make it descriptive and match what users search for",
      "Keep it concise (under 70 characters)",
    ],
    validationSteps: [
      "View page source and search for <h1>",
      "Confirm there is exactly one H1 on the page",
      "Re-run audit",
    ],
    estimatedImpact: "Stronger topical relevance signal",
    canAutoFix: true,
    exampleBefore: `<article>\n  <p>This page is about running shoes...</p>\n</article>`,
    exampleAfter: `<article>\n  <h1>Best Running Shoes for Beginners (2026 Guide)</h1>\n  <p>This page is about running shoes...</p>\n</article>`,
    aiFixPreview: "Add one <h1> tag with your primary keyword to the page's main content area.",
    aiFixFull: `<h1>Your Primary Keyword — Page Topic</h1>\n\nPlace this at the top of your main content. Use only one H1 per page. Include your target keyword naturally.`,
    templateSnippet: "<h1>Primary Keyword — Descriptive Page Topic</h1>",
    proTip: "Your H1 and title tag don't have to be identical. The title tag is optimized for SERP CTR (60 chars). Your H1 is for users — it can be longer, more descriptive, and more inviting once they've already clicked.",
    relatedIssues: ["multiple_h1", "no_title", "thin_content"],
    tools: [
      { name: "Chrome DevTools", url: "https://developer.chrome.com/docs/devtools/", free: true, description: "F12 → Elements panel → search for h1" },
    ],
    platformSteps: {
      wordpress: [
        "In the WordPress block editor (Gutenberg), the first 'Heading' block at the top of your content should be set to H1",
        "Check if your theme uses the post title as H1 — if so, you may already have one in the template",
        "In Classic Editor: ensure the first heading is marked as 'Heading 1' in the format dropdown",
      ],
      shopify: [
        "In your product/page editor, the product name or page title is usually rendered as H1 by the theme",
        "If not, open Theme Editor → edit the relevant section template",
        "Add <h1>{{ product.title }}</h1> or <h1>{{ page.title }}</h1> at the top of the content area",
      ],
      wix: [
        "In the Wix editor, click the first text element on the page",
        "Change its text style to 'Heading 1' using the text formatting toolbar",
        "Include your primary keyword in this heading",
      ],
    },
  },

  missing_h1: {
    title: "Missing H1 Heading",
    impact: "MED",
    effortMinutes: 3,
    difficulty: "Easy",
    category: "Structure",
    whyItMatters: "Google uses the H1 to understand the page's topic. Pages without an H1 often rank lower because the topical signal is weaker.",
    manualSteps: [
      "Add one <h1> tag at the top of your main content",
      "Include your primary keyword naturally",
      "Keep it under 70 characters",
      "Use only one H1 per page",
    ],
    validationSteps: [
      "View source and search for <h1>",
      "Confirm exactly one H1 exists",
      "Re-run audit",
    ],
    estimatedImpact: "Stronger topical relevance signal",
    canAutoFix: true,
    exampleBefore: `<main>\n  <p>Running shoes for everyone...</p>\n</main>`,
    exampleAfter: `<main>\n  <h1>Running Shoes for Beginners: 2026 Guide</h1>\n  <p>Running shoes for everyone...</p>\n</main>`,
    aiFixPreview: "Add exactly one <h1> with your primary keyword to the main content.",
    aiFixFull: `<h1>Primary Keyword — Descriptive Topic</h1>\n\nOne per page. At the top of main content. Include target keyword naturally.`,
    templateSnippet: "<h1>Primary Keyword — Descriptive Page Topic</h1>",
    proTip: "The H1 is not just for Google — it anchors the user after they click. A clear, specific H1 reduces bounce rate by confirming users landed on the right page.",
    relatedIssues: ["multiple_h1", "no_title", "thin_content"],
    tools: [
      { name: "Chrome DevTools", url: "https://developer.chrome.com/docs/devtools/", free: true, description: "F12 → Elements → Ctrl+F for h1" },
    ],
    platformSteps: {
      wordpress: [
        "The post title in WordPress is usually rendered as H1 by the theme",
        "Check your theme's single.php or page.php template to confirm",
        "In Gutenberg: add a Heading block at the top of your content and set it to H1",
      ],
      shopify: [
        "Product/page titles are typically rendered as H1 by the theme automatically",
        "In theme code: check for <h1>{{ product.title }}</h1> in product template",
        "If missing, add it to the top of your content section",
      ],
      wix: [
        "Click the main page heading in Wix Editor",
        "Set its text style to 'Heading 1'",
        "Ensure it includes your primary keyword",
      ],
    },
  },

  multiple_h1: {
    title: "Multiple H1 Tags",
    impact: "LOW",
    effortMinutes: 5,
    difficulty: "Easy",
    category: "Structure",
    whyItMatters: "Having multiple H1 tags dilutes your topical signal and makes it harder for Google to determine the primary topic of the page. One H1 creates a clear hierarchy.",
    manualSteps: [
      "View the page source and find all <h1> occurrences",
      "Keep only the most important one (usually the page title)",
      "Convert secondary H1s to H2 or H3 tags",
      "Ensure your heading hierarchy is logical: H1 → H2 → H3",
    ],
    validationSteps: [
      "View source and count <h1> occurrences — should be exactly 1",
      "Re-run audit",
    ],
    estimatedImpact: "Clearer topical signal to Google",
    canAutoFix: true,
    exampleBefore: `<h1>Running Shoes</h1>\n<h1>Our Best Picks</h1>\n<h1>Shop Now</h1>`,
    exampleAfter: `<h1>Best Running Shoes — 2026 Guide</h1>\n<h2>Our Top Picks</h2>\n<h2>Shop by Category</h2>`,
    aiFixPreview: "Keep one H1 and convert the rest to H2 or H3.",
    aiFixFull: `Fix multiple H1s:\n1. Identify the main H1 (your primary page topic)\n2. Change all other <h1> tags to <h2> or <h3>\n3. Ensure the heading hierarchy makes sense: H1 → H2 → H3`,
    proTip: "Multiple H1s often come from page builders or themes that use H1 styling for section headers. Use CSS to style H2s like H1s visually — keep the semantic hierarchy correct for SEO while matching your design.",
    relatedIssues: ["no_h1", "no_title", "thin_content"],
    tools: [
      { name: "HeadingsMap Browser Extension", url: "https://chromewebstore.google.com/detail/headingsmap/flbjommegcjonpdmenkdiocclhjacmbi", free: true, description: "Shows heading structure visually" },
    ],
  },

  // ─── CANONICALS ────────────────────────────────────────────────────────────

  no_canonical: {
    title: "Missing Canonical Tag",
    impact: "MED",
    effortMinutes: 2,
    difficulty: "Easy",
    category: "Indexing",
    whyItMatters: "Without canonical tags, Google may index duplicate versions of your pages (with/without www, with/without trailing slash), splitting your ranking signal across multiple URLs.",
    manualSteps: [
      "Add <link rel=\"canonical\" href=\"...\"> inside your <head>",
      "Use the full absolute URL (https://yoursite.com/page)",
      "Ensure it matches the URL you want Google to index",
      "Apply consistently across all pages",
    ],
    validationSteps: [
      "View source and search for rel=\"canonical\"",
      "Verify the canonical URL is correct (not pointing to another page)",
      "Re-run audit",
    ],
    estimatedImpact: "Prevents duplicate content penalties",
    canAutoFix: true,
    exampleBefore: `<head>\n  <!-- No canonical tag -->\n</head>`,
    exampleAfter: `<head>\n  <link rel="canonical" href="https://yoursite.com/running-shoes/">\n</head>`,
    aiFixPreview: "Add <link rel=\"canonical\"> pointing to the preferred URL for this page.",
    aiFixFull: `<link rel="canonical" href="https://yoursite.com/this-page-url">\n\nPlace in <head>. Use the exact URL you want indexed. Use https:// and consistent trailing slash.`,
    templateSnippet: `<link rel="canonical" href="https://yoursite.com/page-url">`,
    proTip: "Use canonicals proactively on all pages — not just duplicates. They're your insurance policy against Google accidentally indexing URL variants with query parameters (?utm_source=, ?ref=, etc.) that appear after marketing campaigns.",
    relatedIssues: ["canonical_mismatch", "multiple_canonicals", "duplicate_title"],
    tools: [
      { name: "Google Search Console URL Inspection", url: "https://search.google.com/search-console", free: true, description: "Shows which URL Google selected as canonical" },
    ],
    platformSteps: {
      wordpress: [
        "Yoast SEO and Rank Math automatically add self-referencing canonical tags to all pages",
        "Verify by viewing page source and searching for rel=\"canonical\"",
        "If missing, ensure Yoast/Rank Math is active and Advanced settings aren't overriding it",
      ],
      shopify: [
        "Shopify automatically adds canonical tags to product and collection pages",
        "For custom pages, add to your theme.liquid: <link rel=\"canonical\" href=\"{{ canonical_url }}\">",
        "Verify in page source that the canonical URL is correct",
      ],
      wix: [
        "Wix automatically adds canonical tags to all pages",
        "To set a custom canonical: Page Settings → SEO (Google) → Advanced → Canonical URL",
        "Ensure there are no conflicting canonicals from third-party apps",
      ],
    },
  },

  canonical_mismatch: {
    title: "Canonical URL Mismatch",
    impact: "HIGH",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Indexing",
    whyItMatters: "A canonical pointing to a different page tells Google 'don't index me, index that page instead.' If set incorrectly, your page won't rank — even if it's your best content.",
    manualSteps: [
      "Find the canonical tag on the affected page",
      "Check if it points to itself or to a different page",
      "If pointing to a different page by mistake, update it to point to itself",
      "If intentional (e.g. duplicate product variants), confirm the target page is the correct canonical",
    ],
    validationSteps: [
      "View source → find rel=\"canonical\" and check the href value",
      "In Google Search Console, use URL Inspection on the affected page",
      "Confirm 'Canonical URL' and 'Google-selected canonical' match your intent",
    ],
    estimatedImpact: "Recovers lost ranking signal on miscanonicalised pages",
    canAutoFix: false,
    exampleBefore: `<!-- Page: /blue-shoes/ -->\n<link rel="canonical" href="https://yoursite.com/red-shoes/">`,
    exampleAfter: `<!-- Page: /blue-shoes/ -->\n<link rel="canonical" href="https://yoursite.com/blue-shoes/">`,
    aiFixPreview: "Update the canonical to point to the correct URL for this page.",
    aiFixFull: `Fix canonical mismatch:\n1. Open page source → find <link rel="canonical">\n2. Check the href — does it match this page's URL?\n3. If not, update it to: https://yoursite.com/exact-page-url\n4. If canonical is intentionally pointing elsewhere, verify that target page is the right canonical`,
    proTip: "A canonical mismatch is often caused by pagination plugins or theme code setting the same canonical for all pages in a series. Check pages /page/2, /page/3 etc — their canonicals should point to themselves, not to page 1.",
    relatedIssues: ["multiple_canonicals", "no_canonical", "robots_noindex"],
    tools: [
      { name: "Google Search Console URL Inspection", url: "https://search.google.com/search-console", free: true },
      { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true, description: "Crawl all canonicals in bulk (free up to 500 URLs)" },
    ],
  },

  multiple_canonicals: {
    title: "Multiple Canonical Tags",
    impact: "HIGH",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Indexing",
    whyItMatters: "Multiple canonical tags send conflicting signals to Google. Google may ignore all of them and choose its own canonical, which may not be the URL you want ranking.",
    manualSteps: [
      "View page source and search for all rel=\"canonical\" tags",
      "Identify where each is being added (template, plugin, CMS, theme)",
      "Remove all but one — keep the correct self-referencing canonical",
      "Disable any plugin or theme setting that adds duplicate canonicals",
    ],
    validationSteps: [
      "View source: count rel=\"canonical\" — should be exactly 1",
      "Re-run audit to confirm resolved",
    ],
    estimatedImpact: "Consistent canonical signal to Google",
    canAutoFix: false,
    aiFixPreview: "Remove all but one canonical tag from this page's <head>.",
    aiFixFull: `Fix multiple canonicals:\n1. View source → find all <link rel="canonical"> tags\n2. Trace where each comes from (theme, plugin, hand-coded)\n3. Keep only one, pointing to the correct URL\n4. Disable or update the code/plugin adding the duplicate`,
    proTip: "Multiple canonicals most commonly happen when a WordPress theme has its own canonical AND Yoast SEO adds another. Check your theme's header.php for a hardcoded canonical and remove it if Yoast is handling it.",
    relatedIssues: ["canonical_mismatch", "no_canonical", "duplicate_title"],
    tools: [
      { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true, description: "Bulk audit of all canonical tags across your site" },
    ],
    platformSteps: {
      wordpress: [
        "The most common cause: both the theme and Yoast/Rank Math add canonicals",
        "Open Appearance → Theme Editor → header.php (or theme's header template)",
        "Search for rel=\"canonical\" and remove any hardcoded version",
        "Let Yoast or Rank Math handle canonicals through the plugin settings",
      ],
      shopify: [
        "Check your theme.liquid for <link rel=\"canonical\"> — should only appear once",
        "Ensure no app is adding a second canonical tag",
        "View page source to confirm only one canonical exists",
      ],
    },
  },

  // ─── ROBOTS & INDEXING ─────────────────────────────────────────────────────

  robots_noindex: {
    title: "Page Blocked by noindex",
    impact: "HIGH",
    effortMinutes: 5,
    difficulty: "Easy",
    category: "Indexing",
    whyItMatters: "A noindex tag tells Google 'don't include this page in search results.' If set by mistake, your page is completely invisible to search traffic regardless of its content quality.",
    manualSteps: [
      "Find the robots meta tag: <meta name=\"robots\" content=\"noindex\">",
      "Determine if noindex is intentional (staging, private pages) or accidental",
      "If accidental: remove the noindex directive or change to 'index, follow'",
      "Check your CMS settings — WordPress and others have per-page noindex toggles",
    ],
    validationSteps: [
      "View source → search for 'noindex'",
      "Use Google Search Console → URL Inspection → confirm page is 'URL is on Google'",
      "Wait 1–2 weeks after removing noindex for Google to re-index",
    ],
    estimatedImpact: "Page becomes eligible to rank in search",
    canAutoFix: true,
    exampleBefore: `<meta name="robots" content="noindex, nofollow">`,
    exampleAfter: `<meta name="robots" content="index, follow">`,
    aiFixPreview: "Remove the noindex directive so Google can index this page.",
    aiFixFull: `Change:\n<meta name="robots" content="noindex, nofollow">\n\nTo:\n<meta name="robots" content="index, follow">\n\nOr remove the robots meta tag entirely. Also check your CMS for a 'discourage search engines' setting.`,
    templateSnippet: `<meta name="robots" content="index, follow">`,
    proTip: "After removing noindex, don't wait for Google's next crawl — use Google Search Console → URL Inspection → 'Request Indexing' to speed up re-indexing to 24–48 hours instead of weeks.",
    relatedIssues: ["robots_txt_blocked", "canonical_mismatch", "no_canonical"],
    tools: [
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "URL Inspection → 'Request Indexing' after removing noindex" },
    ],
    platformSteps: {
      wordpress: [
        "In the page/post editor, scroll to the Yoast SEO panel",
        "Click 'Advanced' and check the 'Allow search engines...' setting",
        "Ensure it's set to 'Yes' (not 'No')",
        "Also check Settings → Reading — uncheck 'Discourage search engines from indexing this site'",
      ],
      shopify: [
        "Shopify doesn't have a per-page noindex toggle by default",
        "Check your theme.liquid for <meta name='robots' content='noindex'>",
        "Some Shopify apps (like password pages) add noindex — check your installed apps",
      ],
      wix: [
        "Page Settings → SEO (Google) → 'Let Google see this page' toggle → turn ON",
        "This controls the noindex tag for that specific page",
      ],
    },
  },

  robots_txt_blocked: {
    title: "Blocked by robots.txt",
    impact: "HIGH",
    effortMinutes: 15,
    difficulty: "Medium",
    category: "Indexing",
    whyItMatters: "A robots.txt Disallow rule prevents Google from even visiting these pages. Unlike noindex, Google never sees the page at all — it can't rank what it can't crawl.",
    manualSteps: [
      "Open yoursite.com/robots.txt in a browser",
      "Look for Disallow rules that match the affected URL pattern",
      "Remove or narrow the Disallow rule to only block what you intend",
      "Test with Google Search Console → robots.txt Tester",
    ],
    validationSteps: [
      "Visit yoursite.com/robots.txt and confirm the Disallow is removed",
      "Use Google Search Console → URL Inspection on the affected page",
      "Re-run audit after Google recrawls",
    ],
    estimatedImpact: "Allows Google to crawl and potentially rank the page",
    canAutoFix: false,
    exampleBefore: `User-agent: *\nDisallow: /products/`,
    exampleAfter: `User-agent: *\nDisallow: /admin/\n# Products are now allowed to be crawled`,
    aiFixPreview: "Remove the Disallow rule in robots.txt that is blocking this page.",
    aiFixFull: `Fix robots.txt blocking:\n1. Open yoursite.com/robots.txt\n2. Find: Disallow: /path-that-matches-your-page\n3. Either remove it entirely or narrow it (e.g., Disallow: /admin/ instead of Disallow: /)\n4. Validate using Google Search Console robots.txt Tester`,
    proTip: "The #1 robots.txt mistake is accidentally blocking your CSS and JavaScript files (e.g., Disallow: /wp-content/). If Google can't render your page's assets, it sees a broken layout and may rank it as low-quality content.",
    relatedIssues: ["robots_noindex", "canonical_mismatch", "broken_links"],
    tools: [
      { name: "Google robots.txt Tester", url: "https://search.google.com/search-console/robots-testing-tool", free: true },
    ],
    platformSteps: {
      wordpress: [
        "WordPress generates a virtual robots.txt — go to Settings → Reading → check 'Discourage search engines'",
        "To edit the actual robots.txt: use a plugin like Yoast SEO → Tools → File Editor",
        "Find and remove any Disallow rules that are blocking your content pages",
        "Never block /wp-content/themes/ or /wp-content/plugins/ as this breaks rendering",
      ],
      shopify: [
        "Shopify's robots.txt is auto-generated and can't be fully customized on all plans",
        "On Shopify Plus, you can use a robots.txt.liquid template",
        "For standard plans, contact Shopify support if critical pages are blocked",
      ],
    },
  },

  // ─── LINKS ─────────────────────────────────────────────────────────────────

  broken_links: {
    title: "Broken Internal Links",
    impact: "HIGH",
    effortMinutes: 15,
    difficulty: "Medium",
    category: "Technical",
    whyItMatters: "Every broken internal link is a dead end for Google's crawler. PageRank stops flowing at that link, and entire sections of your site can go unindexed if crawl paths are severed.",
    manualSteps: [
      "Open the RankyPulse report to see which pages contain broken links",
      "For each broken link, determine if the target page was moved or deleted",
      "If moved: update the link to the new URL, or add a 301 redirect from old to new",
      "If deleted: remove the link or replace with a link to a relevant live page",
      "Schedule monthly broken link checks to prevent recurrence",
    ],
    validationSteps: [
      "Click each previously broken link — it should return 200 OK",
      "Check Google Search Console → Coverage → Not Found (404) section",
      "Re-run audit",
    ],
    estimatedImpact: "Restores PageRank flow, improves crawlability",
    canAutoFix: false,
    exampleBefore: `<a href="/old-product-page/">View Product</a> <!-- Returns 404 -->`,
    exampleAfter: `<a href="/new-product-page/">View Product</a> <!-- Returns 200 OK -->`,
    aiFixPreview: "Update or remove broken links identified in your audit report.",
    aiFixFull: `Fix broken internal links:\n1. See the affected URLs in your audit\n2. For moved pages: set up 301 redirect from /old-url → /new-url\n3. For deleted pages: update linking pages to remove or replace the link\n4. In .htaccess or Nginx config:\n   Redirect 301 /old-page /new-page`,
    proTip: "The #1 source of broken links is redesigning your URL structure without proper 301 redirects. Before any site migration, crawl your site and map every old URL to its new destination — before you make the change.",
    relatedIssues: ["redirect_chain", "page_not_found", "orphan_page"],
    tools: [
      { name: "Screaming Frog SEO Spider", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true, description: "Free for up to 500 URLs — finds all broken links in one crawl" },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "Coverage → Not Found shows all 404s Google discovered" },
    ],
    platformSteps: {
      wordpress: [
        "Install 'Broken Link Checker' plugin (free) — it monitors all links automatically",
        "Go to Tools → Broken Links to see all broken links across your site",
        "Click 'Edit URL' to update the link without opening each page",
        "For redirect management: install 'Redirection' plugin (free) to set up 301 redirects",
      ],
      shopify: [
        "In Shopify admin → Online Store → Navigation, check all menu links",
        "For product/page redirects: Online Store → URL Redirects → Add redirect",
        "Apps like 'Broken Link' by Swissuplabs can automate broken link detection",
      ],
      wix: [
        "Wix automatically creates 301 redirects when you change page URLs",
        "Go to Settings → SEO Tools → Redirects to manage or add custom redirects",
        "Review your site's navigation and internal links for any outdated URLs",
      ],
    },
  },

  page_not_found: {
    title: "404 Page Not Found",
    impact: "HIGH",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Technical",
    whyItMatters: "404 pages waste crawl budget and destroy any backlink equity pointing to that URL. Google eventually deindexes 404 URLs, and backlinks to them lose all their SEO value.",
    manualSteps: [
      "Identify the broken URL from your audit report",
      "Determine if the page was moved or permanently deleted",
      "If moved: set up a 301 redirect from the old URL to the new page",
      "If deleted permanently: update any internal links pointing to it",
      "If it should exist: restore the page or create a replacement",
    ],
    validationSteps: [
      "Visit the old URL — it should redirect to the new page (301)",
      "Check response code is 200 on the destination",
      "Re-run audit",
    ],
    estimatedImpact: "Recovers backlink equity, prevents crawl budget waste",
    canAutoFix: false,
    exampleBefore: `# Page returns 404\ncurl -I https://yoursite.com/old-page\n# HTTP/1.1 404 Not Found`,
    exampleAfter: `# In .htaccess:\nRedirect 301 /old-page /new-page\n\n# curl result:\n# HTTP/1.1 301 Moved Permanently\n# Location: /new-page`,
    aiFixPreview: "Set up a 301 redirect from the dead URL to the closest live page.",
    aiFixFull: `Fix 404 errors with 301 redirects:\n\nApache (.htaccess):\nRedirect 301 /old-page /new-page\n\nNginx:\nrewrite ^/old-page$ /new-page permanent;\n\nNext.js (next.config.js):\nredirects: async () => [{ source: '/old-page', destination: '/new-page', permanent: true }]`,
    proTip: "Always redirect 404s to the most contextually relevant live page — not the homepage. A 404 on /blog/old-article should redirect to /blog, not /. Topically relevant redirects preserve significantly more PageRank.",
    relatedIssues: ["broken_links", "redirect_chain", "orphan_page"],
    tools: [
      { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "Coverage → Not Found tab" },
    ],
    platformSteps: {
      wordpress: [
        "Install the 'Redirection' plugin (free) — the easiest WordPress redirect manager",
        "Go to Tools → Redirection → Add Redirect",
        "Enter the old broken URL in 'Source URL' and the new page in 'Target URL'",
        "Set redirect type to 301 (Permanent) and save",
      ],
      shopify: [
        "Go to Shopify Admin → Online Store → Navigation → URL Redirects",
        "Click 'Add redirect'",
        "Enter the old URL path and the new destination URL",
        "Shopify handles the 301 automatically",
      ],
      wix: [
        "Settings → SEO Tools → 301 Redirect Manager",
        "Add the old URL and destination URL",
        "Wix creates the permanent redirect automatically",
      ],
    },
  },

  orphan_page: {
    title: "Orphan Pages (No Internal Links)",
    impact: "HIGH",
    effortMinutes: 20,
    difficulty: "Medium",
    category: "Structure",
    whyItMatters: "Pages with no internal links pointing to them are nearly invisible to Google. Googlebot discovers pages by following links — orphan pages rarely get crawled or ranked.",
    manualSteps: [
      "Identify the orphan pages from your audit report",
      "Find the most relevant existing page on your site to link from",
      "Add a natural contextual link from that page to the orphan",
      "Add the orphan to your navigation or a related posts section if appropriate",
      "Submit the orphan URL to Google via Search Console for faster indexing",
    ],
    validationSteps: [
      "Run a crawl tool to confirm the page now has at least 1 internal link",
      "Check Google Search Console → URL Inspection for crawl status",
      "Re-run audit",
    ],
    estimatedImpact: "Page gets crawled and indexed, can start ranking",
    canAutoFix: false,
    aiFixPreview: "Add at least one internal link to this page from a related, crawled page.",
    aiFixFull: `Fix orphan pages:\n1. Find pages on your site topically related to the orphan\n2. Add a natural link: <a href="/orphan-page">Relevant anchor text</a>\n3. Add to your site navigation or a 'Related articles' section\n4. Alternatively, add it to your sitemap.xml to help Google discover it`,
    proTip: "The highest-quality fix for orphan pages is linking from a hub or pillar page. One strong contextual link from a high-authority page on your site passes more PageRank than five low-context links from footers.",
    relatedIssues: ["deep_page_depth", "broken_links", "low_word_count"],
    tools: [
      { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true, description: "Inlinks report shows pages with zero internal links" },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true },
    ],
  },

  redirect_chain: {
    title: "Redirect Chains",
    impact: "MED",
    effortMinutes: 15,
    difficulty: "Medium",
    category: "Technical",
    whyItMatters: "Each hop in a redirect chain loses PageRank. A → B → C loses up to 15% authority per hop, slows page load time, and can cause crawl budget issues on large sites.",
    manualSteps: [
      "Identify the full redirect chain from your audit report",
      "Update the origin URL to point directly to the final destination (skip the middle)",
      "Set up a single 301 redirect from A → C (bypassing B)",
      "Update any internal links pointing to A or B to point directly to C",
    ],
    validationSteps: [
      "Use curl -L to trace the redirect chain: curl -IL https://yoursite.com/old-url",
      "Confirm the response is a single 301 directly to the final URL",
      "Re-run audit",
    ],
    estimatedImpact: "Preserves PageRank, speeds up crawling",
    canAutoFix: false,
    exampleBefore: `/page-a → 301 → /page-b → 301 → /page-c (3 hops, loses ~30% PageRank)`,
    exampleAfter: `/page-a → 301 → /page-c (1 hop, minimal PageRank loss)`,
    aiFixPreview: "Update redirects so each old URL points directly to the final destination.",
    aiFixFull: `Collapse redirect chains:\n\nApache (.htaccess):\n# Remove intermediate redirect\nRedirect 301 /page-a /page-c\n\nNginx:\nrewrite ^/page-a$ /page-c permanent;\n\nNext.js:\n{ source: '/page-a', destination: '/page-c', permanent: true }`,
    proTip: "Redirect chains accumulate over time — each redesign adds another hop. Audit your redirects annually and collapse any chains. Even a 2-hop chain (A→B→C) causes measurable crawl delay and PageRank loss on large sites.",
    relatedIssues: ["broken_links", "page_not_found", "deep_page_depth"],
    tools: [
      { name: "Redirect Checker", url: "https://redirectchecker.org", free: true, description: "Trace full redirect chains visually" },
      { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Install 'Redirection' plugin (free) — it logs all redirects and shows chains",
        "Go to Tools → Redirection → find multi-hop redirects",
        "Update the source URL to point directly to the final destination, skipping intermediate hops",
      ],
      shopify: [
        "Go to Online Store → URL Redirects",
        "Find redirects where the target URL itself redirects again",
        "Update the source redirect to point directly to the final URL",
      ],
    },
  },

  deep_page_depth: {
    title: "Deep Pages (4+ Clicks from Homepage)",
    impact: "MED",
    effortMinutes: 30,
    difficulty: "Hard",
    category: "Structure",
    whyItMatters: "Pages more than 3 clicks from your homepage receive less crawl budget and weaker PageRank signals. Google prioritizes pages that are easy to reach from the root.",
    manualSteps: [
      "Identify deep pages from your audit report",
      "Look for opportunities to shorten the path: add them to navigation, add internal links from higher-level pages",
      "Consider restructuring content into fewer category levels",
      "Add the deep pages to your sitemap.xml to ensure they're found",
    ],
    validationSteps: [
      "Trace the click path from homepage to the page — should be ≤3 clicks",
      "Check page appears in your sitemap.xml",
      "Re-run audit after restructuring",
    ],
    estimatedImpact: "Better crawl coverage, stronger PageRank distribution",
    canAutoFix: false,
    aiFixPreview: "Add internal links from higher-level pages to reduce the click depth.",
    aiFixFull: `Reduce page depth:\n1. Add direct links from your homepage, category pages, or navigation\n2. Create a hub/pillar page that links to deep content\n3. Add to sitemap.xml as a short-term fix while restructuring:\n  <url><loc>https://yoursite.com/deep-page</loc></url>\n4. Consider flattening your URL structure: /category/subcategory/page → /category/page`,
    proTip: "Use breadcrumb navigation with BreadcrumbList schema to both flatten the apparent click depth and signal page hierarchy to Google. Breadcrumbs give Google a direct path and improve rich result eligibility.",
    relatedIssues: ["orphan_page", "broken_links", "no_schema"],
    tools: [
      { name: "Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/", free: true, description: "Crawl Depth report shows pages by click depth from homepage" },
    ],
  },

  // ─── IMAGES ────────────────────────────────────────────────────────────────

  images_missing_alt: {
    title: "Images Missing Alt Text",
    impact: "LOW",
    effortMinutes: 10,
    difficulty: "Easy",
    category: "Accessibility",
    whyItMatters: "Alt text helps Google understand what your images show, contributing to image search rankings. It also makes your site accessible to visually impaired users and screen readers.",
    manualSteps: [
      "Find all <img> tags without alt attributes in your page HTML",
      "Add descriptive alt text that describes the image content",
      "Include a relevant keyword where it fits naturally (don't force it)",
      "Use empty alt=\"\" for purely decorative images",
    ],
    validationSteps: [
      "View source → search for <img and check each has alt=\"...\"",
      "Run a browser accessibility check (Chrome DevTools → Lighthouse)",
      "Re-run audit",
    ],
    estimatedImpact: "Image search visibility + accessibility compliance",
    canAutoFix: true,
    exampleBefore: `<img src="running-shoes.jpg">`,
    exampleAfter: `<img src="running-shoes.jpg" alt="Red Nike running shoes with cushioned sole for long-distance running">`,
    aiFixPreview: "Add descriptive alt text to every <img> tag.",
    aiFixFull: `Add alt attributes:\n<img src="image.jpg" alt="Descriptive text about what the image shows">\n\nBe specific. Include a keyword where natural. Use alt="" for decorative images (icons, dividers, backgrounds).`,
    templateSnippet: `alt="Descriptive text about the image content"`,
    proTip: "For product images, use specific, keyword-rich alt text: 'Red Nike Air Zoom Pegasus 40 running shoe, women's size 8' beats 'running shoes'. This is how you win image search traffic for specific product searches.",
    relatedIssues: ["slow_page", "slow_lcp", "no_schema"],
    tools: [
      { name: "Wave Accessibility Checker", url: "https://wave.webaim.org", free: true, description: "Enter any URL to see missing alt text highlighted" },
      { name: "Google Lighthouse", url: "https://developer.chrome.com/docs/lighthouse/", free: true, description: "Chrome DevTools → Lighthouse → Accessibility audit" },
    ],
    platformSteps: {
      wordpress: [
        "Go to Media → Library and click each image",
        "Fill in the 'Alternative Text' field in the right panel",
        "Alternatively: edit the page/post and click each image → update alt text in the block settings",
        "Use 'Image SEO' by Rank Math or 'SEO Optimized Images' plugin for bulk updates",
      ],
      shopify: [
        "Products → click the product → click each product image",
        "Fill in the 'Alt text' field that appears below each image",
        "For Pages: edit the page and click each image → add alt text in the image editor",
      ],
      wix: [
        "Click any image in the Wix editor",
        "Click 'Settings' in the image toolbar",
        "Fill in the 'What's in the image? Tell Google' field",
        "Click Apply",
      ],
    },
  },

  missing_alt_text: {
    title: "Images Missing Alt Text",
    impact: "LOW",
    effortMinutes: 10,
    difficulty: "Easy",
    category: "Accessibility",
    whyItMatters: "Alt text improves image search rankings and makes your site accessible. Google reads alt text to understand image content when crawling.",
    manualSteps: [
      "Find all <img> tags without alt attributes",
      "Add descriptive alt text based on what the image shows",
      "Include your keyword where natural",
      "Use alt=\"\" for decorative images",
    ],
    validationSteps: [
      "View source → confirm all <img> tags have alt=\"...\"",
      "Re-run audit",
    ],
    estimatedImpact: "Image search visibility + accessibility",
    canAutoFix: true,
    exampleBefore: `<img src="product.jpg">`,
    exampleAfter: `<img src="product.jpg" alt="Blue waterproof hiking boots with ankle support">`,
    aiFixPreview: "Add descriptive alt text to all <img> tags.",
    aiFixFull: `<img src="image.jpg" alt="What the image shows — include keyword naturally">\n\nBe specific. Decorative images: use alt="".`,
    templateSnippet: `alt="Descriptive image text"`,
    proTip: "Descriptive alt text is also your fallback when images fail to load — users will see the alt text. Specific, helpful alt text keeps users engaged even on slow connections.",
    relatedIssues: ["slow_page", "no_schema"],
    tools: [
      { name: "Wave Accessibility Checker", url: "https://wave.webaim.org", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Media → Library → click each image → fill in 'Alternative Text'",
        "Or: in the page editor, click each image → Image settings panel → Alt text",
      ],
      shopify: [
        "Products → click each product image → fill in 'Alt text' field",
      ],
      wix: [
        "Click image → Settings → 'What's in the image?' field",
      ],
    },
  },

  // ─── PERFORMANCE ───────────────────────────────────────────────────────────

  slow_page: {
    title: "Slow Page Load Speed",
    impact: "MED",
    effortMinutes: 30,
    difficulty: "Medium",
    category: "Performance",
    whyItMatters: "Page speed is a confirmed Google ranking factor since 2018. Slow pages also have higher bounce rates — every 1-second delay reduces conversions by ~7%.",
    manualSteps: [
      "Run your page through PageSpeed Insights (pagespeed.web.dev) to see specific issues",
      "Compress and convert images to WebP format",
      "Enable browser caching and a CDN (Cloudflare is free)",
      "Remove unused JavaScript and CSS",
      "Defer non-critical scripts with async/defer attributes",
    ],
    validationSteps: [
      "Re-run PageSpeed Insights — target 90+ on mobile",
      "Check Core Web Vitals in Google Search Console",
      "Re-run audit",
    ],
    estimatedImpact: "Better Core Web Vitals scores, lower bounce rate",
    canAutoFix: false,
    aiFixPreview: "Compress images, enable caching, and defer non-critical scripts.",
    aiFixFull: `Top speed optimizations:\n\n1. Images: convert to WebP, compress to <200KB, add lazy loading\n   <img loading="lazy" src="image.webp" alt="...">\n\n2. Scripts: defer non-critical JS\n   <script defer src="app.js"></script>\n\n3. Enable gzip/brotli compression on your server\n\n4. Use a CDN (Cloudflare free tier works well)\n\n5. Remove unused CSS with PurgeCSS`,
    proTip: "The single highest-impact performance fix is almost always images. Convert your largest images to WebP, serve them at the correct display size, and add lazy loading. This alone cuts load time by 30–50% on most pages.",
    relatedIssues: ["slow_lcp", "large_page_size", "images_missing_alt"],
    tools: [
      { name: "PageSpeed Insights", url: "https://pagespeed.web.dev", free: true, description: "Google's official tool — shows specific issues with actionable suggestions" },
      { name: "GTmetrix", url: "https://gtmetrix.com", free: true, description: "Detailed waterfall chart of all page requests" },
      { name: "Squoosh", url: "https://squoosh.app", free: true, description: "Convert images to WebP and compress in-browser" },
    ],
    platformSteps: {
      wordpress: [
        "Install WP Rocket (paid, best) or W3 Total Cache (free) for caching and minification",
        "Install ShortPixel or Smush (free tier) to compress and convert images to WebP automatically",
        "Use Cloudflare free tier for CDN + HTTP/2 — connect via the Cloudflare WordPress plugin",
        "Check your theme — bloated themes are the #1 WordPress speed killer",
      ],
      shopify: [
        "Shopify automatically serves images in WebP and uses a CDN — ensure your images are high quality but not oversized",
        "Use the 'Image Optimizer' app or Crush.pics for automatic compression",
        "Remove unused Shopify apps — each active app adds JavaScript to your pages",
        "Switch to a performance-focused theme like Dawn (free, Shopify-built)",
      ],
      wix: [
        "Wix handles CDN and image compression automatically",
        "Go to Settings → Performance → enable Wix Turbo if not already on",
        "Reduce the number of elements on the page — each widget adds load time",
        "Disable any unused third-party integrations in Settings → Integrations",
      ],
    },
  },

  slow_lcp: {
    title: "Slow Largest Contentful Paint (LCP)",
    impact: "HIGH",
    effortMinutes: 45,
    difficulty: "Hard",
    category: "Performance",
    whyItMatters: "LCP measures how fast the main content loads. Google uses it as a Core Web Vital ranking signal. A poor LCP (>4s) directly hurts your rankings on mobile and desktop.",
    manualSteps: [
      "Identify the LCP element using Chrome DevTools → Performance tab",
      "If it's an image: preload it with <link rel=\"preload\" as=\"image\">",
      "If it's text: ensure the font isn't blocking render (use font-display: swap)",
      "Remove render-blocking scripts above the fold",
      "Enable server-side compression and use a CDN",
    ],
    validationSteps: [
      "Run Chrome DevTools → Lighthouse and check LCP score (target: <2.5s)",
      "Check Google Search Console → Core Web Vitals report",
      "Re-run audit",
    ],
    estimatedImpact: "Improved Core Web Vitals ranking signal",
    canAutoFix: false,
    exampleBefore: `<!-- LCP image loads late -->\n<img src="hero.jpg" alt="Hero image">`,
    exampleAfter: `<!-- LCP image preloaded -->\n<link rel="preload" as="image" href="hero.webp">\n<img src="hero.webp" alt="Hero image" fetchpriority="high">`,
    aiFixPreview: "Preload the LCP element and remove render-blocking resources above the fold.",
    aiFixFull: `Fix LCP:\n\n1. Preload your hero image:\n<link rel="preload" as="image" href="hero.webp" fetchpriority="high">\n\n2. Add fetchpriority="high" to the LCP <img>:\n<img src="hero.webp" fetchpriority="high" alt="...">\n\n3. Defer non-LCP scripts:\n<script defer src="analytics.js"></script>\n\n4. Serve images in WebP at the correct size\n\n5. Enable HTTP/2 and server-side compression (Brotli > Gzip)`,
    proTip: "Add fetchpriority=\"high\" to your hero/LCP image element — this is a single attribute change that tells the browser to download this image first, ahead of other resources. It can cut LCP by 20–40% with zero server-side changes.",
    relatedIssues: ["slow_page", "large_page_size", "no_viewport"],
    tools: [
      { name: "PageSpeed Insights", url: "https://pagespeed.web.dev", free: true },
      { name: "WebPageTest", url: "https://www.webpagetest.org", free: true, description: "Advanced LCP filmstrip and root cause analysis" },
      { name: "Squoosh", url: "https://squoosh.app", free: true, description: "Convert hero images to WebP" },
    ],
    platformSteps: {
      wordpress: [
        "Use WP Rocket → Media tab → enable 'Preload Critical Images' (targets your LCP element automatically)",
        "Install ShortPixel to convert hero images to WebP",
        "Add fetchpriority='high' to your hero image in the theme's header.php or page builder settings",
        "Use WP Rocket or Perfmatters to defer render-blocking scripts",
      ],
      shopify: [
        "In your theme.liquid, find the hero image tag and add fetchpriority='high'",
        "Ensure hero images are served via Shopify's CDN at the correct 2x/3x sizes",
        "Use 'Booster: Page Speed Optimizer' app for automated LCP improvements",
        "Remove non-critical app scripts from theme settings if possible",
      ],
    },
  },

  large_page_size: {
    title: "Large Page Size (>100KB HTML)",
    impact: "MED",
    effortMinutes: 20,
    difficulty: "Medium",
    category: "Performance",
    whyItMatters: "Large HTML pages slow down Time to First Byte (TTFB) and increase parse time. This hurts Core Web Vitals scores and is particularly damaging on mobile connections.",
    manualSteps: [
      "Open Chrome DevTools → Network tab → reload page → look at document size",
      "Remove inline CSS/JS from the HTML — move to external files",
      "Enable server-side GZIP or Brotli compression",
      "Remove unnecessary HTML comments and whitespace (minification)",
      "Lazy-load content below the fold",
    ],
    validationSteps: [
      "Chrome DevTools → Network tab → document size should be <50KB compressed",
      "Run PageSpeed Insights and check 'Reduce initial server response time'",
      "Re-run audit",
    ],
    estimatedImpact: "Faster TTFB, better Core Web Vitals",
    canAutoFix: false,
    aiFixPreview: "Enable compression and remove inline scripts to reduce page weight.",
    aiFixFull: `Reduce page size:\n\n1. Enable Brotli or Gzip on your server:\n   # Nginx: gzip on; gzip_types text/html;\n   # Apache: AddOutputFilterByType DEFLATE text/html\n\n2. Minify HTML (remove whitespace, comments):\n   # Next.js: built-in via next.config.js compress: true\n\n3. Move inline CSS/JS to external files (cached separately)\n\n4. Remove unused template code or plugins generating bloated HTML`,
    proTip: "Enable Brotli compression on your server (not just Gzip). Brotli compresses HTML 20–30% more efficiently than Gzip and is supported by all modern browsers. On Nginx it's just brotli on; brotli_comp_level 6;",
    relatedIssues: ["slow_page", "slow_lcp"],
    tools: [
      { name: "PageSpeed Insights", url: "https://pagespeed.web.dev", free: true },
      { name: "GTmetrix", url: "https://gtmetrix.com", free: true },
      { name: "GZipWTF", url: "https://gzipwtf.com", free: true, description: "Test if your server has compression enabled" },
    ],
    platformSteps: {
      wordpress: [
        "Install WP Rocket or Autoptimize (free) — both handle HTML minification",
        "WP Rocket: Performance → HTML/CSS/JS → enable 'Minify HTML'",
        "Enable Gzip via Cloudflare (free) or add to .htaccess",
        "Remove bloated page builder shortcodes in content you no longer use",
      ],
      shopify: [
        "Shopify automatically uses a CDN and Gzip — large pages are usually caused by bloated liquid templates or too many installed apps",
        "Review and uninstall apps you don't actively use (each adds code to pages)",
        "Minify theme assets: in theme.liquid, remove unnecessary whitespace in frequently rendered partials",
      ],
    },
  },

  // ─── SCHEMA & SOCIAL ───────────────────────────────────────────────────────

  no_schema: {
    title: "Missing Structured Data (Schema)",
    impact: "LOW",
    effortMinutes: 20,
    difficulty: "Medium",
    category: "Schema",
    whyItMatters: "Schema markup enables rich results in Google Search — star ratings, FAQ dropdowns, breadcrumbs, and sitelinks. Pages with rich results get significantly higher click-through rates.",
    manualSteps: [
      "Determine the right schema type for your page (Article, Product, FAQ, LocalBusiness, etc.)",
      "Go to schema.org to find the required properties",
      "Add JSON-LD script block to your page <head>",
      "Validate with Google's Rich Results Test (search.google.com/test/rich-results)",
    ],
    validationSteps: [
      "Run Google's Rich Results Test on the page URL",
      "Check Google Search Console → Enhancements tab for schema status",
      "Re-run audit",
    ],
    estimatedImpact: "Eligible for rich results, +20–30% CTR",
    canAutoFix: true,
    exampleBefore: `<!-- No structured data -->`,
    exampleAfter: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Best Running Shoes",\n  "author": { "@type": "Person", "name": "Jane Doe" },\n  "datePublished": "2026-01-15"\n}\n</script>`,
    aiFixPreview: "Add a JSON-LD schema block matching your page type (Article, Product, FAQ, etc.).",
    aiFixFull: `Add schema markup to your page:\n\n<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",  // Change to: Product, FAQ, LocalBusiness, etc.\n  "headline": "Your Page Headline",\n  "author": { "@type": "Person", "name": "Author Name" },\n  "datePublished": "2026-01-01",\n  "dateModified": "2026-03-01"\n}\n</script>\n\nValidate at: search.google.com/test/rich-results`,
    templateSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Article",\n  "headline": "Page Title",\n  "author": { "@type": "Person", "name": "Author" },\n  "datePublished": "2026-01-01"\n}\n</script>`,
    proTip: "For blog articles, always set dateModified to the current date when you update content. Google uses schema freshness signals — updating the dateModified on a refreshed post can improve rankings for time-sensitive queries within days.",
    relatedIssues: ["no_og_tags", "no_title", "thin_content"],
    tools: [
      { name: "Google Rich Results Test", url: "https://search.google.com/test/rich-results", free: true, description: "Validate your schema and preview rich result eligibility" },
      { name: "Schema.org", url: "https://schema.org", free: true, description: "Reference for all schema types and properties" },
      { name: "JSON-LD Generator", url: "https://technicalseo.com/tools/schema-markup-generator/", free: true, description: "Generate schema code without writing JSON manually" },
    ],
    platformSteps: {
      wordpress: [
        "Yoast SEO Premium and Rank Math (free) add schema automatically to posts and pages",
        "For custom schema: Rank Math → Schema → Add New Schema → choose your type",
        "For FAQ schema: use Rank Math's FAQ block in Gutenberg — it auto-generates the markup",
        "For Product schema: use WooCommerce + Yoast WooCommerce SEO",
      ],
      shopify: [
        "Shopify automatically adds Product schema to product pages and Article schema to blog posts",
        "Verify using Google Rich Results Test — Shopify's built-in schema is usually valid",
        "For FAQ or Organization schema: use apps like 'JSON-LD for SEO' or 'Schema Plus for SEO'",
        "Manually add custom schema in theme.liquid inside a <script type='application/ld+json'> block",
      ],
      wix: [
        "Wix automatically adds structured data for pages, products, events, and blog posts",
        "Check the Rich Results Test to verify Wix-generated schema is valid",
        "For custom schema: add a custom HTML element and paste your JSON-LD code",
        "Go to Settings → Advanced → HTML & CSS injection for site-wide schema additions",
      ],
    },
  },

  no_og_tags: {
    title: "Missing Open Graph Tags",
    impact: "MED",
    effortMinutes: 5,
    difficulty: "Easy",
    category: "Social",
    whyItMatters: "Open Graph tags control how your page looks when shared on social media (Facebook, LinkedIn, Twitter). Pages without OG tags get generic, unappealing previews that get fewer clicks and shares.",
    manualSteps: [
      "Add og:title, og:description, og:image, and og:url to your <head>",
      "Create a 1200×630px social share image (OG image)",
      "Ensure og:description is 150–200 characters",
      "Test using Facebook's Sharing Debugger (developers.facebook.com/tools/debug)",
    ],
    validationSteps: [
      "View source → search for og:title",
      "Paste URL into Facebook Sharing Debugger to preview",
      "Re-run audit",
    ],
    estimatedImpact: "Better social media CTR when pages are shared",
    canAutoFix: true,
    exampleBefore: `<head>\n  <!-- No Open Graph tags -->\n</head>`,
    exampleAfter: `<head>\n  <meta property="og:title" content="Best Running Shoes 2026">\n  <meta property="og:description" content="Expert reviews and buying guides for runners of every level.">\n  <meta property="og:image" content="https://yoursite.com/og-image.jpg">\n  <meta property="og:url" content="https://yoursite.com/running-shoes">\n  <meta property="og:type" content="website">\n</head>`,
    aiFixPreview: "Add og:title, og:description, og:image, and og:url meta tags.",
    aiFixFull: `Add Open Graph tags to your <head>:\n\n<meta property="og:title" content="Your Page Title">\n<meta property="og:description" content="150–200 char description">\n<meta property="og:image" content="https://yoursite.com/social-image.jpg"> <!-- 1200x630px -->\n<meta property="og:url" content="https://yoursite.com/this-page">\n<meta property="og:type" content="website">`,
    templateSnippet: `<meta property="og:title" content="Title">\n<meta property="og:description" content="Description">\n<meta property="og:image" content="https://yoursite.com/image.jpg">\n<meta property="og:url" content="https://yoursite.com/page">`,
    proTip: "Your og:image is the single most important OG tag. A 1200×630px image with your brand and page headline overlaid gets dramatically more clicks on LinkedIn and Facebook than a blank or generic image. Create one template and use it for all pages.",
    relatedIssues: ["no_schema", "no_title", "no_meta_description"],
    tools: [
      { name: "Facebook Sharing Debugger", url: "https://developers.facebook.com/tools/debug", free: true, description: "Preview how your page looks when shared on Facebook" },
      { name: "LinkedIn Post Inspector", url: "https://www.linkedin.com/post-inspector/", free: true, description: "Preview LinkedIn share preview" },
      { name: "Canva", url: "https://www.canva.com", free: true, description: "Create 1200x630px social share images" },
    ],
    platformSteps: {
      wordpress: [
        "Yoast SEO adds Open Graph tags automatically — check Yoast → Social for site-wide settings",
        "For per-page OG images: edit the page → Yoast panel → Social tab → upload an OG image",
        "Rank Math: SEO Settings → Social → enable Open Graph and upload a default social image",
      ],
      shopify: [
        "Shopify automatically generates OG tags from your product/page title and featured image",
        "Set a custom social sharing image in Online Store → Themes → Theme Settings → Social Sharing",
        "For blog posts: the featured image becomes the og:image automatically",
        "To override: edit theme.liquid and set og:image to a specific asset URL",
      ],
      wix: [
        "Social Share Settings: in Editor → click the page → Settings → Social Share",
        "Upload a custom social image (1200×630px) for the page",
        "Wix populates og:title and og:description from your page title and description",
      ],
    },
  },

  // ─── MOBILE & HTTPS ────────────────────────────────────────────────────────

  no_viewport: {
    title: "Not Mobile-Friendly (No Viewport Tag)",
    impact: "HIGH",
    effortMinutes: 2,
    difficulty: "Easy",
    category: "Mobile",
    whyItMatters: "Google uses mobile-first indexing — your mobile site determines your rankings for all devices. A missing viewport tag means mobile users see a broken, zoomed-out layout, causing massive bounce rates.",
    manualSteps: [
      "Add the viewport meta tag to your page's <head> section",
      "Use the standard responsive value: width=device-width, initial-scale=1",
      "Test mobile display with Chrome DevTools (F12 → Toggle Device Toolbar)",
      "Verify no CSS is overriding the viewport behavior",
    ],
    validationSteps: [
      "View source → search for viewport",
      "Test on a real mobile device or Chrome mobile emulation",
      "Use Google's Mobile-Friendly Test (search.google.com/test/mobile-friendly)",
    ],
    estimatedImpact: "Required for mobile-first indexing — critical for rankings",
    canAutoFix: true,
    exampleBefore: `<head>\n  <!-- No viewport tag -->\n</head>`,
    exampleAfter: `<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n</head>`,
    aiFixPreview: "Add <meta name=\"viewport\"> to your <head> to enable mobile responsiveness.",
    aiFixFull: `<meta name="viewport" content="width=device-width, initial-scale=1">\n\nPlace inside <head>. This single tag enables responsive design and tells the browser to match the device width.`,
    templateSnippet: `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    proTip: "This is a 30-second fix with massive impact. Google uses mobile-first indexing — your mobile ranking IS your ranking. Missing a viewport tag can invisibly cost you 60–70% of your traffic (the mobile share). Fix this first.",
    relatedIssues: ["slow_page", "slow_lcp", "no_og_tags"],
    tools: [
      { name: "Google Mobile-Friendly Test", url: "https://search.google.com/test/mobile-friendly", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Most WordPress themes include the viewport tag by default in their header.php",
        "Check by viewing source and searching for 'viewport'",
        "If missing: add to your child theme's header.php inside <head>: <meta name='viewport' content='width=device-width, initial-scale=1'>",
        "If using a page builder, check its global settings for 'mobile viewport'",
      ],
      shopify: [
        "Shopify themes include viewport tags by default in theme.liquid",
        "If missing: edit your theme.liquid and add inside the <head> section",
        "Search for <!-- [REPLACE WITH VIEWPORT TAG] --> or similar placeholder",
      ],
      wix: [
        "Wix automatically includes the viewport meta tag — this is handled by the platform",
        "If showing as an issue, contact Wix support as this may be a platform bug",
      ],
    },
  },

  http_pages: {
    title: "Page Not Served Over HTTPS",
    impact: "HIGH",
    effortMinutes: 30,
    difficulty: "Medium",
    category: "Security",
    whyItMatters: "HTTPS is a confirmed Google ranking signal. HTTP pages show 'Not Secure' warnings in Chrome, which destroy user trust and directly reduce conversions and time-on-site.",
    manualSteps: [
      "Obtain an SSL certificate — Let's Encrypt is free and widely supported",
      "Configure your hosting to serve all pages over HTTPS",
      "Add a 301 redirect from all HTTP URLs to HTTPS",
      "Update any hardcoded http:// links in your content and templates",
      "Update your sitemap.xml and canonical tags to use https://",
    ],
    validationSteps: [
      "Visit http://yoursite.com — it should redirect to https://",
      "Check the padlock icon in Chrome",
      "Run SSL Labs (ssllabs.com/ssltest) to verify SSL health",
    ],
    estimatedImpact: "Security badge in browser, ranking signal improvement",
    canAutoFix: false,
    aiFixPreview: "Enable SSL and redirect all HTTP traffic to HTTPS.",
    aiFixFull: `Enable HTTPS:\n\n1. Get a free SSL cert: Let's Encrypt (letsencrypt.org) or via your hosting panel\n\n2. Apache (.htaccess) - force HTTPS:\nRewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n\n3. Nginx:\nserver {\n  listen 80;\n  return 301 https://$host$request_uri;\n}\n\n4. Update sitemap.xml and canonical tags to https://`,
    proTip: "After migrating to HTTPS, update your canonical tags and sitemap.xml to use https:// — not http://. Mixed signals (http:// canonical on an https:// page) confuse Google and can delay the full SEO benefit of the migration.",
    relatedIssues: ["no_canonical", "redirect_chain", "https"],
    tools: [
      { name: "SSL Labs", url: "https://www.ssllabs.com/ssltest/", free: true, description: "Full SSL certificate health check" },
      { name: "Why No Padlock", url: "https://www.whynopadlock.com", free: true, description: "Find mixed content blocking the HTTPS padlock" },
    ],
    platformSteps: {
      wordpress: [
        "Install 'Really Simple SSL' plugin (free) — it handles the HTTP→HTTPS redirect and fixes mixed content in one click",
        "In your hosting control panel, install a free Let's Encrypt certificate",
        "After activating SSL, go to Settings → General and update both URLs to https://",
        "Use Really Simple SSL's 'Enable' button to switch to full HTTPS",
      ],
      shopify: [
        "Shopify provides free SSL certificates automatically for all stores",
        "Go to Shopify Admin → Online Store → Domains",
        "Enable 'Redirect all traffic to this domain' and ensure HTTPS is shown",
        "Shopify forces HTTPS by default — if pages show as HTTP, check for hardcoded http:// links in theme code",
      ],
      wix: [
        "Wix provides free SSL for all sites automatically",
        "Settings → SSL Certificate → should show 'Active'",
        "Enable 'HTTPS Redirect' in the same settings panel",
        "If issues persist, contact Wix support — HTTPS is managed by the platform",
      ],
    },
  },

  https: {
    title: "Site Not Served Over HTTPS",
    impact: "MED",
    effortMinutes: 30,
    difficulty: "Medium",
    category: "Security",
    whyItMatters: "HTTPS is a Google ranking signal and builds user trust. Chrome labels HTTP sites as 'Not Secure', which increases bounce rates and erodes user confidence.",
    manualSteps: [
      "Get a free SSL certificate via Let's Encrypt or your hosting provider",
      "Configure your server to serve all pages over HTTPS",
      "Set up a 301 redirect from HTTP to HTTPS",
      "Update hardcoded HTTP links in your templates",
    ],
    validationSteps: [
      "Visit http://yoursite.com — should 301 redirect to https://",
      "Check the padlock in browser address bar",
      "Re-run audit",
    ],
    estimatedImpact: "Security badge + ranking signal improvement",
    canAutoFix: false,
    aiFixPreview: "Enable SSL and add a 301 redirect from HTTP to HTTPS.",
    aiFixFull: `Enable HTTPS:\n1. Get SSL from Let's Encrypt (free) or hosting provider\n2. Force HTTPS in .htaccess:\n   RewriteEngine On\n   RewriteCond %{HTTPS} off\n   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]\n3. Update links to https://`,
    proTip: "Don't forget mixed content — even after enabling HTTPS, a single http:// image or script URL in your code will block the padlock icon and trigger browser warnings. Use Chrome DevTools → Security tab to find mixed content.",
    relatedIssues: ["http_pages", "no_canonical", "redirect_chain"],
    tools: [
      { name: "SSL Labs", url: "https://www.ssllabs.com/ssltest/", free: true },
      { name: "Why No Padlock", url: "https://www.whynopadlock.com", free: true },
    ],
    platformSteps: {
      wordpress: [
        "Install 'Really Simple SSL' plugin and activate it",
        "Install a free Let's Encrypt certificate via your hosting panel (cPanel/Plesk both have this)",
      ],
      shopify: [
        "Shopify provides SSL automatically — check Domains settings and enable redirect",
      ],
      wix: [
        "Settings → SSL Certificate → enable and enable HTTPS Redirect",
      ],
    },
  },

  // ─── CONTENT ───────────────────────────────────────────────────────────────

  low_word_count: {
    title: "Thin Content (<300 words)",
    impact: "MED",
    effortMinutes: 30,
    difficulty: "Medium",
    category: "Content",
    whyItMatters: "Pages with very little content rarely rank well because Google can't determine what topic to rank them for. 'Thin content' was specifically targeted by Google's Panda algorithm.",
    manualSteps: [
      "Review the page's purpose — what question does it answer for users?",
      "Add 300–500 words of genuinely helpful content addressing user intent",
      "Use subheadings (H2, H3) to structure the content",
      "Add an FAQ section, usage tips, or supporting data to reach the threshold",
      "Ensure the new content is unique, not copied from elsewhere",
    ],
    validationSteps: [
      "Count words on the page — aim for 300+ for informational pages",
      "Re-run audit to confirm the thin content flag is cleared",
    ],
    estimatedImpact: "Better topical depth, improved rankings for target keywords",
    canAutoFix: false,
    aiFixPreview: "Expand the page to 300+ words covering what users actually want to know.",
    aiFixFull: `Expand thin content:\n\n1. Identify the primary user intent for this page (informational, transactional, navigational)\n2. Add content that directly answers that intent:\n   - For product pages: add detailed specs, usage instructions, FAQs\n   - For blog posts: add examples, data, expert tips\n   - For location pages: add local context, hours, map, reviews\n3. Structure with H2/H3 headings\n4. Add a 3–5 question FAQ section at the bottom`,
    proTip: "Quality beats quantity. 300 words that directly answer the user's question often outrank 1,000 words of filler. Use Google's 'People Also Ask' results for your target keyword to find exactly what questions to answer — those are real users asking real things.",
    relatedIssues: ["keyword_cannibalization", "no_h1", "no_schema"],
    tools: [
      { name: "AnswerThePublic", url: "https://answerthepublic.com", free: true, description: "Find questions users ask about your topic" },
      { name: "AlsoAsked", url: "https://alsoasked.com", free: true, description: "Maps 'People Also Ask' questions for any keyword" },
    ],
  },

  thin_content: {
    title: "Thin Content",
    impact: "LOW",
    effortMinutes: 20,
    difficulty: "Medium",
    category: "Content",
    whyItMatters: "Pages with very little meaningful content provide low value to users and search engines. Google's algorithms actively deprioritize thin content pages in rankings.",
    manualSteps: [
      "Expand page content to at least 300 words",
      "Add unique, valuable information that serves user intent",
      "Include relevant headings (H2, H3) to organize content",
      "Add FAQs, examples, or supporting data",
    ],
    validationSteps: [
      "Count page words — aim for 300+ minimum",
      "Re-run audit",
    ],
    estimatedImpact: "Improved content quality signals",
    canAutoFix: false,
    aiFixPreview: "Expand this page with 300+ words of valuable, unique content.",
    aiFixFull: `Improve thin content:\n1. Add at least 300 words of unique content\n2. Use H2/H3 subheadings for structure\n3. Include relevant keywords naturally\n4. Add FAQ sections or step-by-step guides`,
    proTip: "Consider consolidating thin pages that cover similar topics into one comprehensive page. One 800-word page almost always outranks two 300-word pages targeting the same keyword — and it's less work to maintain.",
    relatedIssues: ["low_word_count", "keyword_cannibalization", "no_h1"],
    tools: [
      { name: "AnswerThePublic", url: "https://answerthepublic.com", free: true },
    ],
  },

  keyword_cannibalization: {
    title: "Keyword Cannibalization",
    impact: "HIGH",
    effortMinutes: 60,
    difficulty: "Hard",
    category: "Content",
    whyItMatters: "When multiple pages target the same keyword, Google doesn't know which one to rank. They compete against each other, often causing both to rank lower than either would alone.",
    manualSteps: [
      "Identify which pages are competing for the same keyword using Google Search Console → Performance",
      "Decide which page is the primary candidate (most backlinks, most relevant, best content)",
      "Option A: Merge the weaker page into the stronger page (301 redirect + consolidate content)",
      "Option B: Differentiate — reoptimize each page for a different but related keyword",
      "Add a canonical from the weaker page to the stronger page as a minimum",
    ],
    validationSteps: [
      "Google search: site:yoursite.com keyword — should show one dominant page",
      "GSC → Performance: filter by keyword, confirm one page ranks strongly",
      "Re-run audit",
    ],
    estimatedImpact: "Consolidated ranking signal, stronger position for target keyword",
    canAutoFix: false,
    aiFixPreview: "Merge the competing pages or differentiate their keywords to eliminate cannibalization.",
    aiFixFull: `Fix keyword cannibalization:\n\n**Option A — Merge:**\n1. Redirect weaker page → stronger page: Redirect 301 /weak-page /strong-page\n2. Incorporate unique content from the weak page into the strong one\n3. Update internal links to point to the strong page\n\n**Option B — Differentiate:**\n1. Page A: target "keyword" (broad)\n2. Page B: target "keyword + modifier" (e.g. "keyword for beginners")\n3. Update title tags, H1s, and content accordingly`,
    proTip: "The fastest cannibalization fix with the least risk is adding a canonical tag from the weaker page pointing to the stronger one. It takes 5 minutes and immediately signals to Google which page should rank — no content migration needed.",
    relatedIssues: ["duplicate_title", "thin_content", "low_word_count"],
    tools: [
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true, description: "Performance → filter by keyword → Queries showing multiple ranking pages" },
      { name: "Semrush Cannibalization Report", url: "https://www.semrush.com/position-tracking/", free: false, description: "Automated cannibalization detection (paid)" },
    ],
  },

  // ─── TECHNICAL MISC ────────────────────────────────────────────────────────

  http_status: {
    title: "Non-Success HTTP Status Code",
    impact: "HIGH",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Technical",
    whyItMatters: "Pages returning 4xx or 5xx status codes won't rank. Google won't index pages it can't reach with a 200 OK response. Server errors can also trigger crawl budget issues.",
    manualSteps: [
      "Check your server logs for the specific error cause",
      "Verify the URL exists and the page hasn't been deleted or moved",
      "Fix misconfigured redirects, server rules, or authentication requirements",
      "For 5xx errors: check for application errors or overloaded servers",
    ],
    validationSteps: [
      "Test with: curl -I https://yoursite.com/page — look for 200 OK",
      "Check Google Search Console → Coverage → Server errors",
      "Re-run audit",
    ],
    estimatedImpact: "Page becomes crawlable and rankable",
    canAutoFix: false,
    aiFixPreview: "Diagnose the HTTP error and ensure the page returns 200 OK.",
    aiFixFull: `Fix HTTP status errors:\n\n- 404: Page not found → redirect to closest live page (Redirect 301 /old /new)\n- 500: Server error → check application logs for exceptions\n- 403: Forbidden → check file permissions or auth requirements\n- 301/302 loop: circular redirect → trace with curl -IL and break the loop`,
    proTip: "Always redirect 404s to the most contextually relevant live page — not just the homepage. A topically relevant redirect preserves more PageRank and gives users a better experience than a generic homepage redirect.",
    relatedIssues: ["broken_links", "redirect_chain", "page_not_found"],
    tools: [
      { name: "HTTP Status Checker", url: "https://httpstatus.io", free: true, description: "Bulk check status codes for multiple URLs" },
      { name: "Google Search Console", url: "https://search.google.com/search-console", free: true },
    ],
  },

  not_html: {
    title: "Response Is Not Valid HTML",
    impact: "MED",
    effortMinutes: 10,
    difficulty: "Medium",
    category: "Technical",
    whyItMatters: "Search engines need HTML to understand page content. If a URL returns JSON, PDF, or plain text, Google can't extract titles, descriptions, or content to rank the page.",
    manualSteps: [
      "Test the URL with curl -I to check the Content-Type header",
      "Ensure the URL returns text/html as the Content-Type",
      "If it's an API endpoint, exclude it from your sitemap and use a separate HTML page",
      "Fix any misconfigured Content-Type response headers",
    ],
    validationSteps: [
      "curl -I yoururl → Content-Type should be text/html",
      "View page source — it should be valid HTML markup",
      "Re-run audit",
    ],
    estimatedImpact: "Page becomes readable and rankable by search engines",
    canAutoFix: false,
    aiFixPreview: "Ensure the URL returns text/html with valid HTML markup.",
    aiFixFull: `Fix Content-Type:\n\nNginx: add_header Content-Type text/html;\nApache: Header set Content-Type "text/html; charset=utf-8"\n\nIf this URL is an API endpoint, it shouldn't be in your sitemap.\nCreate a separate HTML page at a different URL for SEO purposes.`,
    proTip: "API endpoints and RSS feeds in your sitemap are the most common cause of this error. Audit your sitemap.xml to ensure it only contains canonical HTML pages — remove any /api/, /feed/, /rss/, or /json/ URLs.",
    relatedIssues: ["http_status", "robots_txt_blocked"],
    tools: [
      { name: "HTTP Toolkit", url: "https://httptoolkit.com", free: true, description: "Inspect request/response headers in detail" },
    ],
  },
};

// ─── Generic fallback ──────────────────────────────────────────────────────────

const GENERIC_FALLBACK: IssueContent = {
  title: "SEO Improvement",
  impact: "MED",
  effortMinutes: 10,
  difficulty: "Medium",
  category: "General",
  whyItMatters: "Addressing this issue can improve your search visibility, crawlability, or user experience.",
  manualSteps: [
    "Review the issue description in your audit report for the specific details",
    "Implement the recommended change in your CMS or code",
    "Re-run the RankyPulse audit to verify the fix was applied",
  ],
  validationSteps: [
    "Re-run your RankyPulse audit",
    "Check Google Search Console for any related alerts",
  ],
  estimatedImpact: "Improved SEO health score",
  canAutoFix: false,
  aiFixPreview: "See the audit details for specific recommendations for this issue.",
  aiFixFull: "Review the full issue description in your audit report, implement the suggested fix, and re-run the audit to confirm.",
  proTip: "When in doubt, fix errors (red) before warnings (orange) before notices (blue). Google weights technical errors the most heavily in rankings.",
  relatedIssues: [],
  tools: [
    { name: "Google Search Console", url: "https://search.google.com/search-console", free: true },
  ],
};

// ─── Exports ──────────────────────────────────────────────────────────────────

/** All known issue IDs in the catalog */
export const CATALOG_ISSUE_IDS = Object.keys(CATALOG);

/**
 * Look up rich fix content for a given audit issue ID.
 * Falls back to GENERIC_FALLBACK for unknown IDs.
 * Pass rawTitle to use the audit title in the fallback.
 */
export function getIssueContent(issueId: string, rawTitle?: string): IssueContent {
  const id = (issueId ?? "").toLowerCase().trim();
  const base = CATALOG[id] ?? GENERIC_FALLBACK;

  if (rawTitle && base === GENERIC_FALLBACK) {
    return { ...GENERIC_FALLBACK, title: rawTitle };
  }

  return base;
}
