export interface AuditData {
  domain: string;
  score: number;
  scoreHistory: { date: string; score: number }[];
  lastScanned: string;
  estimatedTrafficLoss: { min: number; max: number };
  confidence: "Low" | "Medium" | "High";
  categories: {
    name: string;
    score: number;
    benchmark: number;
  }[];
  issues: AuditIssueData[];
  competitors: {
    domain: string;
    score: number;
  }[];
  roadmap: {
    issueId: string;
    order: number;
    isLocked: boolean;
  }[];
}

export interface AuditIssueData {
  id: string;
  priority: "critical" | "high" | "medium" | "low" | "opportunity";
  status: "open" | "in-progress" | "fixed" | "locked";
  title: string;
  description: string;
  impact: string;
  trafficImpact: { min: number; max: number };
  timeEstimateMinutes: number;
  howToFix: string[];
  serpBefore: { title: string; url: string; description: string };
  serpAfter: { title: string; url: string; description: string };
  affectedPages?: string[];
  learnMoreUrl?: string;
  category: string;
}

export const MOCK_AUDIT: AuditData = {
  domain: "example.com",
  score: 75,
  scoreHistory: [
    { date: "2025-12-01", score: 62 },
    { date: "2026-01-05", score: 66 },
    { date: "2026-01-20", score: 70 },
    { date: "2026-02-10", score: 72 },
    { date: "2026-02-24", score: 75 },
  ],
  lastScanned: "2026-02-24T14:30:00Z",
  estimatedTrafficLoss: { min: 300, max: 1500 },
  confidence: "Medium",
  categories: [
    { name: "Technical SEO", score: 82, benchmark: 75 },
    { name: "Content", score: 54, benchmark: 68 },
    { name: "Performance", score: 38, benchmark: 55 },
    { name: "Mobile", score: 80, benchmark: 72 },
    { name: "UX Signals", score: 64, benchmark: 60 },
    { name: "Link Authority", score: 22, benchmark: 45 },
  ],
  issues: [
    {
      id: "redirect-chain",
      priority: "high",
      status: "fixed",
      title: "Redirect chain resolved",
      description:
        "A 3-hop redirect chain on /about was adding 1.2s latency and leaking PageRank at each hop. Googlebot was wasting crawl budget following the chain.",
      impact: "Crawl budget waste and 15% PageRank loss per hop",
      trafficImpact: { min: 50, max: 200 },
      timeEstimateMinutes: 5,
      howToFix: [
        "Open your .htaccess or server redirect config.",
        "Replace the chained redirects with a single 301 from the old URL to the final destination.",
        "Clear your CDN cache so the new rule takes effect.",
        "Re-crawl the URL in Google Search Console to confirm.",
      ],
      serpBefore: {
        title: "About Us - Example Site",
        url: "example.com/about-us → /about → /about-page",
        description: "Learn about our mission and values...",
      },
      serpAfter: {
        title: "About Us - Example Site",
        url: "example.com/about-page",
        description: "Learn about our mission and values...",
      },
      affectedPages: ["example.com/about-us"],
      category: "Technical SEO",
    },
    {
      id: "canonical-mismatch",
      priority: "high",
      status: "open",
      title: "Canonical points to non-preferred URL",
      description:
        'Your canonical tag points to the www version (www.example.com), but Google indexes the non-www version — splitting your PageRank between two "separate" sites.',
      impact: "Splitting PageRank between 2 URLs",
      trafficImpact: { min: 120, max: 600 },
      timeEstimateMinutes: 5,
      howToFix: [
        "Open your page's <head> section in your CMS or template.",
        'Change <link rel="canonical" href="https://www.example.com/" /> to <link rel="canonical" href="https://example.com/" />.',
        "Update internal links to use the non-www version consistently.",
        "Add a 301 redirect from www.example.com → example.com in your server config.",
        "Re-run the audit to verify the canonical matches your preferred URL.",
      ],
      serpBefore: {
        title: "Example Site - Home",
        url: "www.example.com",
        description: "No meta description provided — Google will auto-generate a snippet.",
      },
      serpAfter: {
        title: "Example Site - Products & Services",
        url: "example.com",
        description:
          "Discover our full range of products and services. Trusted by thousands of customers — get started today.",
      },
      affectedPages: [
        "example.com/",
        "example.com/products",
        "example.com/about",
      ],
      category: "Indexing",
    },
    {
      id: "meta-desc-missing",
      priority: "medium",
      status: "open",
      title: "Meta description missing on homepage",
      description:
        "Your homepage has no meta description. Google is auto-generating a snippet from page content, which is often awkward and cuts off mid-sentence — hurting your click-through rate.",
      impact:
        "CTR 15-30% lower than pages with crafted meta descriptions",
      trafficImpact: { min: 80, max: 400 },
      timeEstimateMinutes: 5,
      howToFix: [
        "Open your CMS or homepage template's <head> section.",
        'Add: <meta name="description" content="Discover our full range of products and services. Trusted by thousands — get started today." />',
        "Keep it between 140-160 characters with a clear call-to-action.",
        "Include your primary keyword naturally.",
        "Save, publish, and request re-indexing in Google Search Console.",
      ],
      serpBefore: {
        title: "Example Site",
        url: "example.com",
        description:
          "...Example Site provides a wide range of products and services for customers across the country, including...",
      },
      serpAfter: {
        title: "Example Site - Products & Services",
        url: "example.com",
        description:
          "Discover our full range of products and services. Trusted by thousands of customers — get started today.",
      },
      affectedPages: ["example.com/"],
      category: "Content",
    },
    {
      id: "structured-data-missing",
      priority: "medium",
      status: "open",
      title: "Missing structured data — not eligible for rich results",
      description:
        "Your site has no Schema.org markup. Without it, Google can't show rich snippets (star ratings, FAQs, events) — you're invisible in enhanced search results that competitors already occupy.",
      impact:
        "Missing rich results that competitors display in search",
      trafficImpact: { min: 50, max: 300 },
      timeEstimateMinutes: 15,
      howToFix: [
        "Choose the right Schema type for your pages: Organization for homepage, Product/Service for offerings.",
        "Add JSON-LD structured data to your <head> section.",
        "Test with Google's Rich Results Test tool (search.google.com/test/rich-results).",
        "Add FAQ schema to your most-asked-questions pages for instant FAQ rich snippets.",
        "Deploy and monitor in Search Console's Enhancements report.",
      ],
      serpBefore: {
        title: "Example Site - Products & Services",
        url: "example.com",
        description:
          "Discover our full range of products and services...",
      },
      serpAfter: {
        title: "Example Site - Products & Services ★★★★★",
        url: "example.com",
        description:
          "Discover our full range of products and services. Trusted by thousands.\n⭐ 4.8 (127 reviews) · Free shipping on orders over $50",
      },
      affectedPages: [
        "example.com/",
        "example.com/products",
        "example.com/about",
      ],
      learnMoreUrl: "https://developers.google.com/search/docs/appearance/structured-data",
      category: "Technical SEO",
    },
    {
      id: "image-optimization",
      priority: "low",
      status: "locked",
      title: "Unoptimized images increasing load time by 3.2s",
      description:
        "12 images lack width/height attributes causing layout shift (CLS 0.18), and 5 images are uncompressed PNGs that could be WebP — adding 3.2s to page load.",
      impact: "Core Web Vitals failing — CLS 0.18, LCP +3.2s",
      trafficImpact: { min: 40, max: 200 },
      timeEstimateMinutes: 20,
      howToFix: [
        "Add explicit width and height attributes to all <img> tags.",
        "Convert PNG/JPEG images to WebP format using tools like Squoosh.",
        "Implement lazy loading with loading='lazy' for below-the-fold images.",
        "Use responsive srcset for different viewport sizes.",
        "Consider a CDN with automatic image optimization (Cloudflare, imgix).",
      ],
      serpBefore: {
        title: "Example Site - Products",
        url: "example.com/products",
        description: "Browse our full product catalog...",
      },
      serpAfter: {
        title: "Example Site - Products",
        url: "example.com/products",
        description: "Browse our full product catalog...",
      },
      affectedPages: [
        "example.com/",
        "example.com/products",
        "example.com/gallery",
      ],
      category: "Performance",
    },
  ],
  competitors: [
    { domain: "competitor-a.com", score: 88 },
    { domain: "competitor-b.com", score: 71 },
    { domain: "competitor-c.com", score: 92 },
  ],
  roadmap: [
    { issueId: "redirect-chain", order: 1, isLocked: false },
    { issueId: "canonical-mismatch", order: 2, isLocked: false },
    { issueId: "meta-desc-missing", order: 3, isLocked: false },
    { issueId: "structured-data-missing", order: 4, isLocked: true },
    { issueId: "image-optimization", order: 5, isLocked: true },
  ],
};
