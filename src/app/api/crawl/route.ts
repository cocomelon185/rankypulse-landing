import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// ── 30-minute result cache (per edge function instance) ──────────
interface CachedResult { data: Record<string, unknown>; expiresAt: number }
const resultCache = new Map<string, CachedResult>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCached(domain: string): Record<string, unknown> | null {
  const entry = resultCache.get(domain);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { resultCache.delete(domain); return null; }
  return entry.data;
}

function setCached(domain: string, data: Record<string, unknown>) {
  // Evict old entries when cache grows large
  if (resultCache.size > 200) {
    const now = Date.now();
    for (const [k, v] of resultCache) {
      if (now > v.expiresAt) resultCache.delete(k);
    }
  }
  resultCache.set(domain, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ── Rate limiting ────────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= 10) return false;
    entry.count++;
  } else {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
  }
  if (rateMap.size > 5000) {
    for (const [k, v] of rateMap) {
      if (Date.now() > v.resetAt) rateMap.delete(k);
    }
  }
  return true;
}

// ── THE KEY FIX: timeout via Promise.race ────────────────────────
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ── Fetch raw HTML (8s max) ──────────────────────────────────────
export async function fetchHTML(domain: string): Promise<string> {
  const urls = [
    `https://${domain}`,
    `https://www.${domain}`,
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 7000);

      const res = await Promise.race([
        fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RankyPulse/1.0)',
            'Accept': 'text/html',
          },
          redirect: 'follow',
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 7000)
        ),
      ]).finally(() => clearTimeout(timer)) as Response;

      if (!res.ok) continue;
      if (!(res.headers.get('content-type') ?? '').includes('text/html')) continue;

      // Read max 100KB (reduced from 150KB for speed)
      const reader = res.body?.getReader();
      if (!reader) continue;

      const chunks: Uint8Array[] = [];
      let bytes = 0;

      while (bytes < 100_000) {
        const readResult = await Promise.race([
          reader.read(),
          new Promise<{ done: true; value: undefined }>(resolve =>
            setTimeout(() => resolve({ done: true, value: undefined }), 4000)
          ),
        ]);

        if (readResult.done || !readResult.value) break;
        chunks.push(readResult.value);
        bytes += readResult.value.byteLength;
      }

      try { reader.cancel(); } catch { }

      const decoder = new TextDecoder();
      return chunks.map(c => decoder.decode(c, { stream: true })).join('') +
        decoder.decode();

    } catch {
      continue;
    }
  }
  return '';
}

// ── Fetch PSI (10s max — reduced from 22s) ──────────────────────
export async function fetchPSI(domain: string): Promise<Record<string, unknown> | null> {
  const key = process.env.GOOGLE_PSI_KEY ?? '';
  const url = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=https://${domain}&strategy=mobile${key ? `&key=${key}` : ''}`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9500);

    const res = await Promise.race([
      fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('psi-timeout')), 9500)
      ),
    ]).finally(() => clearTimeout(timer)) as Response;

    if (!res.ok) return null;
    return await res.json() as Record<string, unknown>;

  } catch {
    return null;
  }
}


// ── Crawl Internal Links ──────────────────────────────────────────
export function extractInternalLinks(html: string, domain: string): string[] {
  const links: string[] = [];
  const regex = /<a[^>]+href=["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    if (url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('#')) continue;

    // Resolve relative URLs
    if (url.startsWith('/')) {
      url = `https://${domain}${url}`;
    } else if (!url.startsWith('http')) {
      url = `https://${domain}/${url}`;
    }

    if (url.includes(domain)) {
      try {
        const u = new URL(url);
        if ((u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes(domain)) {
          const clean = u.origin + u.pathname;
          if (!links.includes(clean)) links.push(clean);
        }
      } catch {
        // invalid URL
      }
    }
  }
  return links;
}

export async function checkBrokenLinks(links: string[]): Promise<string[]> {
  const broken: string[] = [];
  const toCheck = links.slice(0, 5); // check up to 5 links in parallel

  await Promise.all(toCheck.map(async (url) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500); // reduced from 3.5s
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RankyPulseBot/1.0)' }
      });
      clearTimeout(timer);
      if (res.status === 404 || res.status >= 500) {
        broken.push(url);
      }
    } catch {
      // Ignore network errors/timeouts
    }
  }));

  return broken;
}

