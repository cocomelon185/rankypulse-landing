/**
 * /qa/crawler/seo-checks.ts
 *
 * SEO validation rules applied to crawled page HTML.
 *
 * Checks:
 * - Title (presence, length, uniqueness)
 * - Meta description (presence, length, uniqueness)
 * - H1 (exactly one, not empty)
 * - Canonical URL (present, self-referential or valid)
 * - Open Graph tags (og:title, og:description, og:image, og:type)
 * - Structured data (JSON-LD: WebPage, Organization, etc.)
 * - Soft 404 detection (200 status but 404 content)
 * - Redirect efficiency (no chain > 1 hop)
 * - Hreflang (if present, must be valid)
 * - Robots meta (noindex pages noted)
 * - Image alt text (images without alt attributes)
 * - Internal link anchor text quality
 */

export type IssueSeverity = "error" | "warn" | "info";

export interface SeoIssue {
  check: string;
  severity: IssueSeverity;
  message: string;
  detail?: string;
}

export interface PageSeoResult {
  path: string;
  url: string;
  statusCode: number;
  title: string | null;
  titleLength: number;
  metaDescription: string | null;
  metaDescriptionLength: number;
  h1Count: number;
  h1Text: string | null;
  canonical: string | null;
  isNoindex: boolean;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  hasJsonLd: boolean;
  imagesMissingAlt: number;
  isSoft404: boolean;
  issues: SeoIssue[];
  score: number; // 0-100
}

// ── HTML extraction helpers ───────────────────────────────────────────────────

function extractContent(html: string, regex: RegExp): string | null {
  const m = html.match(regex);
  return m ? (m[1] ?? m[2] ?? null)?.trim() ?? null : null;
}

function extractTitle(html: string): string | null {
  return extractContent(html, /<title[^>]*>([^<]*)<\/title>/i);
}

function extractMetaContent(html: string, name: string): string | null {
  // Handles name="" and property="" attributes
  const patterns = [
    new RegExp(
      `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${name}["']`,
      "i"
    ),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]) return m[1].trim();
  }
  return null;
}

function extractH1s(html: string): string[] {
  const results: string[] = [];
  const regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    // Strip inner tags to get text
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text) results.push(text);
  }
  return results;
}

function extractCanonical(html: string): string | null {
  const m = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  if (m) return m[1].trim();
  // Also try reversed attribute order
  const m2 = html.match(
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i
  );
  return m2 ? m2[1].trim() : null;
}

function extractRobotsDirective(html: string): string | null {
  return extractMetaContent(html, "robots");
}

function countImagesWithoutAlt(html: string): number {
  const allImages = (html.match(/<img[^>]+>/gi) ?? []).length;
  const imagesWithAlt = (html.match(/<img[^>]+alt=["'][^"']+["'][^>]*>/gi) ?? []).length;
  return allImages - imagesWithAlt;
}

function detectJsonLd(html: string): boolean {
  return /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
}

function detectSoft404(html: string, url: string): boolean {
  const lower = html.toLowerCase();
  const hasNotFound =
    lower.includes("page not found") ||
    lower.includes("404") ||
    lower.includes("this page doesn't exist") ||
    lower.includes("page cannot be found");
  // Only flag if URL doesn't contain "404" itself
  return hasNotFound && !url.includes("/404");
}

function detectHreflang(html: string): string[] {
  const results: string[] = [];
  const regex =
    /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    results.push(m[1]);
  }
  return results;
}

// ── SEO scoring ───────────────────────────────────────────────────────────────

function computeScore(issues: SeoIssue[]): number {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.filter((i) => i.severity === "warn").length;
  const base = 100;
  const score = base - errors * 15 - warns * 5;
  return Math.max(0, score);
}

// ── Main checker ──────────────────────────────────────────────────────────────

