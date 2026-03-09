/**
 * /qa/crawler/crawl.ts
 *
 * Phase 2: SEO & Technical Crawl
 *
 * Orchestrates:
 * 1. Loads routes discovered in Phase 1 (routes-discovered.json)
 * 2. Fetches HTML for each public/crawlable route
 * 3. Runs SEO checks on each page
 * 4. Runs link checks on each page
 * 5. Outputs qa/artifacts/crawl-results.json + crawl-report.md
 */

import * as fs from "fs";
import * as path from "path";
import { checkPageSeo, summarizeSeoResults, type PageSeoResult } from "./seo-checks";
import {
  checkLinksOnPage,
  summarizeLinkResults,
  formatLinkIssues,
  type LinkCheckResult,
} from "./link-checker";
import { getCrawlableRoutes, MARKETING_ROUTES, AUTH_ROUTES } from "../config/routes";
import { getEnvironmentConfig } from "../config/environments";
import { SEO_THRESHOLDS } from "../config/thresholds";

const TIMEOUT_MS = 10000;

// ── Types ────────────────────────────────────────────────────────────────────

export interface CrawlPageResult {
  path: string;
  url: string;
  statusCode: number;
  crawledAt: string;
  seo: PageSeoResult;
  links?: LinkCheckResult[];
}

export interface CrawlResult {
  crawledAt: string;
  baseUrl: string;
  environment: string;
  totalPages: number;
  pagesWithErrors: number;
  pagesWithWarnings: number;
  avgSeoScore: number;
  seoSummary: ReturnType<typeof summarizeSeoResults>;
  linkSummary: ReturnType<typeof summarizeLinkResults>;
  pages: CrawlPageResult[];
  passed: boolean;
}

// ── Fetch HTML ────────────────────────────────────────────────────────────────

