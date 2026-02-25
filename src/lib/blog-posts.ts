export interface BlogPost {
  slug: string;
  title: string;
  subtitle: string;
  category: 'Technical SEO' | 'Case Study' | 'Strategy' | 'Tools';
  readingMinutes: number;
  publishedAt: string; // ISO date
  pullQuote: string;
  excerpt: string;
  content: string;
  featured: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'we-audited-rankypulse-with-rankypulse',
    title: 'We ran RankyPulse on RankyPulse',
    subtitle: "Here's what our own tool found — and what we fixed in 18 minutes",
    category: 'Case Study',
    readingMinutes: 4,
    publishedAt: '2026-02-25',
    pullQuote: 'An SEO tool with a missing meta description is like a dentist with bad teeth.',
    excerpt: "We found 3 issues we didn't know about. Fixed all 3 in 18 minutes. Score went from 68 to 91. Here's the exact breakdown.",
    featured: true,
    content: `
      When we launched RankyPulse, the first thing we did was run our own domain through it.

      We found three issues we genuinely hadn't noticed:

      **1. Missing meta description on the homepage**
      We had a title tag but no meta description. Google was auto-generating a snippet
      from our hero text — which started with "Enter your domain" and cut off mid-sentence.
      Fix: 5 minutes to write a proper 155-character description.

      **2. No structured data (Schema.org)**
      We weren't eligible for rich results in Google. No star ratings, no FAQ snippets,
      no sitelinks search box. This is free traffic we were leaving on the table.
      Fix: 8 minutes to add Organization and WebSite schema.

      **3. Missing og:image**
      Every time someone shared our link on Twitter or LinkedIn, they got a blank card.
      First impressions matter. Fix: 5 minutes to create and add an OG image.

      Score went from 68 to 91. Took 18 minutes total.

      The lesson: the cobbler's children have no shoes. Run your own site first.
    `,
  },
  {
    slug: 'canonical-tags-explained',
    title: 'Canonical tags: the most misunderstood 1 line of HTML',
    subtitle: "Why a single wrong canonical tag can silently cut your traffic in half",
    category: 'Technical SEO',
    readingMinutes: 6,
    publishedAt: '2026-02-20',
    pullQuote: "Most canonical tag mistakes aren't wrong — they're just pointing at the wrong version of \"right\".",
    excerpt: "Canonical tags tell Google which version of a URL is the \"real\" one. Get it wrong and you're splitting your PageRank between two versions of the same page.",
    featured: false,
    content: `
      A canonical tag looks like this:

      <link rel="canonical" href="https://yoursite.com/page" />

      It tells Google: "This is the real URL. If you find duplicates, credit this one."

      The problem most sites have isn't missing canonical tags — it's canonical tags
      pointing to the wrong URL. The most common mistake: your canonical says www.yoursite.com
      but Google indexes yoursite.com. You've just told Google that your preferred URL
      is different from the one it's indexing. PageRank gets split. Rankings drop.

      How to check yours: Open your homepage HTML, search for "canonical".
      Does the href match exactly what you see in your browser's address bar?
      If not — fix it.
    `,
  },
  {
    slug: 'why-your-seo-score-doesnt-matter',
    title: "Why your SEO score doesn't matter",
    subtitle: 'And what does',
    category: 'Strategy',
    readingMinutes: 3,
    publishedAt: '2026-02-15',
    pullQuote: "A score of 94 on a site no one visits is worthless. A score of 61 that's improving is everything.",
    excerpt: "Every SEO tool gives you a score. Most of them are meaningless. Here's what to track instead.",
    featured: false,
    content: `
      Scores are motivating. They're also mostly arbitrary.

      Different tools give the same site wildly different scores because they weight
      different factors differently. A score of 72 on Ahrefs means something completely
      different from a 72 on SEMrush.

      What actually matters: organic traffic trend, keyword position changes,
      and click-through rate from search results. These are real numbers
      that connect directly to revenue.

      Use scores as a starting point, not a destination. The goal is traffic — not 100.
    `,
  },
  {
    slug: 'lcp-fix-guide',
    title: "Your LCP is 4.2 seconds. Here's how to fix it in an afternoon.",
    subtitle: 'A practical guide to the single most impactful Core Web Vital',
    category: 'Technical SEO',
    readingMinutes: 8,
    publishedAt: '2026-02-10',
    pullQuote: "Google has been penalizing slow sites since 2021. Most site owners still haven't fixed it.",
    excerpt: "LCP (Largest Contentful Paint) is the most impactful Core Web Vital for rankings. Here's how to diagnose it, fix it, and verify the fix.",
    featured: false,
    content: `
      LCP measures how long it takes for the largest visible element on your page
      to load. Google's threshold: under 2.5 seconds is "good". Over 4 seconds is "poor".

      The most common culprits:

      **1. Hero images that aren't preloaded**
      Add a preload link tag in your HTML head. This alone typically cuts LCP by 0.5–1.5 seconds.

      **2. Render-blocking JavaScript in head**
      Move non-critical scripts to the bottom of the body, or add defer/async attributes.

      **3. No CDN (serving assets from a single origin server)**
      Use Cloudflare's free tier. It takes 15 minutes to set up and can cut load times in half.

      **4. Images not in WebP format**
      WebP is 25–35% smaller than JPEG/PNG. Most CMS platforms can convert automatically.

      The fastest win: add a preload link for your hero image.
      This alone typically cuts LCP by 0.5–1.5 seconds.
    `,
  },
];
