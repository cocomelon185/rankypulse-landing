/**
 * Lightweight audit engine: fetch HTML and run basic SEO checks.
 */

const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB
const FETCH_TIMEOUT_MS = 30_000;

export interface AuditIssue {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  category: string;
  detail?: string;
}

export interface AuditScores {
  seo: number;
  performance?: number;
  accessibility?: number;
}

export interface AuditResult {
  url: string;
  hostname: string;
  scores: AuditScores;
  issues: AuditIssue[];
  summary: {
    title?: string;
    metaDescription?: string;
    canonical?: string;
    h1Count: number;
    imagesWithAlt: number;
    imagesWithoutAlt: number;
    linkCount: number;
  };
}

function extractText(html: string, regex: RegExp): string | undefined {
  const m = html.match(regex);
  return m ? m[1].trim() : undefined;
}

export async function runAudit(url: string): Promise<AuditResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RankyPulse/1.0; +https://rankypulse.com)",
      },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error("URL did not return HTML");
    }

    const contentLength = parseInt(res.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_BODY_SIZE) {
      throw new Error("Response too large");
    }

    const h = await res.text();
    if (h.length > MAX_BODY_SIZE) {
      throw new Error("Response too large");
    }

    const title = extractText(h, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDesc =
      extractText(
        h,
        /<meta\s+[^>]*(?:name|property)=["'](?:description|og:description)["'][^>]*content=["']([^"']*)["']/i
      ) ||
      extractText(
        h,
        /<meta\s+[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["'](?:description|og:description)["']/i
      );
    const canonical =
      extractText(
        h,
        /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i
      ) ||
      extractText(
        h,
        /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["']/i
      );
    const h1Matches = h.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    const h1Count = h1Matches.length;
    const imgTags = h.match(/<img[^>]*>/gi) || [];
    let imagesWithAlt = 0;
    let imagesWithoutAlt = 0;
    for (const img of imgTags) {
      if (
        /alt\s*=\s*["'][^"']*["']/i.test(img) ||
        /alt\s*=\s*[\w-]+/i.test(img)
      ) {
        imagesWithAlt++;
      } else {
        imagesWithoutAlt++;
      }
    }
    const linkCount = (h.match(/<a\s+[^>]*href\s*=/gi) || []).length;

    const issues: AuditIssue[] = [];
    if (!title || !title.trim()) {
      issues.push({
        id: "missing_title",
        title: "Meta title missing",
        severity: "high",
        category: "SEO",
      });
    }
    if (!metaDesc || !metaDesc.trim()) {
      issues.push({
        id: "missing_meta_description",
        title: "Meta description missing",
        severity: "high",
        category: "SEO",
      });
    }
    if (!canonical || !canonical.trim()) {
      issues.push({
        id: "missing_canonical",
        title: "Canonical URL missing",
        severity: "medium",
        category: "SEO",
      });
    }
    if (h1Count === 0) {
      issues.push({
        id: "missing_h1",
        title: "No H1 heading found",
        severity: "high",
        category: "SEO",
      });
    } else if (h1Count > 1) {
      issues.push({
        id: "multiple_h1",
        title: `Multiple H1 headings (${h1Count})`,
        severity: "medium",
        category: "SEO",
      });
    }
    const totalImages = imagesWithAlt + imagesWithoutAlt;
    if (totalImages > 0 && imagesWithoutAlt > 0) {
      issues.push({
        id: "images_missing_alt",
        title: `${imagesWithoutAlt} image(s) missing alt attribute`,
        severity: imagesWithoutAlt > 3 ? "high" : "medium",
        category: "Accessibility",
      });
    }

    const highCount = issues.filter((i) => i.severity === "high").length;
    const medCount = issues.filter((i) => i.severity === "medium").length;
    const baseScore = 100 - highCount * 15 - medCount * 5;
    const seoScore = Math.max(0, Math.min(100, baseScore));

    const parsedUrl = new URL(url);
    return {
      url,
      hostname: parsedUrl.hostname,
      scores: { seo: seoScore },
      issues,
      summary: {
        title: title || undefined,
        metaDescription: metaDesc || undefined,
        canonical: canonical || undefined,
        h1Count,
        imagesWithAlt,
        imagesWithoutAlt,
        linkCount,
      },
    };
  } finally {
    clearTimeout(timeout);
  }
}