export function checkPageSeo(
  path: string,
  url: string,
  statusCode: number,
  html: string
): PageSeoResult {
  const issues: SeoIssue[] = [];

  // Extract elements
  const title = extractTitle(html);
  const titleLength = title?.length ?? 0;
  const metaDescription = extractMetaContent(html, "description");
  const metaDescriptionLength = metaDescription?.length ?? 0;
  const h1s = extractH1s(html);
  const h1Text = h1s[0] ?? null;
  const canonical = extractCanonical(html);
  const robotsContent = extractRobotsDirective(html);
  const isNoindex =
    robotsContent?.toLowerCase().includes("noindex") ?? false;
  const ogTitle = extractMetaContent(html, "og:title");
  const ogDescription = extractMetaContent(html, "og:description");
  const ogImage = extractMetaContent(html, "og:image");
  const hasJsonLd = detectJsonLd(html);
  const imagesMissingAlt = countImagesWithoutAlt(html);
  const isSoft404 = detectSoft404(html, url);
  const hreflangs = detectHreflang(html);

  // ── Title checks ────────────────────────────────────────────────────────────
  if (!title) {
    issues.push({
      check: "title",
      severity: "error",
      message: "Page is missing a <title> tag",
    });
  } else if (titleLength < 10) {
    issues.push({
      check: "title-too-short",
      severity: "error",
      message: `Title is too short (${titleLength} chars)`,
      detail: "Titles should be 50-60 characters for best SEO",
    });
  } else if (titleLength < 30) {
    issues.push({
      check: "title-short",
      severity: "warn",
      message: `Title is short (${titleLength} chars)`,
      detail: "Titles should ideally be 50-60 characters",
    });
  } else if (titleLength > 70) {
    issues.push({
      check: "title-too-long",
      severity: "warn",
      message: `Title is too long (${titleLength} chars, Google truncates at ~60)`,
      detail: title,
    });
  }

  // ── Meta description checks ─────────────────────────────────────────────────
  if (!metaDescription) {
    issues.push({
      check: "meta-description",
      severity: "warn",
      message: "Page is missing meta description",
      detail: "Meta descriptions improve click-through rates in SERPs",
    });
  } else if (metaDescriptionLength < 50) {
    issues.push({
      check: "meta-description-too-short",
      severity: "warn",
      message: `Meta description is too short (${metaDescriptionLength} chars)`,
      detail: "Optimal is 150-160 characters",
    });
  } else if (metaDescriptionLength > 170) {
    issues.push({
      check: "meta-description-too-long",
      severity: "warn",
      message: `Meta description is too long (${metaDescriptionLength} chars, truncated at ~155)`,
    });
  }

  // ── H1 checks ───────────────────────────────────────────────────────────────
  if (h1s.length === 0) {
    issues.push({
      check: "h1-missing",
      severity: "error",
      message: "Page has no H1 heading",
      detail: "Every page should have exactly one H1",
    });
  } else if (h1s.length > 1) {
    issues.push({
      check: "h1-multiple",
      severity: "warn",
      message: `Page has ${h1s.length} H1 headings (should have exactly 1)`,
      detail: `H1 texts: ${h1s.slice(0, 3).join(" | ")}`,
    });
  }

  // ── Canonical checks ────────────────────────────────────────────────────────
  if (!canonical) {
    issues.push({
      check: "canonical-missing",
      severity: "warn",
      message: "Page has no canonical URL",
      detail: "Add <link rel='canonical'> to prevent duplicate content issues",
    });
  }

  // ── Noindex detection ───────────────────────────────────────────────────────
  if (isNoindex) {
    issues.push({
      check: "noindex",
      severity: "info",
      message: "Page has robots noindex directive",
      detail: robotsContent ?? undefined,
    });
  }

  // ── Open Graph tags ─────────────────────────────────────────────────────────
  if (!ogTitle) {
    issues.push({
      check: "og-title-missing",
      severity: "warn",
      message: "Missing og:title meta tag",
      detail: "OG tags improve social media sharing appearance",
    });
  }
  if (!ogDescription) {
    issues.push({
      check: "og-description-missing",
      severity: "warn",
      message: "Missing og:description meta tag",
    });
  }
  if (!ogImage) {
    issues.push({
      check: "og-image-missing",
      severity: "warn",
      message: "Missing og:image meta tag",
      detail: "Social shares with images have higher engagement",
    });
  }

  // ── Structured data ─────────────────────────────────────────────────────────
  if (!hasJsonLd) {
    issues.push({
      check: "structured-data",
      severity: "info",
      message: "No JSON-LD structured data found",
      detail: "Structured data can enable rich results in Google",
    });
  }

  // ── Soft 404 detection ──────────────────────────────────────────────────────
  if (isSoft404) {
    issues.push({
      check: "soft-404",
      severity: "error",
      message: "Soft 404: page returns 200 but appears to be a 404",
      detail: "Google may deindex soft 404 pages",
    });
  }

  // ── Image alt text ─────────────────────────────────────────────────────────
  if (imagesMissingAlt > 0) {
    issues.push({
      check: "images-missing-alt",
      severity: "warn",
      message: `${imagesMissingAlt} image(s) missing alt text`,
      detail: "Alt text is required for accessibility and SEO",
    });
  }

  // ── Hreflang validation ─────────────────────────────────────────────────────
  if (hreflangs.length > 0) {
    const invalid = hreflangs.filter(
      (lang) => !/^[a-z]{2}(-[A-Z]{2})?$/.test(lang) && lang !== "x-default"
    );
    if (invalid.length > 0) {
      issues.push({
        check: "hreflang-invalid",
        severity: "warn",
        message: `Invalid hreflang values: ${invalid.join(", ")}`,
        detail: "Hreflang must be valid BCP 47 language tags (e.g. en, en-US, x-default)",
      });
    }
  }

  const score = computeScore(issues);

  return {
    path,
    url,
    statusCode,
    title,
    titleLength,
    metaDescription,
    metaDescriptionLength,
    h1Count: h1s.length,
    h1Text,
    canonical,
    isNoindex,
    ogTitle,
    ogDescription,
    ogImage,
    hasJsonLd,
    imagesMissingAlt,
    isSoft404,
    issues,
    score,
  };
}