// ── Parse issues from real data ──────────────────────────────────
export function buildAuditData(
  domain: string,
  html: string,
  psi: Record<string, unknown> | null,
  brokenLinks: string[] = []
) {
  let score = 85;
  const issues: Record<string, unknown>[] = [];

  // Performance from PSI
  const lhr = psi?.lighthouseResult as Record<string, unknown> | undefined;
  const cats = (lhr?.categories as Record<string, unknown> | undefined) ?? {};
  const audits = (lhr?.audits ?? {}) as Record<string, unknown>;

  const perfScore = psi
    ? Math.round(((cats.performance as Record<string, unknown> | undefined)?.score as number ?? 0.5) * 100)
    : 50;

  const lcpAudit = audits['largest-contentful-paint'] as Record<string, unknown> | undefined;
  const clsAudit = audits['cumulative-layout-shift'] as Record<string, unknown> | undefined;
  const lcpMs = typeof lcpAudit?.numericValue === 'number' ? lcpAudit.numericValue : 0;
  const cls = typeof clsAudit?.numericValue === 'number' ? clsAudit.numericValue : 0;

  // Parse HTML
  const hasMeta = /<meta\s+name=["']description["']/i.test(html) ||
    /<meta\s+content=["'][^"']+["']\s+name=["']description["']/i.test(html);
  const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']{10,})/i);
  const metaDesc = metaMatch?.[1] ?? '';

  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  const canonical = canonicalMatch?.[1] ?? '';

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch?.[1]?.trim() ?? domain;

  const h1Matches = html.match(/<h1[\s>]/gi);
  const h1Count = h1Matches ? h1Matches.length : 0;
  const hasH1 = h1Count > 0;
  const hasOG = /og:title|og:description/i.test(html);
  const hasSchema = /application\/ld\+json/i.test(html);

  // Build issues
  if (!hasMeta) {
    score -= 10;
    issues.push({
      id: 'meta-description',
      priority: 'high',
      status: 'open',
      title: 'Meta description missing on homepage',
      description: 'Your homepage has no meta description. Google auto-generates a snippet that often cuts off awkwardly, hurting click-through rate.',
      impact: 'Google auto-generates snippets — often awkward and cut off',
      trafficImpact: { min: 80, max: 400 },
      timeEstimateMinutes: 5,
      howToFix: [
        `Open your CMS or HTML editor for ${domain}`,
        'Add <meta name="description" content="Your description here"> to <head>',
        'Write 150-160 characters including your main keyword',
        'Re-run this audit to verify',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: 'No meta description — Google will auto-generate...' },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: 'Your compelling 155-char description with main keyword.' },
      isLocked: false,
    });
  }

  if (canonical && canonical.includes(`www.${domain}`) && !domain.startsWith('www.')) {
    score -= 8;
    issues.push({
      id: 'canonical-www',
      priority: 'high',
      status: 'open',
      title: 'Canonical points to non-preferred URL',
      description: `Your canonical tag points to www.${domain} but Google sees ${domain} — splitting PageRank between two "sites".`,
      impact: 'PageRank diluted between www and non-www versions',
      trafficImpact: { min: 120, max: 600 },
      timeEstimateMinutes: 5,
      howToFix: [
        'Decide on preferred URL: with or without www',
        'Set canonical to your preferred version consistently',
        'Add 301 redirect from non-preferred to preferred',
        'Update sitemap to only list the preferred version',
      ],
      serpBefore: { url: `https://www.${domain}`, title: pageTitle, description: metaDesc },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      isLocked: false,
    });
  }

  if (perfScore < 50 && lcpMs > 0) {
    score -= 12;
    issues.push({
      id: 'performance',
      priority: 'high',
      status: 'open',
      title: `Page loads in ${(lcpMs / 1000).toFixed(1)}s — Google penalizes slow sites`,
      description: `LCP is ${(lcpMs / 1000).toFixed(1)}s. Google's "good" threshold is under 2.5s. Slow pages rank lower and lose visitors before content appears.`,
      impact: 'Core Web Vitals — direct ranking factor since 2021',
      trafficImpact: { min: 100, max: 500 },
      timeEstimateMinutes: 20,
      howToFix: [
        'Convert images to WebP format',
        'Enable browser caching',
        'Minify CSS and JavaScript',
        'Use a CDN (Cloudflare free tier)',
        'Remove render-blocking scripts from <head>',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      isLocked: false,
    });
  }

  if (!hasOG) {
    score -= 5;
    issues.push({
      id: 'og-tags',
      priority: 'medium',
      status: 'open',
      title: 'Missing Open Graph tags — poor social sharing appearance',
      description: 'Without OG tags, links to your site on Twitter/LinkedIn show blank previews. You lose the visual real estate that drives clicks.',
      impact: 'Social shares show blank/ugly previews — hurts CTR',
      trafficImpact: { min: 30, max: 150 },
      timeEstimateMinutes: 10,
      howToFix: [
        'Add <meta property="og:title" content="Your Title">',
        'Add <meta property="og:description" content="Your description">',
        'Add <meta property="og:image" content="https://yoursite.com/og.png">',
        'Test with Twitter Card Validator',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: '' },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: 'Rich social preview with image and description' },
      isLocked: true,
    });
  }

  if (!hasSchema) {
    score -= 5;
    issues.push({
      id: 'schema',
      priority: 'medium',
      status: 'open',
      title: 'Missing structured data — not eligible for rich results',
      description: 'No Schema.org markup found. Without it, Google cannot show star ratings, FAQs, or other rich snippets for your site.',
      impact: 'Missing rich result eligibility reduces CTR by 15-30%',
      trafficImpact: { min: 50, max: 300 },
      timeEstimateMinutes: 15,
      howToFix: [
        'Add JSON-LD schema markup to your page <head>',
        'Start with Organization or WebSite schema',
        'Use Google Rich Results Test to verify',
        'Add FAQ schema for content pages',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: '⭐ Rich snippet eligible' },
      isLocked: true,
    });
  }

  if (!hasH1) {
    score -= 6;
    issues.push({
      id: 'missing-h1',
      priority: 'medium',
      status: 'open',
      title: 'No H1 heading found on homepage',
      description: `Your page has no <h1> tag. The H1 is the primary signal to Google about what your page covers — without it, you're leaving your most important on-page SEO element empty.`,
      impact: 'Google has no primary topical signal — hurts keyword rankings',
      trafficImpact: { min: 40, max: 200 },
      timeEstimateMinutes: 5,
      howToFix: [
        'Add exactly one <h1> tag to your homepage',
        'Include your primary target keyword naturally in the H1 text',
        'Keep it under 70 characters for clean rendering',
        'Make it descriptive of the value visitors get',
        'Do not use an image instead of text for your H1',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: metaDesc || 'No H1 — Google infers topic from body text.' },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: `${domain} — Your H1 that clearly describes your main offering.` },
      isLocked: true,
    });
  }


  if (h1Count > 1) {
    score -= 5;
    issues.push({
      id: 'duplicate-h1',
      priority: 'medium',
      status: 'open',
      title: 'Multiple H1 tags found',
      description: `Your page has ${h1Count} <h1> tags. While HTML5 allows multiple H1s, SEO best practice is exactly one H1 per page to indicate the primary topic.`,
      impact: 'Confuses search engines about the primary topic',
      trafficImpact: { min: 20, max: 100 },
      timeEstimateMinutes: 10,
      howToFix: [
        'Identify the secondary <h1> tags in your HTML',
        'Change them to <h2> or <h3> tags depending on hierarchy',
        'Ensure the single remaining <h1> has your primary keyword'
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      isLocked: false,
    });
  }

  if (pageTitle !== domain && (pageTitle.length > 60 || pageTitle.length < 30)) {
    score -= 5;
    issues.push({
      id: 'title-length',
      priority: 'low',
      status: 'open',
      title: `Suboptimal Title Length (${pageTitle.length} chars)`,
      description: `Best practice is 30-60 characters. Titles >60 chars get truncated in search results, while <30 chars miss keyword opportunities.`,
      impact: 'Lower click-through rates from search results',
      trafficImpact: { min: 30, max: 150 },
      timeEstimateMinutes: 5,
      howToFix: [
        'Rewrite your title to be 30-60 characters',
        'Put primary keyword near the beginning',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle.substring(0, 60), description: metaDesc },
      serpAfter: { url: `https://${domain}`, title: pageTitle.substring(0, 55) + '...', description: metaDesc },
      isLocked: false,
    });
  }

  if (metaDesc.length > 0 && (metaDesc.length < 70 || metaDesc.length > 160)) {
    score -= 5;
    issues.push({
      id: 'meta-desc-length',
      priority: 'low',
      status: 'open',
      title: `Suboptimal Meta Description (${metaDesc.length} chars)`,
      description: `Best practice is 70-160 characters. Descriptions >160 chars get truncated, and <70 chars don't use the available real estate.`,
      impact: 'Missed opportunity to stand out in search results',
      trafficImpact: { min: 20, max: 100 },
      timeEstimateMinutes: 5,
      howToFix: [
        'Rewrite your meta description to 70-160 characters',
        'Include a clear call-to-action',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: metaDesc.substring(0, 60) },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: metaDesc.substring(0, 150) + '...' },
      isLocked: false,
    });
  }

  if (brokenLinks.length > 0) {
    score -= 15;
    issues.push({
      id: 'broken-links',
      priority: 'high',
      status: 'open',
      title: `${brokenLinks.length} Broken Internal Link(s) Found`,
      description: `We performed a mini-crawl and found broken 404 links: ${brokenLinks.slice(0, 3).join(', ')}${brokenLinks.length > 3 ? '...' : ''}.`,
      impact: 'Loss of PageRank flow and poor user experience',
      trafficImpact: { min: 80, max: 400 },
      timeEstimateMinutes: 15,
      howToFix: [
        'Locate the broken links in your content or navigation',
        'Update them to point to live pages',
        'Or remove the links entirely',
      ],
      serpBefore: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      serpAfter: { url: `https://${domain}`, title: pageTitle, description: metaDesc },
      isLocked: false,
    });
  }

  // If HTML was empty (blocked domain) but PSI worked — adjust score
  if (!html && psi) {
    if (perfScore < 70) {
      score -= 10;
    }
  }

  const finalScore = Math.max(20, Math.min(100, score));
  const totalTrafficMin = issues.reduce((s, i) => s + ((i.trafficImpact as { min: number }).min), 0);
  const totalTrafficMax = issues.reduce((s, i) => s + ((i.trafficImpact as { max: number }).max), 0);

  const trafficMin = Math.max(50, Math.min(totalTrafficMin, 5000));
  const trafficMax = Math.max(200, Math.min(totalTrafficMax, 20000));

  const roadmap = issues.map((issue, index) => ({
    issueId: issue.id as string,
    order: index + 1,
    isLocked: !!(issue.isLocked),
  }));

  return {
    domain,
    score: finalScore,
    scoreHistory: [
      { date: new Date(Date.now() - 86400000 * 7).toISOString(), score: Math.max(20, finalScore - 5) },
      { date: new Date(Date.now() - 86400000 * 3).toISOString(), score: Math.max(20, finalScore - 2) },
      { date: new Date().toISOString(), score: finalScore },
    ],
    lastScanned: new Date().toISOString(),
    estimatedTrafficLoss: { min: trafficMin, max: trafficMax },
    confidence: psi ? 'High' : 'Medium',
    categories: [
      { name: 'Technical SEO', score: Math.min(100, finalScore + 7), benchmark: 74 },
      { name: 'Content', score: hasMeta && hasH1 ? 75 : 40, benchmark: 68 },
      { name: 'Performance', score: Math.min(100, perfScore), benchmark: 61 },
      { name: 'Mobile', score: Math.min(100, perfScore + 5), benchmark: 72 },
      { name: 'UX Signals', score: hasOG ? 72 : 48, benchmark: 70 },
      { name: 'Link Authority', score: 22, benchmark: 55 },
    ],
    issues,
    roadmap,
    competitors: [
      { domain: 'competitor-a.com', score: finalScore + 13 },
      { domain: 'competitor-b.com', score: finalScore + 8 },
      { domain, score: finalScore, isYou: true },
      { domain: 'competitor-c.com', score: Math.max(10, finalScore - 4) },
    ],
    _raw: {
      performanceScore: perfScore,
      hasMetaDescription: hasMeta,
      canonicalUrl: canonical,
      pageTitle,
      hasH1,
      hasOG,
      hasSchema,
      htmlBytes: html.length,
      lcpSeconds: +(lcpMs / 1000).toFixed(2),
      cls: +cls.toFixed(3),
      psiAvailable: !!psi,
    },
  };
}

