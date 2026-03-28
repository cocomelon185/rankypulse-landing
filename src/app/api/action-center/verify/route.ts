import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 30;

// ── Issue categories ──────────────────────────────────────────────────────────

// Issues that CAN be verified by checking a single page's HTML
const SINGLE_PAGE_VERIFIABLE = new Set([
    "no_meta_description", "meta_desc_too_long", "meta_desc_too_short",
    "no_title", "title_too_long", "title_too_short",
    "no_h1", "multiple_h1",
    "no_canonical", "canonical_mismatch", "multiple_canonicals", "duplicate_canonical",
    "robots_noindex", "robots_txt_blocked",
    "no_og_tags", "no_schema",
    "images_missing_alt", "large_page_size", "low_word_count",
    "no_viewport", "http_pages",
]);

// Issues that require cross-page analysis — cannot verify by checking one page
const CROSS_PAGE_ISSUES = new Set([
    "orphan_page",           // needs ALL pages' outbound links
    "duplicate_title",       // needs titles from ALL pages
    "duplicate_meta_description", // needs descriptions from ALL pages
    "keyword_cannibalization",    // needs titles from ALL pages
    "broken_links",          // needs HTTP status of linked pages
    "internal_linking",      // needs site-wide link graph
    "redirect_chain",        // needs following redirect hops
    "deep_page_depth",       // needs site-wide link graph
]);

// ── Compact issue checker (mirrors auditPageCompact checks) ─────────────────

type CheckResult =
    | { status: "resolved"; detail: string }
    | { status: "still_present"; detail: string }
    | { status: "unable_to_verify"; detail: string };