// ── Uniqueness checks (run after all pages crawled) ──────────────────────────

export interface UniquenessIssue {
  type: "duplicate-title" | "duplicate-meta-description";
  value: string;
  pages: string[];
}

export function findDuplicates(results: PageSeoResult[]): UniquenessIssue[] {
  const duplicates: UniquenessIssue[] = [];

  // Build frequency maps
  const titleMap = new Map<string, string[]>();
  const descMap = new Map<string, string[]>();

  results.forEach((r) => {
    if (r.title) {
      const t = r.title.toLowerCase().trim();
      if (!titleMap.has(t)) titleMap.set(t, []);
      titleMap.get(t)!.push(r.path);
    }
    if (r.metaDescription) {
      const d = r.metaDescription.toLowerCase().trim();
      if (!descMap.has(d)) descMap.set(d, []);
      descMap.get(d)!.push(r.path);
    }
  });

  titleMap.forEach((pages, value) => {
    if (pages.length > 1) {
      duplicates.push({ type: "duplicate-title", value, pages });
    }
  });

  descMap.forEach((pages, value) => {
    if (pages.length > 1) {
      duplicates.push({
        type: "duplicate-meta-description",
        value,
        pages,
      });
    }
  });

  return duplicates;
}

// ── Summary statistics ────────────────────────────────────────────────────────

export interface SeoSummary {
  totalPages: number;
  avgScore: number;
  pagesWithErrors: number;
  pagesWithWarnings: number;
  missingTitle: number;
  missingMetaDescription: number;
  missingH1: number;
  multipleH1: number;
  missingCanonical: number;
  noindexPages: number;
  missingOgImage: number;
  soft404s: number;
  imagesWithoutAlt: number;
  duplicateTitles: UniquenessIssue[];
  duplicateDescriptions: UniquenessIssue[];
}

export function summarizeSeoResults(results: PageSeoResult[]): SeoSummary {
  const duplicates = findDuplicates(results);
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);

  return {
    totalPages: results.length,
    avgScore: results.length > 0 ? Math.round(totalScore / results.length) : 0,
    pagesWithErrors: results.filter((r) =>
      r.issues.some((i) => i.severity === "error")
    ).length,
    pagesWithWarnings: results.filter((r) =>
      r.issues.some((i) => i.severity === "warn")
    ).length,
    missingTitle: results.filter((r) => !r.title).length,
    missingMetaDescription: results.filter((r) => !r.metaDescription).length,
    missingH1: results.filter((r) => r.h1Count === 0).length,
    multipleH1: results.filter((r) => r.h1Count > 1).length,
    missingCanonical: results.filter((r) => !r.canonical).length,
    noindexPages: results.filter((r) => r.isNoindex).length,
    missingOgImage: results.filter((r) => !r.ogImage).length,
    soft404s: results.filter((r) => r.isSoft404).length,
    imagesWithoutAlt: results.reduce((sum, r) => sum + r.imagesMissingAlt, 0),
    duplicateTitles: duplicates.filter((d) => d.type === "duplicate-title"),
    duplicateDescriptions: duplicates.filter(
      (d) => d.type === "duplicate-meta-description"
    ),
  };
}