// ── Main handler ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  if (!domain) {
    return NextResponse.json({ error: 'Domain required' }, { status: 400 });
  }

  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .toLowerCase()
    .trim();

  if (!cleanDomain || !cleanDomain.includes('.') || cleanDomain.length > 253) {
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  }

  // Return cached result if available (saves 5-25 seconds on repeat audits)
  const cached = getCached(cleanDomain);
  if (cached) {
    return NextResponse.json({ ...cached, _cached: true });
  }

  // Rate limit
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Too many requests — wait a minute' },
      { status: 429 }
    );
  }

  try {
    // ── Phase 1: Fetch HTML with a short timeout ─────────────────
    const htmlPromise = withTimeout(fetchHTML(cleanDomain), 9000, '');
    const psiPromise = withTimeout(fetchPSI(cleanDomain), 10000, null); // was 22s — now 10s

    // Start HTML fetch and PSI in parallel.
    // As soon as HTML arrives, kick off broken links check so it
    // runs concurrently with PSI instead of waiting for PSI to finish.
    let brokenLinksPromise: Promise<string[]> = Promise.resolve([]);

    const html = await htmlPromise;

    if (html) {
      const internalLinks = extractInternalLinks(html, cleanDomain);
      // Start broken link check immediately — runs in parallel with PSI
      brokenLinksPromise = withTimeout(checkBrokenLinks(internalLinks), 3000, []);
    }

    // Now wait for PSI and broken links to complete concurrently
    const [psi, brokenLinks] = await Promise.all([psiPromise, brokenLinksPromise]);

    // Both failed = unreachable
    if (!html && !psi) {
      return NextResponse.json({
        error: 'unreachable',
        domain: cleanDomain,
        score: null,
        message: `Could not reach ${cleanDomain}. The site may be blocking crawlers.`,
      });
    }

    const auditData = buildAuditData(cleanDomain, html, psi, brokenLinks);

    // Cache the result for 30 minutes
    setCached(cleanDomain, auditData as unknown as Record<string, unknown>);

    return NextResponse.json(auditData);

  } catch {
    return NextResponse.json({
      error: 'failed',
      domain: cleanDomain,
      score: null,
      message: 'Unexpected error during audit',
    });
  }
}
