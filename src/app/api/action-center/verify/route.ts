import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const maxDuration = 30;

// ── Compact issue checker (mirrors auditPageCompact checks) ─────────────────

interface FoundIssue {
    id: string;
    msg: string;
}

function checkPageForIssue(html: string, pageUrl: string, issueId: string): FoundIssue | null {
    if (!html) return { id: issueId, msg: "Could not fetch page HTML" };

    switch (issueId) {
        case "no_meta_description": {
            const hasMeta = /<meta\s+name=["']description["']/i.test(html) ||
                /<meta\s+content=["'][^"']+["']\s+name=["']description["']/i.test(html);
            return hasMeta ? null : { id: issueId, msg: "Missing meta description" };
        }

        case "meta_desc_too_long": {
            const content =
                html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() ??
                html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)?.[1]?.trim();
            if (!content) return null; // No meta = different issue
            return content.length > 160 ? { id: issueId, msg: `Meta description is ${content.length} chars (max 160)` } : null;
        }

        case "meta_desc_too_short": {
            const content =
                html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1]?.trim() ??
                html.match(/<meta\s+content=["']([^"']+)["']\s+name=["']description["']/i)?.[1]?.trim();
            if (!content) return null;
            return content.length < 70 ? { id: issueId, msg: `Meta description is ${content.length} chars (min 70)` } : null;
        }

        case "no_title": {
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            return titleMatch?.[1]?.trim() ? null : { id: issueId, msg: "Missing title tag" };
        }

        case "title_too_long": {
            const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
            if (!title) return null;
            return title.length > 60 ? { id: issueId, msg: `Title is ${title.length} chars (max 60)` } : null;
        }

        case "title_too_short": {
            const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
            if (!title) return null;
            return title.length < 30 ? { id: issueId, msg: `Title is ${title.length} chars (min 30)` } : null;
        }

        case "no_h1": {
            const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
            return h1Count === 0 ? { id: issueId, msg: "Missing H1 heading" } : null;
        }

        case "multiple_h1": {
            const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
            return h1Count > 1 ? { id: issueId, msg: `${h1Count} H1 tags found (should be 1)` } : null;
        }

        case "no_canonical": {
            const hasCanonical = /<link\s[^>]*rel=["']canonical["']/i.test(html);
            return hasCanonical ? null : { id: issueId, msg: "Missing canonical tag" };
        }

        case "canonical_mismatch": {
            const canonHref = (
                html.match(/<link\s[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ??
                html.match(/<link\s[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)
            )?.[1]?.trim() ?? null;
            if (!canonHref) return null; // No canonical = different issue
            const norm = (u: string) => u.replace(/\/$/, "");
            return norm(canonHref) !== norm(pageUrl)
                ? { id: issueId, msg: `Canonical → ${canonHref}` }
                : null;
        }

        case "multiple_canonicals":
        case "duplicate_canonical": {
            const canonicalTagCount = (html.match(/<link\s[^>]*rel=["']canonical["']/gi) ?? []).length;
            return canonicalTagCount > 1
                ? { id: issueId, msg: `${canonicalTagCount} canonical tags found (should be exactly 1)` }
                : null;
        }

        case "robots_noindex": {
            const isNoindex = /content=["'][^"']*noindex/i.test(html) ||
                /<meta\s[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html);
            return isNoindex ? { id: issueId, msg: "Page set to noindex" } : null;
        }

        case "no_og_tags": {
            const hasOgTitle = /<meta\s[^>]*property=["']og:title["']/i.test(html);
            const hasOgDesc = /<meta\s[^>]*property=["']og:description["']/i.test(html);
            return (!hasOgTitle || !hasOgDesc)
                ? { id: issueId, msg: "Missing og:title or og:description" }
                : null;
        }

        case "no_schema": {
            const hasSchema =
                /<script\s[^>]*type=["']application\/ld\+json["']/i.test(html) ||
                /\bitemscope\b/i.test(html);
            return hasSchema ? null : { id: issueId, msg: "No structured data (JSON-LD / Schema.org)" };
        }

        case "images_missing_alt": {
            const imgsTotal = (html.match(/<img[\s>]/gi) ?? []).length;
            const imgsWithAlt = (html.match(/<img[^>]+alt=["'][^"']+["']/gi) ?? []).length;
            const missingAlt = imgsTotal - imgsWithAlt;
            return missingAlt > 0
                ? { id: issueId, msg: `${missingAlt} image(s) missing alt text` }
                : null;
        }

        case "large_page_size": {
            const htmlBytes = new TextEncoder().encode(html).length;
            return htmlBytes > 100_000
                ? { id: issueId, msg: `HTML size ${Math.round(htmlBytes / 1024)}KB (>100KB)` }
                : null;
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
                ? { id: issueId, msg: `Only ${wordCount} words (300+ recommended)` }
                : null;
        }

        case "no_viewport": {
            const hasViewport = /<meta\s+name=["']viewport["']\s+content=["'][^"']*width=device-width[^"']*["']/i.test(html);
            return hasViewport ? null : { id: issueId, msg: "Missing viewport meta tag" };
        }

        case "http_pages": {
            return pageUrl.startsWith("http:")
                ? { id: issueId, msg: "Page served over HTTP (not HTTPS)" }
                : null;
        }

        default:
            // For issue types we can't verify via HTML alone (e.g., slow_page, redirect_chain),
            // return null (can't determine) — UI will show "unable to verify"
            return null;
    }
}

/**
 * POST /api/action-center/verify
 * Re-fetches affected page(s) and checks if the specific issue is resolved.
 * Body: { issueId: string, affectedPageUrls: string[] }
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

        // Check up to 3 affected pages
        const urlsToCheck = affectedPageUrls.slice(0, 3);
        const results: { url: string; resolved: boolean; detail: string }[] = [];

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
                        resolved: false,
                        detail: `Page returned HTTP ${res.status}`,
                    });
                    continue;
                }

                const html = await res.text();
                const issue = checkPageForIssue(html, url, issueId);

                if (issue === null) {
                    // null means issue not found = resolved (or can't verify)
                    results.push({ url, resolved: true, detail: "Issue not detected" });
                } else {
                    results.push({ url, resolved: false, detail: issue.msg });
                }
            } catch (err) {
                results.push({
                    url,
                    resolved: false,
                    detail: `Failed to fetch: ${err instanceof Error ? err.message : "unknown error"}`,
                });
            }
        }

        const allResolved = results.every(r => r.resolved);
        const someResolved = results.some(r => r.resolved);

        return NextResponse.json({
            resolved: allResolved,
            partial: someResolved && !allResolved,
            results,
            checkedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("[ActionCenter/verify] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
