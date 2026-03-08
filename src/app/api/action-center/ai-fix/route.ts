import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

// ── Prompt builders ──────────────────────────────────────────────────────────

interface PromptCtx {
  domain: string;
  title: string;
  affectedPageUrls: string[];
}

type PromptFn = (ctx: PromptCtx) => string;

const PROMPTS: Record<string, PromptFn> = {
  no_meta_description: ({ domain }) =>
    `Write a compelling 150-160 character meta description for the website ${domain}. Make it descriptive, action-oriented, and include the brand name. Return only the meta description text with no explanation or quotes.`,

  no_title: ({ affectedPageUrls }) =>
    `Write an SEO-optimized page title tag for the page at: ${affectedPageUrls[0] ?? "this page"}. Keep it under 60 characters, include the primary keyword near the front, and add the brand name at the end separated by a dash. Return only the title tag text.`,

  no_h1: ({ affectedPageUrls }) =>
    `Write an SEO-optimized H1 heading for the page at: ${affectedPageUrls[0] ?? "this page"}. Keep it under 70 characters, make it descriptive of the page content. Return only the H1 text.`,

  duplicate_title: ({ affectedPageUrls }) => {
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return `These pages have duplicate title tags: ${pages}. Suggest a unique, SEO-optimized title tag for each page (under 60 chars, format: "Keyword Topic | Brand"). Return one title per line, numbered.`;
  },

  duplicate_meta_description: ({ affectedPageUrls }) => {
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return `These pages have duplicate meta descriptions: ${pages}. Write a unique 150-160 character meta description for each. Return one description per line, numbered.`;
  },

  images_missing_alt: ({ domain }) =>
    `Write 3 examples of SEO-optimized alt text for images on ${domain}. Each should be descriptive (under 125 chars), include relevant keywords naturally, and describe what an SEO dashboard image would show. Return one alt text per line, numbered.`,

  internal_linking: ({ domain, affectedPageUrls }) => {
    const pages = affectedPageUrls.slice(0, 5).join(", ");
    return `Suggest 3 internal link opportunities for ${domain}. These pages need better internal linking: ${pages}. For each suggestion, format as: [source page path] → [target page path] | Suggested anchor: [anchor text]. Be specific.`;
  },

  broken_links: ({ domain }) =>
    `Provide a step-by-step action plan to fix broken internal links on ${domain}. Include: how to find them in a CMS, how to update or redirect them, and how to prevent future broken links. Keep it under 200 words.`,

  orphan_page: ({ affectedPageUrls }) => {
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return `These pages are orphaned (no internal links point to them): ${pages}. Suggest 3 specific places on the website where links to these pages could naturally be added. Be specific about anchor text and context.`;
  },

  slow_page: ({ domain }) =>
    `Provide the top 5 most impactful technical fixes to improve page speed for ${domain}. Focus on fixes that can be implemented without a framework change. Be specific and actionable. Format as a numbered list.`,

  no_canonical: ({ affectedPageUrls }) =>
    `Write the correct canonical tag for: ${affectedPageUrls[0] ?? "this page"}. Also explain in 2 sentences why canonical tags matter for SEO. Return the HTML tag first, then the explanation.`,

  no_schema: ({ domain }) =>
    `Write a JSON-LD schema markup snippet for ${domain}. Include Organization schema with name, url, and logo. Return only the <script> block, ready to paste into the <head>.`,

  _default: ({ title, domain }) =>
    `Provide a specific, actionable SEO fix for the issue "${title}" on ${domain}. Give a concrete 2-3 sentence recommendation. Be practical and specific. Avoid generic advice.`,
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
      .select("id, suggestion, created_at")
      .eq("user_id", userId)
      .eq("domain", domain)
      .eq("issue_id", issueId)
      .gte("created_at", oneDayAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({
        suggestion: cached.suggestion,
        cached: true,
        createdAt: cached.created_at,
      });
    }
  }

  // ── 2. Build Claude prompt ────────────────────────────────────────────────
  const ctx: PromptCtx = { domain, title, affectedPageUrls };
  const prompt = buildPrompt(issueId, ctx);

  // ── 3. Call Anthropic API ─────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  let suggestion: string;
  const model = "claude-3-5-haiku-20241022";

  try {
    const client = new Anthropic({ apiKey });

    // 30s timeout via AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const message = await client.messages.create(
      {
        model,
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    const block = message.content[0];
    if (block.type !== "text") throw new Error("Unexpected response type");
    suggestion = block.text.trim();
  } catch (err) {
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  // ── 4. Persist to DB ─────────────────────────────────────────────────────
  const { data: inserted } = await supabaseAdmin
    .from("ai_fix_suggestions")
    .insert({
      user_id: userId,
      domain,
      issue_id: issueId,
      suggestion,
      metadata: {
        charCount: suggestion.length,
        issueTitle: title,
        model,
      },
    })
    .select("created_at")
    .single();

  return NextResponse.json({
    suggestion,
    cached: false,
    createdAt: inserted?.created_at ?? new Date().toISOString(),
  });
}
