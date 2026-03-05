// ─── RankyPulse Mock Data ──────────────────────────────────────────────────
// Central mock data store for all app pages. Replace with real API calls
// as features are built out.

export const MOCK_PROJECTS = [
    {
        id: "1",
        domain: "acmecorp.com",
        createdAt: "2026-01-10",
        lastAuditAt: "2026-03-04T18:30:00Z",
        pagesCrawled: 324,
        score: 82,
        errors: 12,
        warnings: 34,
        notices: 58,
        status: "live" as const,
        tag: "Client",
    },
    {
        id: "2",
        domain: "shopify-store.io",
        createdAt: "2026-02-01",
        lastAuditAt: "2026-03-03T09:15:00Z",
        pagesCrawled: 1248,
        score: 61,
        errors: 47,
        warnings: 112,
        notices: 203,
        status: "live" as const,
        tag: "E-Commerce",
    },
    {
        id: "3",
        domain: "myblog.dev",
        createdAt: "2026-02-15",
        lastAuditAt: "2026-03-01T14:00:00Z",
        pagesCrawled: 87,
        score: 91,
        errors: 2,
        warnings: 8,
        notices: 21,
        status: "live" as const,
        tag: "Personal",
    },
    {
        id: "4",
        domain: "startup-landing.com",
        createdAt: "2026-03-01",
        lastAuditAt: "2026-03-04T20:00:00Z",
        pagesCrawled: 42,
        score: 48,
        errors: 28,
        warnings: 56,
        notices: 14,
        status: "warning" as const,
        tag: "Client",
    },
];

export const MOCK_AUDIT_ISSUES = [
    {
        id: "1",
        domain: "acmecorp.com",
        category: "Technical",
        severity: "error" as const,
        title: "Missing meta descriptions",
        description:
            "Pages without meta descriptions miss out on click-through rate optimization. Search engines may auto-generate poor snippets.",
        impactScore: 92,
        effort: "Low" as const,
        affectedCount: 48,
        affectedUrls: [
            "https://acmecorp.com/products",
            "https://acmecorp.com/services",
            "https://acmecorp.com/about",
        ],
    },
    {
        id: "2",
        domain: "acmecorp.com",
        category: "Links",
        severity: "error" as const,
        title: "Broken internal links",
        description:
            "Internal links returning 404 damage crawl budget and user experience. Fix or redirect these URLs immediately.",
        impactScore: 88,
        effort: "Medium" as const,
        affectedCount: 19,
        affectedUrls: [
            "https://acmecorp.com/old-page",
            "https://acmecorp.com/deleted-product",
        ],
    },
    {
        id: "3",
        domain: "acmecorp.com",
        category: "Performance",
        severity: "warning" as const,
        title: "Images without alt text",
        description:
            "Alt text is critical for accessibility and image SEO. Missing alt attributes reduce ranking potential.",
        impactScore: 74,
        effort: "Low" as const,
        affectedCount: 67,
        affectedUrls: [
            "https://acmecorp.com/gallery",
            "https://acmecorp.com/team",
        ],
    },
    {
        id: "4",
        domain: "acmecorp.com",
        category: "Content",
        severity: "warning" as const,
        title: "Duplicate H1 tags",
        description:
            "Multiple H1 tags confuse search engines about page topic priority and dilute keyword signals.",
        impactScore: 68,
        effort: "Low" as const,
        affectedCount: 12,
        affectedUrls: ["https://acmecorp.com/blog/post-1"],
    },
    {
        id: "5",
        domain: "acmecorp.com",
        category: "Indexing",
        severity: "notice" as const,
        title: "Pages blocked by robots.txt",
        description:
            "Some valuable pages may be blocked from indexing. Review robots.txt directives.",
        impactScore: 45,
        effort: "Low" as const,
        affectedCount: 8,
        affectedUrls: ["https://acmecorp.com/staging"],
    },
];

