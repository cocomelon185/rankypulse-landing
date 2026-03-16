import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 45; // Allow 45s — now fetches live HTML + uses smarter models

// ── XML parser ────────────────────────────────────────────────────────────────

function parseFixXml(text: string) {
  const extract = (tag: string) => {
    const m = text.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
    return m ? m[1].trim() : "";
  };
  return {
    analysis:     extract("analysis"),
    code:         extract("code_block_primary"),
    steps:        extract("steps"),
    verification: extract("verification"),
    scoreImpact:  extract("score_impact"),
    suggestion:   text, // backward-compat: full text
  };
}

// ── System prompt (instructs Claude to always return XML) ─────────────────────

const SYSTEM_PROMPT = `You are a Lead SEO Engineer. You will receive REAL crawl data and live HTML from the affected page. Use this data to provide a SPECIFIC, surgical fix — NOT generic advice.

Output ONLY the XML tags below — no greetings, no explanations, no markdown outside the tags. Start your response immediately with <analysis>.

Format:
<analysis>2 sentences explaining WHY this is a critical SEO failure, citing Google's specific guidelines. Reference the ACTUAL values found in the crawl data.</analysis>
<code_block_primary>Ready-to-paste code fix based on the ACTUAL HTML structure observed. Include inline comments. The code MUST match the site's architecture. Do NOT provide React/Next.js code for Legacy HTML sites. Do NOT provide raw HTML for Next.js sites.</code_block_primary>
<steps>1. [Exact file to open based on the architecture]
2. [Where to paste the code — reference actual elements found in the HTML]
3. [How to deploy and verify]</steps>
<verification>One single curl command OR a browser console snippet to confirm the fix is live. Use the ACTUAL affected URL.</verification>
<score_impact>+X to +Y points — one short reason why.</score_impact>`;

// ── Smart model routing ──────────────────────────────────────────────────────

const COMPLEX_ISSUES = new Set([
  "canonical_mismatch", "multiple_canonicals", "duplicate_canonical",
  "keyword_cannibalization", "redirect_chain", "http_pages",
  "robots_txt_blocked", "slow_page",
]);