async function fetchHtml(
  url: string
): Promise<{ statusCode: number; html: string | null; error?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "RankyPulse-QA-Crawler/1.0", Accept: "text/html" },
      redirect: "follow",
      signal: controller.signal as AbortSignal,
    });

    clearTimeout(timeout);

    const html = await response.text();
    return { statusCode: response.status, html };
  } catch (err) {
    return {
      statusCode: 0,
      html: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ── Load Phase 1 routes ───────────────────────────────────────────────────────

function loadDiscoveredRoutes(
  artifactsDir: string
): Array<{ path: string; url: string }> | null {
  const filePath = path.join(artifactsDir, "routes-discovered.json");
  if (!fs.existsSync(filePath)) {
    console.warn(
      `⚠️  routes-discovered.json not found at ${filePath}. Run Phase 1 first.`
    );
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const discovery = JSON.parse(raw);
  return discovery.routes ?? [];
}

// ── Build URL list to crawl ───────────────────────────────────────────────────

function buildCrawlList(
  baseUrl: string,
  discoveredRoutes: Array<{ path: string; url: string }> | null
): Array<{ path: string; url: string }> {
  // Start with known public routes from config
  const knownPublic = [...MARKETING_ROUTES, ...AUTH_ROUTES]
    .filter((r) => r.crawlable !== false)
    .map((r) => ({ path: r.path, url: `${baseUrl}${r.path}` }));

  if (!discoveredRoutes) {
    return knownPublic;
  }

  // Merge: use discovered URLs (have real status codes), fall back to known
  const seen = new Set(knownPublic.map((r) => r.path));
  const combined = [...knownPublic];

  discoveredRoutes.forEach(({ path: p, url: u }) => {
    // Only crawl non-app, non-api, non-dynamic paths
    if (
      !p.startsWith("/app/") &&
      !p.startsWith("/api/") &&
      !p.includes("[") &&
      !seen.has(p)
    ) {
      seen.add(p);
      combined.push({ path: p, url: u });
    }
  });

  return combined;
}

// ── Main crawl function ───────────────────────────────────────────────────────

export async function runCrawl(baseUrl?: string): Promise<CrawlResult> {
  const env = getEnvironmentConfig();
  const resolvedBaseUrl = baseUrl ?? env.baseUrl;

  console.log(`\n🕷️  Starting SEO & Technical Crawl\n`);
  console.log(`   Environment: ${env.name}`);
  console.log(`   Base URL:    ${resolvedBaseUrl}\n`);

  const artifactsDir = path.join(process.cwd(), "qa/artifacts");
  fs.mkdirSync(artifactsDir, { recursive: true });

  // Build URL list
  const discoveredRoutes = loadDiscoveredRoutes(artifactsDir);
  const crawlList = buildCrawlList(resolvedBaseUrl, discoveredRoutes);

  console.log(`📋 Pages to crawl: ${crawlList.length}\n`);

  const seoResults: PageSeoResult[] = [];
  const allLinkResults: LinkCheckResult[] = [];
  const pages: CrawlPageResult[] = [];

  // Crawl each page
  for (let i = 0; i < crawlList.length; i++) {
    const { path: pagePath, url } = crawlList[i];
    process.stdout.write(
      `\r🌐 Crawling [${i + 1}/${crawlList.length}] ${pagePath.padEnd(50)}`
    );

    const { statusCode, html, error } = await fetchHtml(url);

    if (!html || error) {
      console.log(`\n   ❌ Failed to fetch ${pagePath}: ${error}`);
      continue;
    }

    // Run SEO checks
    const seo = checkPageSeo(pagePath, url, statusCode, html);

    // Run link checks (check internal links on all public pages)
    const links = await checkLinksOnPage(url, html, resolvedBaseUrl, false);
    allLinkResults.push(...links);

    seoResults.push(seo);
    pages.push({
      path: pagePath,
      url,
      statusCode,
      crawledAt: new Date().toISOString(),
      seo,
      links: links.length > 0 ? links : undefined,
    });

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log("\n");

  // Summarize
  const seoSummary = summarizeSeoResults(seoResults);
  const linkSummary = summarizeLinkResults(allLinkResults);

  // Determine pass/fail
  const passed =
    linkSummary.brokenLinks.length <= SEO_THRESHOLDS.brokenLinks &&
    seoSummary.missingTitle <= SEO_THRESHOLDS.missingTitle &&
    seoSummary.soft404s <= SEO_THRESHOLDS.softErrors;

  const result: CrawlResult = {
    crawledAt: new Date().toISOString(),
    baseUrl: resolvedBaseUrl,
    environment: env.name,
    totalPages: pages.length,
    pagesWithErrors: seoSummary.pagesWithErrors,
    pagesWithWarnings: seoSummary.pagesWithWarnings,
    avgSeoScore: seoSummary.avgScore,
    seoSummary,
    linkSummary,
    pages,
    passed,
  };

  return result;
}

// ── Save output ───────────────────────────────────────────────────────────────

export function saveCrawlResults(result: CrawlResult, artifactsDir: string): void {
  fs.mkdirSync(artifactsDir, { recursive: true });

  // Save JSON
  const jsonPath = path.join(artifactsDir, "crawl-results.json");
  const serializable = {
    ...result,
    linkSummary: {
      ...result.linkSummary,
      brokenLinks: result.linkSummary.brokenLinks,
      redirectChains: result.linkSummary.redirectChains,
    },
  };
  fs.writeFileSync(jsonPath, JSON.stringify(serializable, null, 2));

  // Save Markdown report
  const mdPath = path.join(artifactsDir, "crawl-report.md");
  fs.writeFileSync(mdPath, generateMarkdownReport(result));

  console.log(`✅ Saved crawl results to ${jsonPath}`);
  console.log(`✅ Saved crawl report to ${mdPath}`);
}

// ── Markdown report generator ─────────────────────────────────────────────────

function generateMarkdownReport(result: CrawlResult): string {
  const { seoSummary, linkSummary } = result;
  const statusIcon = result.passed ? "✅" : "❌";
  const lines: string[] = [];

  lines.push(`# RankyPulse SEO & Technical Crawl Report`);
  lines.push(`\n**Date**: ${new Date(result.crawledAt).toLocaleString()}`);
  lines.push(`**Environment**: ${result.environment}`);
  lines.push(`**Base URL**: ${result.baseUrl}`);
  lines.push(`**Status**: ${statusIcon} ${result.passed ? "PASSED" : "FAILED"}`);

  lines.push(`\n## Summary`);
  lines.push(`\n| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total pages crawled | ${result.totalPages} |`);
  lines.push(`| Average SEO score | ${result.avgSeoScore}/100 |`);
  lines.push(`| Pages with errors | ${result.pagesWithErrors} |`);
  lines.push(`| Pages with warnings | ${result.pagesWithWarnings} |`);

  lines.push(`\n## SEO Findings`);
  lines.push(`\n| Check | Count | Status |`);
  lines.push(`|-------|-------|--------|`);
  lines.push(`| Missing title | ${seoSummary.missingTitle} | ${seoSummary.missingTitle === 0 ? "✅" : "❌"} |`);
  lines.push(`| Missing meta description | ${seoSummary.missingMetaDescription} | ${seoSummary.missingMetaDescription <= 5 ? "⚠️" : "❌"} |`);
  lines.push(`| Missing H1 | ${seoSummary.missingH1} | ${seoSummary.missingH1 === 0 ? "✅" : "❌"} |`);
  lines.push(`| Multiple H1s | ${seoSummary.multipleH1} | ${seoSummary.multipleH1 === 0 ? "✅" : "⚠️"} |`);
  lines.push(`| Missing canonical | ${seoSummary.missingCanonical} | ${seoSummary.missingCanonical <= 2 ? "⚠️" : "❌"} |`);
  lines.push(`| Noindex pages | ${seoSummary.noindexPages} | ℹ️ |`);
  lines.push(`| Missing OG image | ${seoSummary.missingOgImage} | ${seoSummary.missingOgImage === 0 ? "✅" : "⚠️"} |`);
  lines.push(`| Soft 404s | ${seoSummary.soft404s} | ${seoSummary.soft404s === 0 ? "✅" : "❌"} |`);
  lines.push(`| Images without alt | ${seoSummary.imagesWithoutAlt} | ${seoSummary.imagesWithoutAlt < 10 ? "⚠️" : "❌"} |`);
  lines.push(`| Duplicate titles | ${seoSummary.duplicateTitles.length} | ${seoSummary.duplicateTitles.length === 0 ? "✅" : "⚠️"} |`);

  lines.push(`\n## Link Check`);
  lines.push(`\n| Metric | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total links checked | ${linkSummary.totalLinks} |`);
  lines.push(`| Internal links | ${linkSummary.internalLinks} |`);
  lines.push(`| External links (sampled) | ${linkSummary.externalLinks} |`);
  lines.push(`| **Broken links** | **${linkSummary.brokenLinks.length}** |`);
  lines.push(`| Redirect chains (>1 hop) | ${linkSummary.redirectChains.length} |`);
  lines.push(`| Empty hrefs | ${linkSummary.emptyHrefs} |`);

  if (linkSummary.brokenLinks.length > 0) {
    lines.push(`\n### Broken Links\n`);
    linkSummary.brokenLinks.forEach((l) => {
      lines.push(`- **[${l.statusCode || "ERR"}]** \`${l.targetUrl}\``);
      lines.push(`  - Found on: \`${l.sourceUrl}\``);
      lines.push(`  - Anchor: "${l.anchorText || "(none)"}"`);
      if (l.errorMessage) lines.push(`  - Error: ${l.errorMessage}`);
    });
  }

  if (seoSummary.duplicateTitles.length > 0) {
    lines.push(`\n### Duplicate Titles\n`);
    seoSummary.duplicateTitles.forEach((d) => {
      lines.push(`- **"${d.value}"** — found on:`);
      d.pages.forEach((p) => lines.push(`  - \`${p}\``));
    });
  }

  lines.push(`\n## Page-by-Page Results\n`);
  lines.push(`| Page | Score | Issues |`);
  lines.push(`|------|-------|--------|`);
  result.pages.forEach(({ path: p, seo }) => {
    const errorCount = seo.issues.filter((i) => i.severity === "error").length;
    const warnCount = seo.issues.filter((i) => i.severity === "warn").length;
    const statusText =
      errorCount > 0
        ? `${errorCount} errors, ${warnCount} warnings`
        : warnCount > 0
        ? `${warnCount} warnings`
        : "✅ Clean";
    lines.push(`| \`${p}\` | ${seo.score}/100 | ${statusText} |`);
  });

  lines.push(`\n---\n*Generated by RankyPulse QA System — Phase 2 SEO Crawl*`);

  return lines.join("\n");
}

// ── Print summary to console ──────────────────────────────────────────────────

export function printCrawlSummary(result: CrawlResult): void {
  const { seoSummary, linkSummary } = result;

  console.log("━".repeat(60));
  console.log(
    `${result.passed ? "✅" : "❌"}  SEO & Technical Crawl ${result.passed ? "PASSED" : "FAILED"}`
  );
  console.log("━".repeat(60));
  console.log(`\n📊 Results:\n`);
  console.log(`   Pages crawled:        ${result.totalPages}`);
  console.log(`   Average SEO score:    ${result.avgSeoScore}/100`);
  console.log(`   Pages with errors:    ${result.pagesWithErrors}`);
  console.log(`   Pages with warnings:  ${result.pagesWithWarnings}`);
  console.log(`\n🔍 SEO Issues:\n`);
  if (seoSummary.missingTitle > 0)
    console.log(`   ❌ Missing title:          ${seoSummary.missingTitle}`);
  if (seoSummary.missingH1 > 0)
    console.log(`   ❌ Missing H1:             ${seoSummary.missingH1}`);
  if (seoSummary.soft404s > 0)
    console.log(`   ❌ Soft 404s:              ${seoSummary.soft404s}`);
  if (seoSummary.missingMetaDescription > 0)
    console.log(`   ⚠️  Missing descriptions:  ${seoSummary.missingMetaDescription}`);
  if (seoSummary.missingCanonical > 0)
    console.log(`   ⚠️  Missing canonical:     ${seoSummary.missingCanonical}`);
  if (seoSummary.missingOgImage > 0)
    console.log(`   ⚠️  Missing OG image:      ${seoSummary.missingOgImage}`);
  if (seoSummary.imagesWithoutAlt > 0)
    console.log(`   ⚠️  Images without alt:   ${seoSummary.imagesWithoutAlt}`);
  if (seoSummary.noindexPages > 0)
    console.log(`   ℹ️  Noindex pages:         ${seoSummary.noindexPages}`);

  console.log(`\n🔗 Link Issues:\n`);
  if (linkSummary.brokenLinks.length > 0) {
    console.log(`   ❌ Broken links:           ${linkSummary.brokenLinks.length}`);
    linkSummary.brokenLinks.slice(0, 5).forEach((l) => {
      console.log(`      [${l.statusCode || "ERR"}] ${l.targetUrl}`);
    });
  } else {
    console.log(`   ✅ No broken links found`);
  }
  if (linkSummary.redirectChains.length > 0) {
    console.log(`   ⚠️  Redirect chains (>1 hop): ${linkSummary.redirectChains.length}`);
  }

  console.log("━".repeat(60));
}

// ── CLI entry point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const baseUrl = process.argv[2] || process.env.BASE_URL;
  const artifactsDir = path.join(process.cwd(), "qa/artifacts");

  runCrawl(baseUrl)
    .then((result) => {
      printCrawlSummary(result);
      saveCrawlResults(result, artifactsDir);
      process.exit(result.passed ? 0 : 1);
    })
    .catch((err) => {
      console.error("❌ Crawl failed:", err);
      process.exit(1);
    });
}