export const MOCK_TASKS = [
    {
        id: "t1",
        domain: "acmecorp.com",
        issueId: "1",
        title: "Add meta descriptions to 48 pages",
        status: "todo" as const,
        impactScore: 92,
        effort: "Low" as const,
        category: "Technical",
        severity: "error" as const,
        progress: 0,
        createdAt: "2026-03-01",
        updatedAt: "2026-03-04",
    },
    {
        id: "t2",
        domain: "acmecorp.com",
        issueId: "2",
        title: "Fix 19 broken internal links",
        status: "in_progress" as const,
        impactScore: 88,
        effort: "Medium" as const,
        category: "Links",
        severity: "error" as const,
        progress: 42,
        createdAt: "2026-03-02",
        updatedAt: "2026-03-04",
    },
    {
        id: "t3",
        domain: "acmecorp.com",
        issueId: "3",
        title: "Add alt text to 67 images",
        status: "todo" as const,
        impactScore: 74,
        effort: "Low" as const,
        category: "Performance",
        severity: "warning" as const,
        progress: 0,
        createdAt: "2026-03-02",
        updatedAt: "2026-03-04",
    },
    {
        id: "t4",
        domain: "shopify-store.io",
        issueId: "4",
        title: "Fix duplicate H1 tags",
        status: "done" as const,
        impactScore: 68,
        effort: "Low" as const,
        category: "Content",
        severity: "warning" as const,
        progress: 100,
        createdAt: "2026-02-20",
        updatedAt: "2026-03-03",
    },
];

export const MOCK_KEYWORDS = [
    { keyword: "seo audit tool", volume: 18500, difficulty: 62, intent: "Commercial", position: 14, change: 3, cpc: "$2.40" },
    { keyword: "free website audit", volume: 12200, difficulty: 45, intent: "Informational", position: 8, change: -1, cpc: "$1.80" },
    { keyword: "technical seo checker", volume: 8900, difficulty: 58, intent: "Commercial", position: null, change: 0, cpc: "$3.20" },
    { keyword: "site speed test", volume: 74000, difficulty: 72, intent: "Informational", position: 22, change: 5, cpc: "$0.90" },
    { keyword: "backlink analysis tool", volume: 9400, difficulty: 65, intent: "Commercial", position: null, change: 0, cpc: "$4.10" },
    { keyword: "rank tracker software", volume: 6800, difficulty: 55, intent: "Commercial", position: 31, change: -2, cpc: "$5.50" },
    { keyword: "meta description checker", volume: 4200, difficulty: 38, intent: "Informational", position: 5, change: 2, cpc: "$1.20" },
    { keyword: "keyword research tool free", volume: 22000, difficulty: 68, intent: "Commercial", position: null, change: 0, cpc: "$2.80" },
    { keyword: "website seo score", volume: 15600, difficulty: 52, intent: "Informational", position: 11, change: 4, cpc: "$1.50" },
    { keyword: "crawl budget optimization", volume: 2100, difficulty: 34, intent: "Informational", position: 7, change: 1, cpc: "$2.10" },
];

export const MOCK_RANK_DATA = [
    { keyword: "seo audit tool", position: 14, change: 3, volume: 18500, url: "/features", device: "desktop" },
    { keyword: "free website audit", position: 8, change: -1, volume: 12200, url: "/", device: "desktop" },
    { keyword: "meta description checker", position: 5, change: 2, volume: 4200, url: "/tools/meta", device: "desktop" },
    { keyword: "website seo score", position: 11, change: 4, volume: 15600, url: "/audit", device: "desktop" },
    { keyword: "crawl budget optimization", position: 7, change: 1, volume: 2100, url: "/blog/crawl", device: "desktop" },
    { keyword: "site speed test", position: 22, change: 5, volume: 74000, url: "/tools/speed", device: "mobile" },
    { keyword: "rank tracker software", position: 31, change: -2, volume: 6800, url: "/features", device: "desktop" },
];

export const MOCK_BACKLINKS = [
    { domain: "techcrunch.com", dr: 92, links: 3, type: "dofollow", anchor: "SEO tool review", discovered: "2026-02-28", status: "active" },
    { domain: "seo-blog.net", dr: 48, links: 1, type: "dofollow", anchor: "free seo audit", discovered: "2026-02-25", status: "active" },
    { domain: "webdevtips.io", dr: 61, links: 5, type: "nofollow", anchor: "rankypulse", discovered: "2026-02-20", status: "active" },
    { domain: "spamsite.xyz", dr: 8, links: 12, type: "dofollow", anchor: "click here", discovered: "2026-01-15", status: "toxic" },
    { domain: "marketingweekly.com", dr: 74, links: 2, type: "dofollow", anchor: "website audit tools", discovered: "2026-01-10", status: "lost" },
    { domain: "startupresources.co", dr: 56, links: 1, type: "dofollow", anchor: "SEO tools for startups", discovered: "2026-03-01", status: "active" },
];