function selectModel(issueId: string): string {
  return COMPLEX_ISSUES.has(issueId)
    ? "claude-opus-4-0-20250514"     // Complex: use Opus for deep reasoning
    : "claude-sonnet-4-20250514";     // Simple: Sonnet for fast, reliable fixes
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface PageCrawlData {
  url: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string | null;
  h1Text: string | null;
  wordCount: number | null;
  issues: { id: string; msg: string }[];
}

interface PromptCtx {
  domain: string;
  title: string;
  affectedPageUrls: string[];
  techStack: string;
  // Real data from crawl
  issueMessages: string[];
  pageMetadata: PageCrawlData[];
  liveHtmlHead: string;
}

type PromptFn = (ctx: PromptCtx) => string;

// ── Helper: format real page context block ────────────────────────────────────

function formatPageContext(ctx: PromptCtx): string {
  const sections: string[] = [];

  if (ctx.issueMessages.length > 0) {
    sections.push(`ACTUAL ISSUE DATA FROM CRAWL:\n${ctx.issueMessages.slice(0, 5).join("\n")}`);
  }

  if (ctx.pageMetadata.length > 0) {
    const pageLines = ctx.pageMetadata.slice(0, 5).map(p => {
      const parts = [`URL: ${p.url}`];
      if (p.title) parts.push(`  Title: "${p.title}"`);
      if (p.metaDescription) parts.push(`  Description: "${p.metaDescription}"`);
      if (p.canonicalUrl) parts.push(`  Canonical found: ${p.canonicalUrl}`);
      if (p.h1Text) parts.push(`  H1: "${p.h1Text}"`);
      if (p.wordCount != null) parts.push(`  Word count: ${p.wordCount}`);
      return parts.join("\n");
    });
    sections.push(`PAGE METADATA FROM CRAWL:\n${pageLines.join("\n\n")}`);
  }

  if (ctx.liveHtmlHead) {
    sections.push(`LIVE <head> SECTION OF FIRST AFFECTED PAGE:\n${ctx.liveHtmlHead}`);
  }

  return sections.length > 0
    ? "\n\n--- REAL PAGE DATA ---\n" + sections.join("\n\n") + "\n--- END REAL DATA ---\n\n"
    : "";
}

// ── Issue-specific user prompts (now with real data) ──────────────────────────

const PROMPTS: Record<string, PromptFn> = {
  no_meta_description: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Missing meta description.${formatPageContext(ctx)}Write a compelling 150-160 character meta description for each affected page based on its actual title and content above. Provide the implementation for ${ctx.techStack}.`,

  no_title: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Missing title tag.${formatPageContext(ctx)}Write an SEO-optimized title tag (under 60 chars, primary keyword first, brand at end). Base it on the page's actual content shown above. Show exactly how to add it in a ${ctx.techStack} project.`,

  no_h1: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Missing H1 heading.${formatPageContext(ctx)}Write an SEO-optimized H1 (under 70 chars) based on the page's actual title and content above. Show where and how to add it in a ${ctx.techStack} project.`,

  duplicate_title: (ctx) => {
    const pages = ctx.affectedPageUrls.slice(0, 3).join(", ");
    return `Site: affected pages: ${pages}\nArchitecture: ${ctx.techStack}\nIssue: Duplicate title tags across pages.${formatPageContext(ctx)}Based on the ACTUAL titles shown above, suggest a unique, SEO-optimized title for each page (under 60 chars). Show how to implement in ${ctx.techStack}.`;
  },

  duplicate_meta_description: (ctx) => {
    const pages = ctx.affectedPageUrls.slice(0, 3).join(", ");
    return `Site: affected pages: ${pages}\nArchitecture: ${ctx.techStack}\nIssue: Duplicate meta descriptions.${formatPageContext(ctx)}Based on the ACTUAL descriptions shown above, write a unique 150-160 char meta description for each page. Show how to implement in ${ctx.techStack}.`;
  },

  images_missing_alt: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Images missing alt text.${formatPageContext(ctx)}Provide 3 examples of SEO-optimized alt text (under 125 chars each). Show how to audit and fix missing alt attributes in a ${ctx.techStack} codebase.`,

  internal_linking: (ctx) => {
    const pages = ctx.affectedPageUrls.slice(0, 5).join(", ");
    return `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Poor internal linking — these pages need links: ${pages}.${formatPageContext(ctx)}Based on the page titles and content shown above, suggest 3 specific internal link opportunities with contextual anchor text. Show how to implement in ${ctx.techStack}.`;
  },

  broken_links: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Broken internal links detected.${formatPageContext(ctx)}Based on the ACTUAL broken link data above, provide the specific fix for each broken link. Show how to update or redirect them in ${ctx.techStack}.`,

  orphan_page: (ctx) => {
    const isNextJs = /next\.?js/i.test(ctx.techStack);
    const orphanPaths = ctx.affectedPageUrls.slice(0, 5).map(u => {
      try { return new URL(u).pathname; } catch { return u; }
    });
    const pathList = orphanPaths.map(p => `  - ${p}`).join("\n");

    if (isNextJs) {
      return `Site: ${ctx.domain}
Tech: Next.js (App Router)
Orphaned pages (no internal links point to them):
${pathList}
${formatPageContext(ctx)}
TASK: Add Next.js <Link> components in src/components/Footer.tsx (or the main nav) so every orphaned page is reachable.

Rules:
- Use Next.js <Link href="..."> — NEVER raw <a href="...">
- Add to the existing footer link list (it likely uses Link already)
- Use descriptive anchor text matching the page purpose
- Show the EXACT lines to add inside the existing flex/ul container

Example output format:
// In src/components/Footer.tsx, add inside the existing link group:
<Link href="/your-orphan-page" className="text-sm text-gray-600 transition-colors hover:text-[#4318ff]">
  Descriptive Anchor Text
</Link>

Generate one <Link> block per orphaned page listed above. No generic HTML. No <a> tags. Next.js only.`;
    }

    return `Site: ${ctx.domain}
Orphaned pages (no internal links point to them):
${pathList}
${formatPageContext(ctx)}
These pages exist but no other page links to them. Add navigation links in the site footer or nav.
Show exact code for ${ctx.techStack} to add internal links to each orphaned path listed above.`;
  },

  slow_page: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Poor page speed score.${formatPageContext(ctx)}Based on the page size and word count data above, provide the top 5 most impactful technical fixes to improve page speed for this specific ${ctx.techStack} site.`,

  no_canonical: (ctx) => {
    const isNextJs = /next\.?js/i.test(ctx.techStack);
    return isNextJs
      ? `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack} (App Router)\nIssue: Missing canonical tag.${formatPageContext(ctx)}This is a Next.js App Router project. Based on the ACTUAL page data above, provide the correct canonical fix:\n1. Set metadataBase in root layout.tsx\n2. Use alternates.canonical in each page's metadata\n\nDO NOT use head.tsx files or client-side DOM injection.`
      : `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Missing canonical tag.${formatPageContext(ctx)}Write the correct canonical tag for this page based on its actual URL. Show how to add it in ${ctx.techStack}.`;
  },

  multiple_canonical: (ctx) => {
    const isNextJs = /next\.?js/i.test(ctx.techStack);
    const pages = ctx.affectedPageUrls.slice(0, 3).join(", ");
    return isNextJs
      ? `Site: ${ctx.domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${ctx.techStack} (App Router)\nIssue: Multiple canonical tags detected.${formatPageContext(ctx)}Based on the ACTUAL canonical tags found in the HTML above, identify the duplicate source and fix it. Common cause: legacy head.tsx conflicting with generateMetadata.\n\nDO NOT use Pages Router patterns or client-side DOM injection.`
      : `Site: ${ctx.domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${ctx.techStack}\nIssue: Multiple canonical tags.${formatPageContext(ctx)}Based on the ACTUAL HTML above, identify and remove the duplicate canonical source.`;
  },

  duplicate_canonical: (ctx) => {
    const isNextJs = /next\.?js/i.test(ctx.techStack);
    const pages = ctx.affectedPageUrls.slice(0, 3).join(", ");
    return isNextJs
      ? `Site: ${ctx.domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${ctx.techStack} (App Router)\nIssue: Duplicate canonical tags.${formatPageContext(ctx)}Based on the ACTUAL HTML <head> above, identify which source is creating the duplicate and fix it.`
      : `Site: ${ctx.domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${ctx.techStack}\nIssue: Duplicate canonical tags.${formatPageContext(ctx)}Find and eliminate the duplicate source based on the HTML above.`;
  },

  canonical_mismatch: (ctx) => {
    const isNextJs = /next\.?js/i.test(ctx.techStack);
    const pages = ctx.affectedPageUrls.slice(0, 3).join(", ");
    return isNextJs
      ? `Site: ${ctx.domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${ctx.techStack} (App Router)\nIssue: Canonical URL mismatch — the canonical tag points to a different URL than the page's actual URL.${formatPageContext(ctx)}Based on the ACTUAL canonical values found above, identify the root cause and provide a SPECIFIC fix. Common causes:\n- Layout-level canonical overriding child pages\n- Incorrect alternates.canonical values\n- www vs non-www mismatch\n\nDO NOT provide generic advice — use the real data above.`
      : `Site: ${ctx.domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${ctx.techStack}\nIssue: Canonical URL mismatch.${formatPageContext(ctx)}Based on the ACTUAL canonical values above, provide the corrected implementation.`;
  },

  no_schema: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: No structured data (JSON-LD).${formatPageContext(ctx)}Write a complete Organization JSON-LD schema for ${ctx.domain}. Show where to add it in a ${ctx.techStack} project.`,

  no_viewport: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Missing viewport meta tag — site is not mobile-friendly.${formatPageContext(ctx)}Provide the exact viewport meta tag fix. Show exactly which file to edit based on the architecture.`,

  http_pages: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: Site serving pages over HTTP (not HTTPS).${formatPageContext(ctx)}Provide a step-by-step HTTPS migration plan for this ${ctx.techStack} site.`,

  low_word_count: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Thin content — page has fewer than 300 words.${formatPageContext(ctx)}Based on the page's actual title and description above, suggest specific content to add that would improve topical depth and SEO value. Provide at least 3 content sections with headings.`,

  title_too_long: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Title tag is too long (over 60 characters).${formatPageContext(ctx)}Based on the ACTUAL title shown above, rewrite it to under 60 characters while keeping the primary keyword. Show how to update it in ${ctx.techStack}.`,

  title_too_short: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Title tag is too short (under 30 characters).${formatPageContext(ctx)}Based on the ACTUAL title shown above, expand it to 50-60 characters with relevant keywords. Show how to update in ${ctx.techStack}.`,

  meta_desc_too_long: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Meta description is too long (over 160 characters).${formatPageContext(ctx)}Based on the ACTUAL description shown above, rewrite it to 150-160 characters. Show how to update in ${ctx.techStack}.`,

  meta_desc_too_short: (ctx) =>
    `Site: ${ctx.affectedPageUrls[0] ?? "this page"}\nArchitecture: ${ctx.techStack}\nIssue: Meta description is too short (under 70 characters).${formatPageContext(ctx)}Based on the ACTUAL description shown above, expand it to 150-160 characters. Show how to update in ${ctx.techStack}.`,

  _default: (ctx) =>
    `Site: ${ctx.domain}\nArchitecture: ${ctx.techStack}\nIssue: ${ctx.title}${formatPageContext(ctx)}Provide a specific, surgical SEO fix for this issue based on the ACTUAL page data above. Tailor the code to the ${ctx.techStack} environment.`,
};

function buildPrompt(issueId: string, ctx: PromptCtx): string {
  const fn = PROMPTS[issueId] ?? PROMPTS._default;
  return fn(ctx);
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: {
    issueId?: string;
    domain?: string;
    affectedPageUrls?: string[];
    title?: string;
    force?: boolean;
  };

  try {
    body = await req.json() as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { issueId, domain, affectedPageUrls = [], title = "", force = false } = body;

  if (!issueId || !domain) {
    return NextResponse.json({ error: "issueId and domain are required" }, { status: 400 });
  }

  // ── 1. Check cache (last 24 hours) ───────────────────────────────────────
  if (!force) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabaseAdmin
      .from("ai_fix_suggestions")
      .select("id, suggestion, metadata, created_at")
      .eq("user_id", userId)
      .eq("domain", domain)
      .eq("issue_id", issueId)
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      const structured = (cached.metadata as Record<string, unknown> | null)?.structured as Record<string, string> | undefined;
      if (structured?.code) {
        return NextResponse.json({
          ...structured,
          suggestion: cached.suggestion,
          cached: true,
          createdAt: cached.created_at,
        });
      }
      return NextResponse.json({
        suggestion: cached.suggestion,
        cached: true,
        createdAt: cached.created_at,
      });
    }
  }

  // ── 2a. Fetch tech stack from the most recent crawl ─────────────────────
  const { data: stackRow } = await supabaseAdmin
    .from("audit_pages")
    .select("metadata")
    .ilike("url", `%${domain}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const techStack: string =
    (stackRow?.metadata as Record<string, string> | null)?.tech_stack ?? "Standard HTML/CSS";

  // ── 2b. Fetch REAL crawl data for affected pages ────────────────────────
  let pageMetadata: PageCrawlData[] = [];
  let issueMessages: string[] = [];
  try {
    const { data: affectedPages } = await supabaseAdmin
      .from("audit_pages")
      .select("url, metadata, issues")
      .in("url", affectedPageUrls.slice(0, 5))
      .order("created_at", { ascending: false });

    pageMetadata = (affectedPages ?? []).map(p => {
      const meta = p.metadata as Record<string, unknown> | null;
      return {
        url: p.url,
        title: (meta?.title as string) ?? "",
        metaDescription: (meta?.meta_description as string) ?? "",
        canonicalUrl: (meta?.canonical_url as string) ?? null,
        h1Text: (meta?.h1_text as string) ?? null,
        wordCount: (meta?.word_count as number) ?? null,
        issues: ((p.issues as Array<{ id: string; msg: string }>) ?? [])
          .map(i => ({ id: i.id, msg: i.msg })),
      };
    });

    issueMessages = pageMetadata
      .flatMap(p => p.issues.filter(i => i.id === issueId).map(i => i.msg));
  } catch { /* non-critical — continue without crawl data */ }

  // ── 2c. Fetch LIVE HTML <head> of first affected page ───────────────────
  let liveHtmlHead = "";
  try {
    const firstUrl = affectedPageUrls[0];
    if (firstUrl?.startsWith("http")) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(firstUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; RankyPulse/1.0)" },
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timer);
      if (res.ok) {
        const fullHtml = await res.text();
        const headMatch = fullHtml.match(/<head[\s>][\s\S]*?<\/head>/i);
        liveHtmlHead = (headMatch?.[0] ?? "").slice(0, 2000); // Cap at 2KB
      }
    }
  } catch { /* non-critical — continue without live HTML */ }

  // ── 3. Build Claude prompt with REAL data ───────────────────────────────
  const ctx: PromptCtx = {
    domain, title, affectedPageUrls, techStack,
    issueMessages, pageMetadata, liveHtmlHead,
  };
  const userPrompt = buildPrompt(issueId, ctx);

  // ── 4. Call Anthropic API (smart model routing) ─────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  let rawSuggestion: string;
  const model = selectModel(issueId);

  try {
    const client = new Anthropic({ apiKey });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40_000);

    const message = await client.messages.create(
      {
        model,
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type");
    rawSuggestion = block.text.trim();
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // ── 5. Parse XML into structured sections ────────────────────────────────
  const parsed = parseFixXml(rawSuggestion);

  // ── 6. Persist to DB ─────────────────────────────────────────────────────
  const { data: inserted } = await supabaseAdmin
    .from("ai_fix_suggestions")
    .insert({
      user_id: userId,
      domain,
      issue_id: issueId,
      suggestion: rawSuggestion,
      metadata: {
        charCount: rawSuggestion.length,
        issueTitle: title,
        model,
        techStack,
        hasLiveHtml: !!liveHtmlHead,
        pagesWithCrawlData: pageMetadata.length,
        structured: parsed,
      },
    })
    .select("created_at")
    .single();

  return NextResponse.json({
    ...parsed,
    cached: false,
    createdAt: inserted?.created_at ?? new Date().toISOString(),
  });
}
