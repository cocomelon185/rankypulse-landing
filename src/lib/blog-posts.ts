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
  {
    slug: 'meta-description-guide',
    title: 'How to write a meta description that actually gets clicked',
    subtitle: 'The 155-character snippet that controls your click-through rate from Google',
    category: 'Technical SEO',
    readingMinutes: 5,
    publishedAt: '2026-02-08',
    pullQuote: "Your meta description is your ad in Google's search results. Most sites treat it like an afterthought.",
    excerpt: "Meta descriptions don't directly affect rankings — but they control whether anyone clicks on your result. Here's the formula that works.",
    featured: false,
    content: `
      Meta descriptions don't directly affect Google rankings. But they control click-through rate
      — which does affect rankings indirectly. A well-written description can double your organic
      clicks without changing your position at all.

      **The formula that works:**
      1. Lead with the outcome the user gets, not what your page is about
      2. Include the primary keyword naturally (Google bolds it in search results)
      3. End with a low-friction call to action ("See how", "Learn the fix", "Try free")
      4. Keep it under 155 characters — Google truncates anything longer

      **Bad example:**
      "Welcome to Acme Inc. We offer a wide range of software solutions for businesses of all sizes."

      **Good example:**
      "Cut your site's SEO issues in half with a free 30-second audit. No signup. See exactly what's blocking your rankings."

      The difference: the good version tells the user what they get, not what you sell.

      **What happens without one:**
      Google auto-generates a snippet from your page content. It usually starts with
      navigation text or a random sentence from your hero section — rarely your best pitch.

      Check every page. Fix the ones that are missing or auto-generated.
      It takes 3 minutes per page and can meaningfully lift traffic within weeks.
    `,
  },
  {
    slug: 'title-tag-optimization',
    title: 'Title tags: the 60-character decision that determines your ranking',
    subtitle: "Why most title tags are either too long, too short, or targeting the wrong thing",
    category: 'Technical SEO',
    readingMinutes: 6,
    publishedAt: '2026-02-05',
    pullQuote: "Your title tag is the single highest-ROI SEO element on your page. It's also the most commonly botched.",
    excerpt: "Title tags are the #1 on-page ranking factor. Here's the exact framework for writing them — including what to do when Google rewrites yours.",
    featured: false,
    content: `
      Title tags are the most impactful on-page SEO element you can control.
      They appear in three places: browser tabs, search results, and social shares.
      Get them wrong and you're leaving traffic on the table on every page of your site.

      **The rules:**
      - Target one primary keyword per page
      - Put the keyword as close to the front as possible
      - Keep the total length under 60 characters (Google truncates beyond that)
      - Include your brand name at the end, separated by a pipe or dash
      - Never duplicate title tags across pages

      **Template:**
      Primary Keyword — Supporting Context | Brand Name

      **Example:**
      "SEO Audit Tool — Free, Instant Results | RankyPulse"

      **The rewrite problem:**
      Google rewrites title tags it considers "keyword-stuffed", too long, or mismatched
      to the page's actual content. If you see Google showing different titles than yours
      in search results, it means your title tag isn't matching search intent well enough.
      The fix: make sure your title tag matches exactly what the page delivers.

      **Common mistakes:**
      1. Homepage title = company name only ("Acme Inc") — no keyword, no context
      2. Duplicate titles across all blog posts
      3. Titles over 70 characters that get cut off mid-word
      4. Keyword stuffing ("Best SEO Tool Free SEO Audit Free Website SEO Check")

      Audit every page's title tag. It's a 2-minute fix per page with measurable results.
    `,
  },
  {
    slug: 'internal-linking-strategy',
    title: 'Internal linking is free SEO. Almost nobody does it right.',
    subtitle: 'How to distribute PageRank across your site without spending a penny',
    category: 'Strategy',
    readingMinutes: 7,
    publishedAt: '2026-02-01',
    pullQuote: "Every backlink you earn distributes authority across your site — but only if your internal links let it flow.",
    excerpt: "Internal links pass PageRank between your pages. Done right, they can lift underperforming pages without any new content or backlinks. Here's how.",
    featured: false,
    content: `
      When Google crawls your site, it follows links. The more links pointing to a page
      — internal and external — the more authority that page accumulates.

      Most sites have a PageRank problem they don't know about: authority is pooled
      on the homepage and a few top posts, while valuable pages that could rank
      are starved of signals because nothing links to them.

      **The three-step internal linking audit:**

      **1. Find your orphaned pages**
      Pages with zero internal links pointing to them. Google finds them eventually,
      but they rank far below their potential. Run a crawl tool or search your own site
      for pages you can't reach by clicking from the homepage.

      **2. Find your high-authority pages**
      These are usually your homepage, your most-linked blog posts, and your pricing page.
      These pages have the most authority to give away.

      **3. Link from high-authority to underperforming**
      Add contextual links — naturally within body copy — from your strongest pages
      to the pages you want to rank better. Use descriptive anchor text, not "click here".

      **Anchor text matters:**
      "Learn more about our pricing" passes no keyword signal.
      "See our SEO audit pricing" passes the keyword "SEO audit pricing" to the linked page.

      **How many internal links per page?**
      There's no hard limit. The practical rule: link when it's genuinely useful to the reader.
      3–10 contextual links per long-form page is a reasonable range.

      This takes an afternoon to audit and fix. The payoff compounds over months.
    `,
  },
  {
    slug: 'redirect-chains-explained',
    title: 'Redirect chains are silently killing your PageRank',
    subtitle: 'What they are, how to find them, and how to fix them in under an hour',
    category: 'Technical SEO',
    readingMinutes: 5,
    publishedAt: '2026-01-28',
    pullQuote: "Every hop in a redirect chain leaks PageRank. A three-hop chain can cost you 15% of a page's authority.",
    excerpt: "A redirect chain is when URL A redirects to URL B which redirects to URL C. Each hop loses PageRank. Here's how to find and collapse them.",
    featured: false,
    content: `
      A redirect chain looks like this:

      yoursite.com/old-page → yoursite.com/redirect-1 → yoursite.com/final-page

      Each redirect hop leaks a small amount of PageRank. A two-hop chain loses roughly 10–15%.
      A three-hop chain can lose 20–25%. Multiply that across dozens of pages and you have
      a meaningful, invisible drag on your rankings.

      **How redirect chains happen:**
      Most commonly: you redirect a URL, then later redirect the destination again.
      The original redirect isn't updated to point directly to the final destination.

      **How to find them:**
      Run your site through a crawler like Screaming Frog, or use RankyPulse's audit.
      Look for any 301 that leads to another 301.

      **How to fix them:**
      Update the first redirect to point directly to the final destination.
      yoursite.com/old-page → yoursite.com/final-page (direct, one hop)

      **The rule:** every redirect should resolve in a single hop. No exceptions.

      **Bonus: check your homepage**
      The most common redirect chain on the internet:
      http://yoursite.com → https://yoursite.com → https://www.yoursite.com

      If your homepage requires two hops to reach the canonical version, fix that first.
      It affects every single page on your site.
    `,
  },
  {
    slug: 'schema-markup-beginners-guide',
    title: "Schema markup: the 20-minute fix that makes Google understand your site",
    subtitle: 'How structured data unlocks rich results — and why most sites skip it',
    category: 'Technical SEO',
    readingMinutes: 6,
    publishedAt: '2026-01-24',
    pullQuote: "Rich results (star ratings, FAQs, sitelinks) are free upgrades in Google's search results. Schema is the key.",
    excerpt: "Schema markup tells Google what your content means, not just what it says. It unlocks star ratings, FAQ snippets, and sitelinks in search results — for free.",
    featured: false,
    content: `
      Schema markup is structured data you add to your HTML that tells Google
      what your content means — not just what it says.

      Without schema: Google reads your page and guesses whether it's a product,
      an article, a local business, or a recipe.

      With schema: you tell Google exactly what it is, and Google can show
      enhanced "rich results" — star ratings, price ranges, FAQ dropdowns,
      event dates, breadcrumbs — directly in search results.

      **The types that matter most:**

      **Organization** — Tells Google your business name, logo, contact info, and social profiles.
      Every site should have this. Add it to your homepage.

      **WebSite** — Enables the sitelinks search box that appears under your brand name in search.

      **Article / BlogPosting** — Marks up your blog content. Helps with news carousels
      and "Top Stories" placement.

      **FAQPage** — Turns your FAQ section into expandable dropdowns directly in search results.
      One of the highest-CTR rich result types available.

      **Product** — Enables price, availability, and star rating display for e-commerce.

      **How to add it:**
      The easiest method: add a JSON-LD script tag to your page's HTML head.
      It doesn't touch your visible content at all.

      Example for Organization:
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Your Company",
        "url": "https://yoursite.com",
        "logo": "https://yoursite.com/logo.png"
      }

      Test it with Google's Rich Results Test tool after adding.
      Most schema implementations take 20–30 minutes. The results are permanent.
    `,
  },
  {
    slug: 'robots-txt-and-sitemap-guide',
    title: 'robots.txt and sitemaps: the two files Google reads before anything else',
    subtitle: "Get these wrong and Google might not index your site correctly — or at all",
    category: 'Technical SEO',
    readingMinutes: 5,
    publishedAt: '2026-01-20',
    pullQuote: "A misconfigured robots.txt is one of the most common causes of pages mysteriously disappearing from Google.",
    excerpt: "robots.txt tells Google what to crawl. Your sitemap tells it what exists. Both are critical, both are often broken. Here's the definitive quick-fix guide.",
    featured: false,
    content: `
      **robots.txt: the access control file**

      Located at yoursite.com/robots.txt — Google fetches this first, before crawling anything.

      The most dangerous mistake: accidental "Disallow: /" which blocks Google from
      crawling your entire site. This gets deployed more often than you'd think —
      usually when someone copies a development robots.txt to production.

      Check yours right now: visit yoursite.com/robots.txt in your browser.
      If you see "Disallow: /" under "User-agent: *" — you have a critical problem.

      A safe baseline robots.txt:
      User-agent: *
      Disallow: /admin/
      Disallow: /api/
      Sitemap: https://yoursite.com/sitemap.xml

      Block private pages (admin, API, staging). Allow everything else.

      **XML sitemaps: your site's table of contents**

      Your sitemap lists every URL you want Google to index. Without one, Google
      discovers your pages by following links — which means any page not linked
      from somewhere might never get indexed.

      What your sitemap should include:
      - Every public page (homepage, product pages, blog posts, landing pages)
      - Canonical URLs only (not paginated versions, not filter variants)
      - Last modified dates (helps Google prioritize re-crawling updated content)

      What to exclude:
      - Redirected URLs
      - Noindex pages
      - Duplicate content

      Submit your sitemap in Google Search Console under Sitemaps.
      Then check the "Coverage" report to see which pages Google has indexed.
    `,
  },
  {
    slug: 'broken-links-seo-impact',
    title: 'Broken links: small problem, surprisingly large SEO impact',
    subtitle: 'Why 404s hurt more than you think — and the 10-minute fix',
    category: 'Technical SEO',
    readingMinutes: 4,
    publishedAt: '2026-01-16',
    pullQuote: "Every broken internal link is a dead end for both users and Google's crawler. They accumulate silently.",
    excerpt: "404 errors don't just frustrate users — they waste your crawl budget and break the flow of PageRank through your site. Here's how to find and fix them fast.",
    featured: false,
    content: `
      When Google follows a link and gets a 404, two things happen:

      1. The crawl path ends — Google can't discover anything beyond that broken link
      2. Any PageRank that was flowing through that link is lost

      On small sites this is a minor issue. On sites with hundreds of pages, broken internal
      links can quietly starve entire sections from Google's attention.

      **The three types of broken links:**

      **Broken internal links** — Links within your own site pointing to pages that no longer exist.
      Usually caused by deleting or renaming pages without updating links.

      **Broken external links** — Links from your site to other sites that have moved or disappeared.
      These don't directly affect your rankings, but they hurt user experience and signal low quality.

      **Broken backlinks** — External sites linking to pages on your site that no longer exist.
      This is lost PageRank — often significant. Fix by 301 redirecting the dead URL to the
      closest live equivalent.

      **How to find them:**
      Run RankyPulse on your domain — broken links appear in the Technical Issues section.
      Or use Google Search Console → Coverage → Not Found (404) for a crawled list.

      **How to fix them:**
      - Internal links: update the link to point to the correct URL
      - Deleted pages with backlinks: 301 redirect to the closest relevant live page
      - Don't redirect everything to the homepage — Google sees through this

      Set a calendar reminder to run a broken link check monthly. Takes 10 minutes.
    `,
  },
  {
    slug: 'mobile-seo-checklist',
    title: 'Mobile SEO checklist: 8 things to fix before Friday',
    subtitle: "Google indexes the mobile version of your site first. Most sites fail on at least 3 of these.",
    category: 'Strategy',
    readingMinutes: 6,
    publishedAt: '2026-01-12',
    pullQuote: "Mobile-first indexing has been Google's default since 2021. Your desktop rankings are determined by your mobile experience.",
    excerpt: "Google uses the mobile version of your site to determine rankings — for desktop too. Here are 8 mobile SEO issues that can be found and fixed this week.",
    featured: false,
    content: `
      Since 2021, Google has indexed the mobile version of your site first.
      If your mobile experience is broken, slow, or incomplete — your desktop rankings suffer too.

      Here are the 8 most common mobile SEO failures, in order of impact:

      **1. Missing viewport meta tag**
      Without it, mobile browsers render your page at desktop width and shrink it down.
      Fix: add <meta name="viewport" content="width=device-width, initial-scale=1"> to your HTML head.

      **2. Tap targets too small**
      Buttons and links under 48×48px are hard to tap accurately.
      Google flags these in Search Console under Mobile Usability.

      **3. Text too small to read without zooming**
      Base font size should be at least 16px on mobile. Smaller text forces users to pinch-zoom,
      which Google counts as a negative usability signal.

      **4. Content wider than screen**
      Horizontal scrolling is a strong mobile usability failure signal.
      Usually caused by images with fixed widths or CSS that doesn't account for small screens.

      **5. Slow mobile load time**
      Mobile connections are slower than desktop. A page that loads in 2 seconds on desktop
      may take 5+ seconds on 4G. Use WebP images, lazy loading, and a CDN.

      **6. Intrusive interstitials**
      Full-screen popups that appear immediately on mobile are penalized by Google.
      Banners, slide-ins, and small cookie notices are fine. Full-screen takeovers are not.

      **7. Mobile-only content being hidden**
      If your mobile version hides content that's visible on desktop, Google may not
      index that content — since it crawls your mobile version.

      **8. Different canonical tags on mobile vs desktop**
      Your mobile and desktop pages should have identical canonical tags.
      Dynamic serving and AMP pages have specific requirements — check Google's documentation.

      Check Google Search Console → Experience → Mobile Usability for your site's specific issues.
    `,
  },
  {
    slug: 'how-to-read-an-seo-audit',
    title: "How to read an SEO audit without getting overwhelmed",
    subtitle: 'A framework for turning 47 issues into a 3-item action list',
    category: 'Strategy',
    readingMinutes: 5,
    publishedAt: '2026-01-08',
    pullQuote: "The goal of an SEO audit isn't to fix everything. It's to find the 3 fixes that will move the needle this week.",
    excerpt: "Most SEO audits return dozens of issues. Here's the exact framework for triaging them by impact, filtering out noise, and building a realistic action plan.",
    featured: false,
    content: `
      You run an SEO audit and get 47 issues. Congratulations — you're now paralyzed.

      This is the most common response to an audit, and it leads to one of two outcomes:
      fixing everything superficially, or fixing nothing at all.

      Here's a better framework.

      **Step 1: Sort by impact, not by count**

      Not all issues are equal. A missing canonical tag on your homepage is worth
      50 missing alt texts on product images. Triage ruthlessly:

      - Critical: issues that directly prevent indexing or ranking (broken robots.txt,
        redirect chains on main pages, missing canonical, crawl errors)
      - High: issues that suppress rankings on important pages (missing title tags,
        no schema, slow LCP on key pages)
      - Medium: issues that improve existing rankings (meta descriptions, internal linking gaps)
      - Low: polish items that have marginal impact (alt text on decorative images, minor header hierarchy)

      **Step 2: Filter by page importance**

      A missing meta description on your pricing page matters 100x more than one
      on a blog post from 2019. Weight issues by the commercial importance of the page.

      **Step 3: Build a three-item list**

      From your critical and high buckets, pick the three issues that are:
      a) on your most important pages, and
      b) fixable this week

      Write those three down. Fix those three. Then re-audit.

      **Step 4: Ignore the noise**

      Some audit tools flag issues that have no meaningful impact on traffic or rankings.
      If you can't clearly explain how fixing something will lead to more clicks from Google — skip it.

      SEO is a long game. Consistent, prioritized fixes compound over time.
      Fixing 3 high-impact issues per month beats fixing 47 low-impact issues once.
    `,
  },
  {
    slug: 'page-speed-quick-wins',
    title: '5 page speed fixes you can ship before lunch',
    subtitle: 'No developer required. Each one takes under 30 minutes.',
    category: 'Technical SEO',
    readingMinutes: 5,
    publishedAt: '2026-01-04',
    pullQuote: "Page speed is both a ranking factor and a conversion factor. Fixing it pays double.",
    excerpt: "Page speed affects rankings, bounce rate, and conversion rate simultaneously. Here are 5 fixes that take under 30 minutes each and don't require a developer.",
    featured: false,
    content: `
      Slow pages hurt in three ways simultaneously: lower rankings, higher bounce rates,
      and lower conversion rates. A 1-second improvement in load time has been shown
      to increase conversions by 7% on average.

      Here are 5 fixes you can implement today — no developer required.

      **1. Enable compression (5 minutes)**
      Gzip or Brotli compression reduces HTML, CSS, and JavaScript file sizes by 60–80%.
      If you're on a managed host (Vercel, Netlify, Cloudflare Pages), this is already on.
      If you're on a VPS, add "gzip on;" to your nginx config or enable it in Apache's .htaccess.

      **2. Serve images in WebP (20 minutes)**
      WebP is 25–35% smaller than JPEG at the same visual quality.
      Most CMS plugins (Smush, ShortPixel for WordPress; Cloudflare Image Resizing) convert automatically.
      If you're on a static site, use a build-step tool like sharp.

      **3. Add lazy loading to images below the fold (10 minutes)**
      Add loading="lazy" to every img tag that isn't in the first visible screen.
      This is a single HTML attribute. It tells the browser not to load these images until
      the user scrolls near them. Cuts initial page weight by 30–60% on image-heavy pages.

      **4. Move third-party scripts to load asynchronously (15 minutes)**
      Analytics, chat widgets, and marketing tags that load synchronously in your HTML head
      block everything else from rendering. Add async or defer attribute to each script tag.
      Exception: scripts that must run before page paint (rare).

      **5. Set cache headers for static assets (10 minutes)**
      Tell browsers to cache your CSS, JS, and image files for 1 year.
      Add Cache-Control: public, max-age=31536000 to your server response headers for static files.
      On Vercel or Netlify, add this to your framework config or headers file.

      After implementing, test with Google PageSpeed Insights.
      Most sites see a 15–30 point score improvement from these five fixes alone.
    `,
  },
];