function checkPageForIssue(html: string, pageUrl: string, issueId: string): CheckResult {
    if (!html) return { status: "still_present", detail: "Could not fetch page HTML" };

    // Cross-page issues cannot be verified by single-page HTML check
    if (CROSS_PAGE_ISSUES.has(issueId)) {
        return {
            status: "unable_to_verify",
            detail: "This issue requires a full site re-audit to verify. Run a new audit to check if this fix worked.",
        };
    }

    // Unknown issue types
    if (!SINGLE_PAGE_VERIFIABLE.has(issueId)) {
        return {
            status: "unable_to_verify",
            detail: `Issue type "${issueId}" cannot be verified automatically. Run a new audit to check.`,
        };
    }

    switch (issueId) {
        case "no_meta_description": {
            const hasMeta = /<meta\s+name=["']description["']/i.test(html) ||
                /<meta\s+content=["'][^"']+["']\s+name=["']description["']/i.test(html);
            return hasMeta
                ? { status: "resolved", detail: "Meta description found ✓" }
                : { status: "still_present", detail: "Missing meta description" };
        }

        case "meta_desc_too_long": {
            const content =
                html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() ??
                html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)?.[1]?.trim();
            if (!content) return { status: "resolved", detail: "No meta description found (different issue)" };
            return content.length > 160
                ? { status: "still_present", detail: `Meta description is ${content.length} chars (max 160)` }
                : { status: "resolved", detail: `Meta description is ${content.length} chars ✓` };
        }

        case "meta_desc_too_short": {
            const content =
                html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() ??
                html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)?.[1]?.trim();
            if (!content) return { status: "resolved", detail: "No meta description found (different issue)" };
            return content.length < 70
                ? { status: "still_present", detail: `Meta description is ${content.length} chars (min 70)` }
                : { status: "resolved", detail: `Meta description is ${content.length} chars ✓` };
        }

        case "no_title": {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const title = titleMatch?.[1]?.trim();
            return title
                ? { status: "resolved", detail: `Title found: "${title}" ✓` }
                : { status: "still_present", detail: "Missing title tag" };
        }

        case "title_too_long": {
            const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
            if (!title) return { status: "resolved", detail: "No title found (different issue)" };
            return title.length > 60
                ? { status: "still_present", detail: `Title is ${title.length} chars: "${title.slice(0, 40)}…"` }
                : { status: "resolved", detail: `Title is ${title.length} chars ✓` };
        }

        case "title_too_short": {
            const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
            if (!title) return { status: "resolved", detail: "No title found (different issue)" };
            return title.length < 30
                ? { status: "still_present", detail: `Title is ${title.length} chars: "${title}"` }
                : { status: "resolved", detail: `Title is ${title.length} chars ✓` };
        }

        case "no_h1": {
            const h1Match = html.match(/<h1[^>]*>([^<]*)/i);
            const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
            return h1Count === 0
                ? { status: "still_present", detail: "Missing H1 heading" }
                : { status: "resolved", detail: `H1 found: "${h1Match?.[1]?.trim() ?? ""}" ✓` };
        }

        case "multiple_h1": {
            const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
            return h1Count > 1
                ? { status: "still_present", detail: `${h1Count} H1 tags found (should be 1)` }
                : { status: "resolved", detail: `${h1Count} H1 tag ✓` };
        }

        case "no_canonical": {
            const canonHref = (
                html.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ??
                html.match(/<link\s[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)
            )?.[1]?.trim();
            return canonHref
                ? { status: "resolved", detail: `Canonical found: ${canonHref} ✓` }
                : { status: "still_present", detail: "Missing canonical tag" };
        }

        case "canonical_mismatch": {
            const canonHref = (
                html.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ??
                html.match(/<link\s[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)
            )?.[1]?.trim() ?? null;
            if (!canonHref) return { status: "still_present", detail: "No canonical tag found" };
            const norm = (u: string) => u.replace(/\/+$/, "").replace(/^https?:\/\/(www\.)?/, "");
            return norm(canonHref) !== norm(pageUrl)
                ? { status: "still_present", detail: `Canonical → ${canonHref} (expected ${pageUrl})` }
                : { status: "resolved", detail: `Canonical matches page URL ✓` };
        }

        case "multiple_canonicals":
        case "duplicate_canonical": {
            const canonicalTagCount = (html.match(/<link\s[^>]*rel=["']canonical["']/gi) ?? []).length;
            return canonicalTagCount > 1
                ? { status: "still_present", detail: `${canonicalTagCount} canonical tags found (should be exactly 1)` }
                : { status: "resolved", detail: `1 canonical tag ✓` };
        }

        case "robots_noindex":
        case "robots_txt_blocked": {
            const isNoindex = /<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html) ||
                /<meta\s[^>]*content=["'][^"']*noindex[^"']*["'][^>]*name=["']robots["']/i.test(html);
            return isNoindex
                ? { status: "still_present", detail: "Page set to noindex" }
                : { status: "resolved", detail: "No noindex directive found ✓" };
        }

        case "no_og_tags": {
            const hasOgTitle = /<meta\s[^>]*property=["']og:title["']/i.test(html);
            const hasOgDesc = /<meta\s[^>]*property=["']og:description["']/i.test(html);
            if (hasOgTitle && hasOgDesc) return { status: "resolved", detail: "og:title and og:description found ✓" };
            const missing = [];
            if (!hasOgTitle) missing.push("og:title");
            if (!hasOgDesc) missing.push("og:description");
            return { status: "still_present", detail: `Missing: ${missing.join(", ")}` };
        }

        case "no_schema": {
            const hasSchema =
                /<script\s[^>]*type=["']application\/ld\+json["']/i.test(html) ||
                /\bitemscope\b/i.test(html);
            return hasSchema
                ? { status: "resolved", detail: "Structured data (JSON-LD) found ✓" }
                : { status: "still_present", detail: "No structured data (JSON-LD / Schema.org)" };
        }

        case "images_missing_alt": {
            const imgsTotal = (html.match(/<img[\s>]/gi) ?? []).length;
            const imgsWithAlt = (html.match(/<img[^>]+alt=["'][^"']+["']/gi) ?? []).length;
            const missingAlt = imgsTotal - imgsWithAlt;
            return missingAlt > 0
                ? { status: "still_present", detail: `${missingAlt}/${imgsTotal} image(s) missing alt text` }
                : { status: "resolved", detail: `All ${imgsTotal} images have alt text ✓` };
        }

        case "large_page_size": {
            const htmlBytes = new TextEncoder().encode(html).length;
            const sizeKB = Math.round(htmlBytes / 1024);
            return htmlBytes > 100_000
                ? { status: "still_present", detail: `HTML size ${sizeKB}KB (max 100KB)` }
                : { status: "resolved", detail: `HTML size ${sizeKB}KB ✓` };
        }

        case "low_word_count": {
            const textOnly = html
                .replace(/<script[\s\S]*?<\/script>/gi, "")
                .replace(/<style[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            const wordCount = textOnly.split(" ").filter(w => w.length > 2).length;
            return wordCount < 300
                ? { status: "still_present", detail: `Only ${wordCount} words (300+ recommended)` }
                : { status: "resolved", detail: `${wordCount} words ✓` };
        }

        case "no_viewport": {
            const hasViewport = /<meta\s+name=["']viewport["']/i.test(html);
            return hasViewport
                ? { status: "resolved", detail: "Viewport meta tag found ✓" }
                : { status: "still_present", detail: "Missing viewport meta tag" };
        }

        case "http_pages": {
            return pageUrl.startsWith("http:")
                ? { status: "still_present", detail: "Page served over HTTP (not HTTPS)" }
                : { status: "resolved", detail: "Page served over HTTPS ✓" };
        }

        default:
            return {
                status: "unable_to_verify",
                detail: `Cannot auto-verify "${issueId}". Run a full re-audit to check.`,
            };
    }
}

/**
 * POST /api/action-center/verify
 * Re-fetches affected page(s) and checks if the specific issue is resolved.
 * Body: { issueId: string, affectedPageUrls: string[] }
 *
 * Returns:
 *   resolved: true       — all checked pages pass
 *   resolved: false       — at least one page still has the issue
 *   unable_to_verify: true — issue requires full re-audit (orphan, duplicate title, etc.)
 */
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { issueId, affectedPageUrls } = body as {
            issueId: string;
            affectedPageUrls: string[];
        };

        if (!issueId || !affectedPageUrls?.length) {
            return NextResponse.json(
                { error: "Missing required fields: issueId, affectedPageUrls" },
                { status: 400 }
            );
        }

        // Cross-page issues: immediately return unable_to_verify — don't even fetch
        if (CROSS_PAGE_ISSUES.has(issueId)) {
            return NextResponse.json({
                resolved: false,
                partial: false,
                unable_to_verify: true,
                results: [{
                    url: affectedPageUrls[0],
                    status: "unable_to_verify" as const,
                    resolved: false,
                    detail: "This issue requires a full site re-audit to verify. Click 'Run Audit' to check if the fix worked.",
                }],
                checkedAt: new Date().toISOString(),
            });
        }

        // Check up to 3 affected pages
        const urlsToCheck = affectedPageUrls.slice(0, 3);
        const results: { url: string; status: string; resolved: boolean; detail: string }[] = [];

        for (const url of urlsToCheck) {
            try {
                const res = await fetch(url, {
                    headers: { "User-Agent": "Mozilla/5.0 (compatible; RankyPulse/1.0)" },
                    signal: AbortSignal.timeout(8000),
                    redirect: "follow",
                });

                if (!res.ok) {
                    results.push({
                        url,
                        status: "still_present",
                        resolved: false,
                        detail: `Page returned HTTP ${res.status}`,
                    });
                    continue;
                }

                const html = await res.text();
                const check = checkPageForIssue(html, url, issueId);

                results.push({
                    url,
                    status: check.status,
                    resolved: check.status === "resolved",
                    detail: check.detail,
                });
            } catch (err) {
                results.push({
                    url,
                    status: "still_present",
                    resolved: false,
                    detail: `Failed to fetch: ${err instanceof Error ? err.message : "unknown error"}`,
                });
            }
        }

        const allResolved = results.every(r => r.resolved);
        const someResolved = results.some(r => r.resolved);
        const anyUnableToVerify = results.some(r => r.status === "unable_to_verify");

        return NextResponse.json({
            resolved: allResolved && !anyUnableToVerify,
            partial: someResolved && !allResolved,
            unable_to_verify: anyUnableToVerify,
            results,
            checkedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[ActionCenter/verify] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
