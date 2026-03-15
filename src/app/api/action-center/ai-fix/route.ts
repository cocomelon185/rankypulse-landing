import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30; // Allow 30s for Claude XML generation on Vercel

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

const SYSTEM_PROMPT = `You are a Lead SEO Engineer. Output ONLY the XML tags below — no greetings, no explanations, no markdown outside the tags. Start your response immediately with <analysis>.

Format:
<analysis>2 sentences explaining WHY this is a critical SEO failure, citing Google's specific guidelines (e.g., Mobile-First Indexing, HTTPS as a ranking signal, PageSpeed Insights thresholds).</analysis>
<code_block_primary>Ready-to-paste code fix. Include inline comments. The code MUST match the site's architecture from the user message. Do NOT provide React/Next.js code for Legacy HTML sites. Do NOT provide raw HTML for Next.js sites.</code_block_primary>
<steps>1. [File to open or location]
2. [Where to paste the code]
3. [How to deploy and verify]</steps>
<verification>One single curl command OR a browser console snippet to confirm the fix is live. One line only.</verification>
<score_impact>+X to +Y points — one short reason why.</score_impact>`;

// ── Issue-specific user prompts ───────────────────────────────────────────────

interface PromptCtx {
  domain: string;
  title: string;
  affectedPageUrls: string[];
  techStack: string;
}

type PromptFn = (ctx: PromptCtx) => string;