export const MOCK_COMPETITORS = [
    { domain: "semrush.com", score: 94, traffic: "8.4M", keywords: "142K", backlinks: "2.1M", overlap: "34%" },
    { domain: "ahrefs.com", score: 91, traffic: "5.2M", keywords: "98K", backlinks: "1.8M", overlap: "28%" },
    { domain: "moz.com", score: 85, traffic: "2.9M", keywords: "67K", backlinks: "890K", overlap: "22%" },
    { domain: "sitechecker.pro", score: 72, traffic: "420K", keywords: "18K", backlinks: "94K", overlap: "41%" },
    { domain: "seobility.net", score: 69, traffic: "310K", keywords: "14K", backlinks: "78K", overlap: "38%" },
];

export const MOCK_CONTENT_IDEAS = [
    { title: "Ultimate Technical SEO Checklist 2026", cluster: "Technical SEO", volume: 8900, difficulty: 42, intent: "Informational", status: "idea" },
    { title: "How to Fix Core Web Vitals in Next.js", cluster: "Performance", volume: 6200, difficulty: 38, intent: "Informational", status: "brief_ready" },
    { title: "Backlink Building Strategies for SaaS", cluster: "Link Building", volume: 4100, difficulty: 52, intent: "Informational", status: "idea" },
    { title: "Free vs Paid SEO Tools: 2026 Comparison", cluster: "Comparison", volume: 12400, difficulty: 65, intent: "Commercial", status: "published" },
    { title: "How to Do a Site Audit Step by Step", cluster: "Tutorials", volume: 9800, difficulty: 45, intent: "Informational", status: "idea" },
];

export const MOCK_INTEGRATIONS = [
    { name: "Google Search Console", id: "gsc", icon: "🔍", description: "Import keyword rankings, impressions, CTR, and index coverage data.", connected: true, lastSync: "2026-03-04T20:00:00Z", plan: "free" },
    { name: "Google Analytics 4", id: "ga4", icon: "📊", description: "Pull organic traffic, bounce rate, and goal conversion metrics.", connected: false, lastSync: null, plan: "free" },
    { name: "PageSpeed Insights", id: "psi", icon: "⚡", description: "Auto-fetch Core Web Vitals and Lighthouse scores per page.", connected: true, lastSync: "2026-03-04T18:30:00Z", plan: "free" },
    { name: "Slack Notifications", id: "slack", icon: "💬", description: "Get alerts when audits complete, issues spike, or rankings drop.", connected: false, lastSync: null, plan: "pro" },
    { name: "Email Reports", id: "email", icon: "📧", description: "Weekly automated PDF report delivered to your inbox.", connected: true, lastSync: "2026-03-03T08:00:00Z", plan: "pro" },
    { name: "Google Data Studio", id: "datastudio", icon: "📈", description: "Push your SEO metrics directly into Looker Studio dashboards.", connected: false, lastSync: null, plan: "pro" },
];

export const MOCK_HEALTH_TREND = [
    { month: "Oct", score: 64 },
    { month: "Nov", score: 71 },
    { month: "Dec", score: 68 },
    { month: "Jan", score: 75 },
    { month: "Feb", score: 78 },
    { month: "Mar", score: 82 },
];

export const MOCK_ACTIVITY = [
    { id: 1, type: "audit_complete", domain: "acmecorp.com", message: "Audit completed: 12 errors, 34 warnings", time: "2 hours ago", icon: "✅" },
    { id: 2, type: "issue_resolved", domain: "myblog.dev", message: "Fixed: Duplicate title tags on 5 pages", time: "5 hours ago", icon: "🔧" },
    { id: 3, type: "rank_change", domain: "shopify-store.io", message: "Ranking drop: 'best headphones' moved from #8 → #14", time: "1 day ago", icon: "📉" },
    { id: 4, type: "new_backlink", domain: "acmecorp.com", message: "New backlink from techcrunch.com (DR 92)", time: "2 days ago", icon: "🔗" },
    { id: 5, type: "audit_complete", domain: "startup-landing.com", message: "Audit completed: 28 errors detected", time: "4 days ago", icon: "⚠️" },
];

export const MOCK_RANK_VISIBILITY = [
    { month: "Oct", visibility: 12 },
    { month: "Nov", visibility: 16 },
    { month: "Dec", visibility: 14 },
    { month: "Jan", visibility: 19 },
    { month: "Feb", visibility: 23 },
    { month: "Mar", visibility: 28 },
];

export const MOCK_THEMATIC_SCORES = [
    { label: "Technical", score: 78, color: "#FF642D" },
    { label: "Content", score: 84, color: "#7B5CF5" },
    { label: "Performance", score: 71, color: "#00B0FF" },
    { label: "Links", score: 65, color: "#00C853" },
    { label: "Indexing", score: 90, color: "#FF9800" },
    { label: "Security", score: 95, color: "#06b6d4" },
    { label: "Structured Data", score: 58, color: "#E91E63" },
];
