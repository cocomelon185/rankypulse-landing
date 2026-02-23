/**
 * Maps audit issue codes to rich content for Quick Wins UI.
 * Unknown codes fall back to generic SEO copy.
 */

export type IssueContent = {
  title: string;
  impact: "HIGH" | "MED" | "LOW";
  effortMinutes: number;
  category: string;
  whyItMatters: string;
  manualSteps: string[];
  aiFixPreview: string; // 2 lines for Free users
  aiFixFull: string;   // Pro only
  templateSnippet?: string; // Copyable template if relevant
};

const CATALOG: Record<string, IssueContent> = {
  title: {
    title: "Missing or weak page title",
    impact: "HIGH",
    effortMinutes: 2,
    category: "Title & Meta",
    whyItMatters: "Titles are the first thing searchers see. A clear, keyword-rich title improves click-through and rankings.",
    manualSteps: [
      "Add a unique <title> tag in the <head> section",
      "Keep it 50–60 characters for best display",
      "Include your primary keyword near the start",
      "Add brand name at the end (optional)",
    ],
    aiFixPreview: "Add a unique <title> tag with your primary keyword (50–60 chars).",
    aiFixFull: `<title>Your Brand | Primary Keyword - Secondary | Tagline</title>\n\nPlace this in your <head> section. Replace with your actual brand, keywords, and tagline. Keep under 60 characters for optimal search display.`,
    templateSnippet: "<title>Your Brand | Primary Keyword - Secondary | Tagline</title>",
  },
  meta_description: {
    title: "Meta description missing",
    impact: "HIGH",
    effortMinutes: 5,
    category: "Title & Meta",
    whyItMatters: "Meta descriptions appear in search results. A compelling 150–160 character description can increase click-through significantly.",
    manualSteps: [
      'Add <meta name="description" content="..."> in the <head>',
      "Write 150–160 characters with your primary keyword",
      "Make it compelling and action-oriented",
      "Avoid duplicate descriptions across pages",
    ],
    aiFixPreview: 'Add <meta name="description" content="..."> (150–160 chars).',
    aiFixFull: `<meta name="description" content="Compelling 150-160 character description that includes your primary keyword and a clear call to action.">\n\nReplace the content with a unique description for this page. Avoid stuffing keywords.`,
    templateSnippet: '<meta name="description" content="Your compelling meta description here (150-160 chars)">',
  },
  h1: {
    title: "Missing H1 heading",
    impact: "MED",
    effortMinutes: 3,
    category: "Structure",
    whyItMatters: "A single H1 tells search engines the main topic. It helps both accessibility and SEO.",
    manualSteps: [
      "Add one <h1> tag with the main topic of the page",
      "Use only one H1 per page",
      "Include your primary keyword naturally",
      "Keep it concise and descriptive",
    ],
    aiFixPreview: "Add a single <h1> tag with the main topic of the page.",
    aiFixFull: `<h1>Your Main Page Topic</h1>\n\nPlace this in the main content area. Use only one H1 per page. Include your primary keyword naturally.`,
    templateSnippet: "<h1>Your Main Page Topic</h1>",
  },
  canonical: {
    title: "Missing canonical link",
    impact: "MED",
    effortMinutes: 2,
    category: "Title & Meta",
    whyItMatters: "Canonical tags tell Google which URL is the preferred version, preventing duplicate content issues.",
    manualSteps: [
      'Add <link rel="canonical" href="..."> in the <head>',
      "Use the full absolute URL of the preferred page",
      "Ensure it matches the page being viewed",
      "Avoid circular or incorrect canonicals",
    ],
    aiFixPreview: 'Add <link rel="canonical" href="..."> to avoid duplicate content.',
    aiFixFull: `<link rel="canonical" href="https://yoursite.com/this-page">\n\nPlace in <head>. Replace with the actual URL of this page. Use the version you want search engines to index (usually the canonical one).`,
    templateSnippet: '<link rel="canonical" href="https://yoursite.com/page-url">',
  },
  noindex: {
    title: "Page set to noindex",
    impact: "HIGH",
    effortMinutes: 5,
    category: "Indexing",
    whyItMatters: "noindex blocks search engines from indexing the page. Remove it if you want this page to appear in search.",
    manualSteps: [
      "Find the robots meta tag in your <head>",
      "Remove noindex from the content attribute",
      "Or remove the entire meta tag if only noindex is present",
      "Use index, follow for normal pages",
    ],
    aiFixPreview: "Remove noindex from robots meta to allow indexing.",
    aiFixFull: `If you want this page indexed, change:\n<meta name="robots" content="noindex, nofollow">\n\nTo:\n<meta name="robots" content="index, follow">\n\nOr remove the robots meta tag entirely to allow default indexing.`,
    templateSnippet: '<meta name="robots" content="index, follow">',
  },
  https: {
    title: "Site not served over HTTPS",
    impact: "MED",
    effortMinutes: 15,
    category: "Security",
    whyItMatters: "HTTPS is a ranking signal and builds user trust. Most hosts offer free SSL certificates.",
    manualSteps: [
      "Obtain an SSL certificate (Let's Encrypt is free)",
      "Configure your hosting to serve over HTTPS",
      "Set up a redirect from HTTP to HTTPS",
      "Update any hardcoded HTTP links in your content",
    ],
    aiFixPreview: "Configure your hosting to serve the site over HTTPS.",
    aiFixFull: `Enable HTTPS on your server:\n1. Get a free SSL cert from Let's Encrypt or your host\n2. Configure your web server (Apache/Nginx) for HTTPS\n3. Add a 301 redirect from HTTP to HTTPS\n4. Update any hardcoded http:// links to https://`,
  },
  http_status: {
    title: "Non-success HTTP status",
    impact: "HIGH",
    effortMinutes: 10,
    category: "Technical",
    whyItMatters: "Pages returning 4xx or 5xx won't rank well. Fix server errors so the page returns 200 OK.",
    manualSteps: [
      "Check your server logs for the error cause",
      "Verify the URL is correct and the page exists",
      "Fix redirect chains or misconfigurations",
      "Ensure your hosting is operational",
    ],
    aiFixPreview: "Fix server errors so the page returns 200 OK.",
    aiFixFull: `Ensure the page returns HTTP 200:\n1. Check server logs for 4xx/5xx errors\n2. Verify the URL exists and is routable\n3. Fix any misconfigured redirects\n4. Restart services if needed`,
  },
  not_html: {
    title: "Response not valid HTML",
    impact: "MED",
    effortMinutes: 10,
    category: "Technical",
    whyItMatters: "Search engines need HTML to understand your page. Ensure the URL returns proper HTML content.",
    manualSteps: [
      "Verify the URL serves HTML, not JSON or PDF",
      "Check Content-Type header is text/html",
      "Ensure the page isn't behind auth or blocked",
      "Fix any server misconfigurations",
    ],
    aiFixPreview: "Ensure the URL returns valid HTML content.",
    aiFixFull: `Ensure the URL returns HTML:\n1. Content-Type should be text/html\n2. Response body should contain valid HTML\n3. If it's an API endpoint, use a different URL for the page`,
  },
  img_alt: {
    title: "Images missing alt attributes",
    impact: "LOW",
    effortMinutes: 10,
    category: "Accessibility",
    whyItMatters: "Alt text helps image SEO and accessibility. Describe each image concisely with relevant keywords.",
    manualSteps: [
      'Add alt="..." to every <img> tag',
      "Describe the image concisely",
      "Use relevant keywords where natural",
      "Use empty alt for decorative images",
    ],
    aiFixPreview: 'Add alt="..." to all <img> tags for accessibility and SEO.',
    aiFixFull: `Add alt attributes to images:\n<img src="image.jpg" alt="Descriptive text for the image">\n\nUse concise descriptions. Include keywords naturally. Use alt="" for purely decorative images.`,
    templateSnippet: 'alt="Descriptive text for the image"',
  },
  thin_content: {
    title: "Thin content detected",
    impact: "LOW",
    effortMinutes: 20,
    category: "Content",
    whyItMatters: "Pages with very little text may not rank. Aim for at least 150–300 words of valuable content.",
    manualSteps: [
      "Expand page content to at least 150 words",
      "Add unique, valuable information",
      "Include relevant headings (H2, H3)",
      "Avoid thin or duplicate content",
    ],
    aiFixPreview: "Expand page content to at least 150 words with valuable information.",
    aiFixFull: `Improve content depth:\n1. Add at least 150–300 words of unique content\n2. Use headings (H2, H3) to structure the page\n3. Include relevant keywords naturally\n4. Add FAQs or helpful sections`,
  },
};

const GENERIC_FALLBACK: IssueContent = {
  title: "SEO improvement",
  impact: "MED",
  effortMinutes: 5,
  category: "General",
  whyItMatters: "Addressing this issue can improve your search visibility and user experience.",
  manualSteps: [
    "Review the audit details for the specific fix",
    "Apply the change to your page",
    "Re-run the audit to verify",
  ],
  aiFixPreview: "See the audit report for specific recommendations.",
  aiFixFull: "Check the audit report for full recommendations. Implement the suggested fix and re-run the audit.",
};

export function getIssueContent(issueId: string, rawTitle?: string): IssueContent {
  const id = String(issueId || "").toLowerCase();
  const base = CATALOG[id] ?? GENERIC_FALLBACK;

  if (rawTitle && base === GENERIC_FALLBACK) {
    return {
      ...GENERIC_FALLBACK,
      title: rawTitle,
    };
  }
  return base;
}
