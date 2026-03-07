// Issue-specific content for client display: traffic impact, fix steps, and example fixes.
// Kept separate from dashboard-data.ts (which has server-only imports).
export const ISSUE_CONTENT: Record<string, {
    ctrImpact?: string;
    trafficGain?: string;
    fixSteps?: string[];
    exampleFix?: string;
}> = {
    no_meta_description: {
        ctrImpact: "−15–30% CTR without a compelling description",
        trafficGain: "+10–25% organic traffic when fixed",
        fixSteps: [
            "Open each affected page in your CMS",
            "Write a unique 120–160 character description with your primary keyword",
            "Include a clear call to action (e.g. 'Learn more', 'Get started')",
            "Publish and re-run the audit to verify",
        ],
        exampleFix: "RankyPulse helps businesses run automated SEO audits, fix technical issues, and improve search rankings.",
    },
    no_title: {
        ctrImpact: "Google auto-generates titles, reducing CTR by up to 40%",
        trafficGain: "+15–35% organic traffic when all pages have clear titles",
        fixSteps: [
            "Identify the primary keyword for each affected page",
            "Write a 30–60 character title with the keyword near the start",
            "Ensure each page has a unique title — no duplicates",
            "Add the <title> tag in <head> and re-crawl",
        ],
        exampleFix: "RankyPulse — Automated SEO Audit & Issue Tracking Tool",
    },
    broken_links: {
        ctrImpact: "Dead-end links increase bounce rate by 10–20%",
        trafficGain: "Fixing broken links retains crawl budget for productive pages",
        fixSteps: [
            "Review the broken link details listed below",
            "Update each broken link to the correct live URL, or remove it",
            "For deleted pages, set up a 301 redirect to the nearest relevant page",
            "Re-run the audit to confirm all links resolve",
        ],
        exampleFix: "Update the href to the correct live URL or add a 301 redirect from the old path.",
    },
    duplicate_title: {
        ctrImpact: "Duplicate titles dilute ranking signal — pages compete against each other",
        trafficGain: "Distinct titles help each page rank for its own keyword",
        fixSteps: [
            "List all pages sharing the same title",
            "Determine which page should own that keyword",
            "Rewrite other pages' titles to target distinct, relevant keywords",
            "Verify uniqueness and re-run the audit",
        ],
        exampleFix: "[Page Topic] — [Brand Name] | [Keyword Differentiator]",
    },
    robots_txt_blocked: {
        ctrImpact: "Google cannot index your site at all — zero organic traffic possible",
        trafficGain: "Removing the block restores full crawlability immediately",
        fixSteps: [
            "Open /robots.txt on your domain",
            "Find the 'Disallow: /' rule under 'User-agent: *'",
            "Remove or narrow that rule (e.g. only disallow /admin/)",
            "Submit a recrawl request in Google Search Console",
        ],
        exampleFix: "User-agent: *\nDisallow: /admin/\n# Remove the Disallow: / line if present",
    },
    orphan_page: {
        ctrImpact: "Orphan pages rarely rank — they receive no PageRank from other pages",
        trafficGain: "+5–15% indexed pages when internal links are added",
        fixSteps: [
            "Identify orphan pages from the affected URLs list",
            "Find topically related pages that could link to them",
            "Add an internal link in the body text or navigation of those related pages",
            "Consider adding orphan pages to your XML sitemap",
        ],
        exampleFix: "<a href='/your-page'>Learn more about [Topic]</a>",
    },
    canonical_mismatch: {
        ctrImpact: "Google may index the wrong URL variant, splitting ranking signal",
        trafficGain: "Correct canonicals consolidate authority to the intended URL",
        fixSteps: [
            "Check the canonical tag on each affected page",
            "Ensure the canonical href exactly matches the page's own URL",
            "Check for trailing slash inconsistencies (e.g. /page vs /page/)",
            "Re-run the audit to verify no mismatches remain",
        ],
        exampleFix: '<link rel="canonical" href="https://yourdomain.com/exact-page-url/" />',
    },
    redirect_chain: {
        ctrImpact: "Each redirect hop adds ~100ms latency and reduces link equity passed",
        trafficGain: "Eliminating chains reduces crawl budget waste",
        fixSteps: [
            "Identify the final destination URL of each redirect chain",
            "Update the original link to point directly to the final URL",
            "Remove intermediate redirect hops from your server config",
            "Verify each redirect resolves in a single hop",
        ],
        exampleFix: "Update original link to point directly to: /final-destination-url",
    },
    low_word_count: {
        ctrImpact: "Thin pages are rarely shown for competitive queries",
        trafficGain: "+10–40% long-tail ranking potential with expanded content",
        fixSteps: [
            "Open each affected page and review its existing content",
            "Add 200–500 words of useful, on-topic information",
            "Include the page's primary keyword naturally 2–3 times",
            "Add H2/H3 subheadings to structure the additional content",
        ],
        exampleFix: "Expand this section with an FAQ, use-case examples, or a how-it-works explanation (aim for 300+ words).",
    },
    keyword_cannibalization: {
        ctrImpact: "Competing pages split clicks — neither ranks as well as one authoritative page",
        trafficGain: "+20–50% ranking improvement when pages are merged or differentiated",
        fixSteps: [
            "Review affected pages and identify the shared keyword target",
            "Decide which page should be the canonical ranking page",
            "Either merge weaker pages into the stronger one (301 redirect), or differentiate keyword focus",
            "Add cross-links between pages that remain distinct",
        ],
        exampleFix: "Merge /page-a into /page-b with a 301 redirect, or differentiate by updating /page-a to target a related but distinct keyword.",
    },
    multiple_canonicals: {
        ctrImpact: "Conflicting canonical signals cause Google to ignore all of them",
        trafficGain: "A single canonical resolves ranking authority clearly",
        fixSteps: [
            "Search your page template for duplicate <link rel='canonical'> tags",
            "Remove all but the one correct canonical tag",
            "Verify the remaining canonical href matches the page URL",
            "Re-run the audit to confirm only one canonical per page",
        ],
        exampleFix: '<link rel="canonical" href="https://yourdomain.com/page/" />  <!-- Remove all other canonical tags -->',
    },
    robots_noindex: {
        ctrImpact: "Pages set to noindex are excluded from Google's index entirely",
        trafficGain: "Removing noindex restores full ranking potential for these pages",
        fixSteps: [
            "Confirm whether the page should actually be indexed",
            "Remove the 'noindex' directive from the robots meta tag or X-Robots-Tag header",
            "Submit the URL in Google Search Console for re-indexing",
            "Re-run the audit to verify the directive is gone",
        ],
    },
};