const PROMPTS: Record<string, PromptFn> = {
  no_meta_description: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Missing meta description on all or most pages.\n\nWrite a compelling 150-160 character meta description for ${domain}. Then provide the implementation showing where to add it in a ${techStack} project. Include a template they can reuse per page.`,

  no_title: ({ affectedPageUrls, techStack }) =>
    `Site: ${affectedPageUrls[0] ?? "this page"}\nArchitecture: ${techStack}\nIssue: Missing title tag.\n\nWrite an SEO-optimized title tag (under 60 chars, primary keyword first, brand at end). Show exactly how to add it in a ${techStack} project.`,

  no_h1: ({ affectedPageUrls, techStack }) =>
    `Site: ${affectedPageUrls[0] ?? "this page"}\nArchitecture: ${techStack}\nIssue: Missing H1 heading.\n\nWrite an SEO-optimized H1 (under 70 chars). Show where and how to add it in a ${techStack} project.`,

  duplicate_title: ({ affectedPageUrls, techStack }) => {
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return `Site: affected pages: ${pages}\nArchitecture: ${techStack}\nIssue: Duplicate title tags across pages.\n\nSuggest a unique, SEO-optimized title for each page (under 60 chars, format: "Keyword | Brand"). Show how to implement dynamic titles in ${techStack}.`;
  },

  duplicate_meta_description: ({ affectedPageUrls, techStack }) => {
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return `Site: affected pages: ${pages}\nArchitecture: ${techStack}\nIssue: Duplicate meta descriptions.\n\nWrite a unique 150-160 char meta description for each page. Show how to implement dynamic meta descriptions in ${techStack}.`;
  },

  images_missing_alt: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Images missing alt text.\n\nProvide 3 examples of SEO-optimized alt text (under 125 chars each). Show how to audit and fix missing alt attributes in a ${techStack} codebase.`,

  internal_linking: ({ domain, affectedPageUrls, techStack }) => {
    const pages = affectedPageUrls.slice(0, 5).join(", ");
    return `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Poor internal linking — these pages need links: ${pages}.\n\nSuggest 3 specific internal link opportunities with anchor text. Show how to implement internal links correctly in ${techStack}.`;
  },

  broken_links: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Broken internal links detected.\n\nProvide a step-by-step plan to find, fix, and redirect broken links in a ${techStack} site.`,

  orphan_page: ({ affectedPageUrls, techStack }) => {
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return `Site: orphaned pages: ${pages}\nArchitecture: ${techStack}\nIssue: These pages have no internal links pointing to them.\n\nSuggest 3 specific places in the site to add links to these pages, with anchor text. Show how to add them in ${techStack}.`;
  },

  slow_page: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Poor page speed score.\n\nProvide the top 5 most impactful technical fixes to improve page speed for a ${techStack} site. Be specific and actionable.`,

  no_canonical: ({ affectedPageUrls, techStack }) => {
    const isNextJs = /next\.?js/i.test(techStack);
    return isNextJs
      ? `Site: ${affectedPageUrls[0] ?? "this page"}\nArchitecture: ${techStack} (App Router)\nIssue: Missing canonical tag.\n\nThis is a Next.js App Router project using src/app/. The ONLY correct approach:\n1. Set metadataBase in the root layout.tsx so Next.js auto-derives canonicals:\n   export const metadata: Metadata = { metadataBase: new URL("https://yourdomain.com") }\n2. For pages needing a custom canonical, use alternates in generateMetadata:\n   alternates: { canonical: "/your-page-path" }\n\nDO NOT use <link rel="canonical"> in a head.tsx file — these override generateMetadata and create duplicate tags.\nDO NOT use pages/_app.js or useRouter from next/router — those are legacy Pages Router patterns and will break an App Router project.`
      : `Site: ${affectedPageUrls[0] ?? "this page"}\nArchitecture: ${techStack}\nIssue: Missing canonical tag.\n\nWrite the correct canonical tag for this page. Show how to add canonical tags in ${techStack}.`;
  },

  multiple_canonical: ({ domain, affectedPageUrls, techStack }) => {
    const isNextJs = /next\.?js/i.test(techStack);
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return isNextJs
      ? `Site: ${domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${techStack} (App Router)\nIssue: Multiple or conflicting canonical tags detected — pages have more than one <link rel="canonical">.\n\nThis is a Next.js App Router project. Root cause is almost always a legacy head.tsx file that hardcodes a canonical, coexisting with generateMetadata. Fix:\n1. Delete any head.tsx files in src/app/ (these are a Next.js 13 legacy pattern that conflicts with generateMetadata).\n2. Ensure only ONE canonical source: generateMetadata with alternates.canonical.\n3. Confirm metadataBase is set in layout.tsx:\n   export const metadata: Metadata = { metadataBase: new URL("https://${domain}") }\n\nDO NOT generate pages/_app.js, useRouter, or any client-side <link> injection — those are Next.js Pages Router patterns and are NOT valid in App Router.\nDO NOT write React useEffect code that injects canonical tags into the DOM — Googlebot may not execute it.`
      : `Site: ${domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${techStack}\nIssue: Multiple or conflicting canonical tags on the same page.\n\nIdentify and remove the duplicate canonical source. Provide the corrected implementation for ${techStack}.`;
  },

  duplicate_canonical: ({ domain, affectedPageUrls, techStack }) => {
    const isNextJs = /next\.?js/i.test(techStack);
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return isNextJs
      ? `Site: ${domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${techStack} (App Router)\nIssue: Duplicate canonical tags — the same page emits two or more <link rel="canonical"> elements.\n\nThis is a Next.js App Router project. The fix:\n1. Search for and delete any head.tsx files under src/app/ — they conflict with generateMetadata.\n2. Use a single canonical source: alternates.canonical in generateMetadata.\n3. Set metadataBase in root layout.tsx: new URL("https://${domain}")\n\nDO NOT generate pages/_app.js, useRouter, or client-side DOM injection code. Those are Pages Router patterns that do not work in App Router.`
      : `Site: ${domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${techStack}\nIssue: Duplicate canonical tags.\n\nFind and eliminate the duplicate source. Show the corrected canonical implementation for ${techStack}.`;
  },

  canonical_mismatch: ({ domain, affectedPageUrls, techStack }) => {
    const isNextJs = /next\.?js/i.test(techStack);
    const pages = affectedPageUrls.slice(0, 3).join(", ");
    return isNextJs
      ? `Site: ${domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${techStack} (App Router)\nIssue: Canonical URL mismatch — the canonical tag points to a different URL than the page's actual URL.\n\nThis is a Next.js App Router project. Common causes:\n- A root head.tsx hardcoding the homepage URL as canonical for ALL pages.\n- Incorrect alternates.canonical values in generateMetadata.\n- www vs non-www mismatch when metadataBase is not set.\n\nFix:\n1. Delete any head.tsx files in src/app/ — they override generateMetadata globally.\n2. Set metadataBase once in root layout.tsx: new URL("https://${domain}")\n3. Per-page overrides: alternates: { canonical: "/exact-page-path" } in generateMetadata.\n\nDO NOT use pages/_app.js, useRouter, or client-side canonical injection — wrong router, Googlebot may not execute JS canonical tags.`
      : `Site: ${domain}\nAffected pages: ${pages || "multiple pages"}\nArchitecture: ${techStack}\nIssue: Canonical URL mismatch — canonicals point to wrong URLs.\n\nProvide the corrected canonical implementation for ${techStack} that ensures each page's canonical matches its actual URL.`;
  },

  no_schema: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: No structured data (JSON-LD).\n\nWrite a complete Organization JSON-LD schema for ${domain}. Show where to add it in a ${techStack} project.`,

  no_viewport: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Missing viewport meta tag — site is not mobile-friendly.\n\nProvide the exact viewport meta tag fix. Since this is a ${techStack} site, show exactly which file to edit and where to paste the tag. This is critical for Google's Mobile-First Indexing.`,

  http_pages: ({ domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: Site serving pages over HTTP (not HTTPS).\n\nProvide a step-by-step HTTPS migration plan appropriate for a ${techStack} site. Cover SSL certificate setup, redirect rules, and mixed content fixes.`,

  _default: ({ title, domain, techStack }) =>
    `Site: ${domain}\nArchitecture: ${techStack}\nIssue: ${title}\n\nProvide a specific, surgical SEO fix for this issue. Tailor the code and steps to the ${techStack} environment.`,
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
      // Return structured data if available (new format), otherwise plain suggestion (old format)
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

  // ── 2. Fetch tech stack from the most recent crawl of this domain ─────────
  const { data: stackRow } = await supabaseAdmin
    .from("audit_pages")
    .select("metadata")
    .ilike("url", `%${domain}%`)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const techStack: string =
    (stackRow?.metadata as Record<string, string> | null)?.tech_stack ?? "Standard HTML/CSS";

  // ── 3. Build Claude prompt ────────────────────────────────────────────────
  const ctx: PromptCtx = { domain, title, affectedPageUrls, techStack };
  const userPrompt = buildPrompt(issueId, ctx);

  // ── 4. Call Anthropic API ─────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }

  let rawSuggestion: string;
  const model = "claude-3-haiku-20240307";

  try {
    const client = new Anthropic({ apiKey });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    const message = await client.messages.create(
      {
        model,
        max_tokens: 900,
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
