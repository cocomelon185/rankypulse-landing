/**
 * /qa/crawler/route-discovery.ts
 *
 * Dynamically discovers all routes in RankyPulse by:
 * 1. Parsing sitemap.xml (static routes only, no dynamic params)
 * 2. Crawling HTML to find internal links
 * 3. Merging with known routes from config
 * 4. Detecting broken links and redirects
 *
 * Output: comprehensive route manifest for testing
 */

import * as fs from "fs";
import * as path from "path";
import { XMLParser } from "fast-xml-parser";
import { URL } from "url";

interface DiscoveredRoute {
  url: string;
  path: string;
  statusCode?: number;
  title?: string;
  isRedirect?: boolean;
  redirectTo?: string;
  isBroken?: boolean;
  errorMessage?: string;
  discoveredAt?: string;
}

interface RouteDiscoveryResult {
  discoveredAt: string;
  baseUrl: string;
  totalRoutes: number;
  routes: DiscoveredRoute[];
  brokenRoutes: DiscoveredRoute[];
  redirectChains: Map<string, string[]>;
}

const DEFAULT_BASE_URL = process.env.BASE_URL || "https://rankypulse.com";
const TIMEOUT = 5000; // 5s per request
const MAX_REDIRECTS = 5;

/**
 * Fetch with timeout and redirect tracking
 */
async function fetchWithRedirects(
  url: string,
  maxRedirects = MAX_REDIRECTS,
  redirectHistory: string[] = []
): Promise<{
  statusCode: number;
  html?: string;
  redirectTo?: string;
  error?: string;
}> {
  try {
    if (redirectHistory.length >= maxRedirects) {
      return {
        statusCode: 310,
        error: `Max redirects (${maxRedirects}) exceeded`,
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": "RankyPulse-QA-Bot/1.0" },
      redirect: "manual", // handle redirects ourselves
      signal: controller.signal as AbortSignal,
    });

    clearTimeout(timeout);

    // Handle redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        return { statusCode: response.status, error: "Redirect without location" };
      }
      return {
        statusCode: response.status,
        redirectTo: location,
      };
    }

    const html = await response.text();
    return { statusCode: response.status, html };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";
    return {
      statusCode: 0,
      error: errorMessage,
    };
  }
}

/**
 * Parse sitemap.xml and extract URLs
 */
async function parseSitemap(baseUrl: string): Promise<string[]> {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  try {
    const response = await fetch(sitemapUrl);
    if (!response.ok) {
      console.warn(`❌ Sitemap not found at ${sitemapUrl}`);
      return [];
    }

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const parsed = parser.parse(xml);

    const urls: string[] = [];
    if (parsed.urlset?.url) {
      const urlItems = Array.isArray(parsed.urlset.url)
        ? parsed.urlset.url
        : [parsed.urlset.url];
      urlItems.forEach((item: any) => {
        if (item.loc) urls.push(item.loc);
      });
    }
    return urls;
  } catch (err) {
    console.warn(`⚠️  Failed to parse sitemap: ${err}`);
    return [];
  }
}

/**
 * Extract links from HTML
 */
function extractLinksFromHtml(html: string, baseUrl: string): Set<string> {
  const links = new Set<string>();
  const hrefRegex = /href=["']([^"']+)["']/g;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    // Skip fragments, external links, anchors, javascript, etc.
    if (
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("http") // external
    ) {
      continue;
    }

    try {
      const url = new URL(href, baseUrl).toString();
      // Only keep same-origin links
      if (url.startsWith(baseUrl)) {
        links.add(url);
      }
    } catch {
      // Ignore malformed URLs
    }
  }

  return links;
}

/**
 * Normalize URL to path (remove query params, fragments, trailing slash on non-root)
 */
function urlToPath(url: string): string {
  try {
    const u = new URL(url);
    let path = u.pathname;
    if (path.endsWith("/") && path !== "/") {
      path = path.slice(0, -1);
    }
    return path;
  } catch {
    return url;
  }
}

/**
 * Main discovery function
 */
export async function discoverRoutes(
  baseUrl: string = DEFAULT_BASE_URL
): Promise<RouteDiscoveryResult> {
  console.log(`🔍 Discovering routes from ${baseUrl}...`);

  const discoveredRoutes = new Map<string, DiscoveredRoute>();
  const redirectChains = new Map<string, string[]>();
  const queue = new Set<string>();

  // Step 1: Get sitemap URLs
  console.log("📄 Parsing sitemap.xml...");
  const sitemapUrls = await parseSitemap(baseUrl);
  console.log(`✅ Found ${sitemapUrls.length} URLs in sitemap`);

  // Add sitemap URLs to queue
  sitemapUrls.forEach((url) => queue.add(url));

  // Also add common marketing routes
  const commonRoutes = [
    "/",
    "/features",
    "/pricing",
    "/docs",
    "/blog",
    "/contact",
    "/privacy",
    "/terms",
    "/auth/signin",
    "/auth/signup",
    "/auth/forgot-password",
    "/app/dashboard",
    "/app/projects",
    "/app/audit",
  ];
  commonRoutes.forEach((path) => {
    queue.add(`${baseUrl}${path}`);
  });

  console.log(
    `📋 Queue: ${queue.size} URLs to crawl (${sitemapUrls.length} from sitemap + common routes)`
  );

  // Step 2: Crawl each URL
  let processed = 0;
  for (const url of queue) {
    processed++;
    const pathStr = urlToPath(url);

    // Skip if already discovered
    if (discoveredRoutes.has(pathStr)) {
      continue;
    }

    process.stdout.write(
      `\r📡 Crawling [${processed}/${queue.size}] ${pathStr}`
    );

    const { statusCode, html, redirectTo, error } = await fetchWithRedirects(
      url
    );

    const route: DiscoveredRoute = {
      url,
      path: pathStr,
      statusCode,
    };

    if (error) {
      route.isBroken = true;
      route.errorMessage = error;
    } else if (redirectTo) {
      route.isRedirect = true;
      route.redirectTo = redirectTo;
      // Track redirect chain
      if (!redirectChains.has(pathStr)) {
        redirectChains.set(pathStr, []);
      }
      redirectChains.get(pathStr)!.push(redirectTo);
    } else if (statusCode === 404) {
      route.isBroken = true;
      route.errorMessage = "404 Not Found";
    } else if (statusCode === 200) {
      // Extract title and links
      if (html) {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          route.title = titleMatch[1].trim();
        }

        // Extract and queue new links (for non-app routes only, to avoid auth loops)
        if (!pathStr.startsWith("/app") && !pathStr.startsWith("/auth")) {
          const links = extractLinksFromHtml(html, baseUrl);
          links.forEach((link) => {
            if (!discoveredRoutes.has(urlToPath(link))) {
              queue.add(link);
            }
          });
        }
      }
    }

    discoveredRoutes.set(pathStr, route);

    // Rate limiting: 200ms between requests
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n");

  // Step 3: Compile results
  const routes = Array.from(discoveredRoutes.values());
  const brokenRoutes = routes.filter((r) => r.isBroken);

  const result: RouteDiscoveryResult = {
    discoveredAt: new Date().toISOString(),
    baseUrl,
    totalRoutes: routes.length,
    routes,
    brokenRoutes,
    redirectChains,
  };

  // Summary
  console.log("📊 Route Discovery Summary:");
  console.log(`   Total routes discovered: ${result.totalRoutes}`);
  console.log(`   Broken routes: ${brokenRoutes.length}`);
  console.log(`   Redirect chains: ${redirectChains.size}`);

  if (brokenRoutes.length > 0) {
    console.log("\n⚠️  Broken Routes:");
    brokenRoutes.forEach((route) => {
      console.log(
        `   ${route.path} → ${route.errorMessage || `HTTP ${route.statusCode}`}`
      );
    });
  }

  return result;
}

/**
 * Save discovery results to JSON file
 */
export function saveDiscoveryResults(
  result: RouteDiscoveryResult,
  outputPath: string = "qa/artifacts/routes-discovered.json"
): void {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const serializable = {
    ...result,
    redirectChains: Object.fromEntries(result.redirectChains),
  };

  fs.writeFileSync(outputPath, JSON.stringify(serializable, null, 2));
  console.log(`✅ Saved discovery results to ${outputPath}`);
}

/**
 * CLI entry point
 */
if (require.main === module) {
  const baseUrl = process.argv[2] || DEFAULT_BASE_URL;
  discoverRoutes(baseUrl)
    .then((result) => {
      saveDiscoveryResults(result);
      process.exit(result.brokenRoutes.length > 0 ? 1 : 0);
    })
    .catch((err) => {
      console.error("❌ Route discovery failed:", err);
      process.exit(1);
    });
}
