import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

type IssueSeverity = "error" | "warning" | "notice";
type BotStatus = "ok" | "blocked";

interface RawIssue {
  id: string;
  title: string;
  priority: string;
  category?: string;
}

interface AggregatedIssue {
  id: string;
  title: string;
  severity: IssueSeverity;
  affectedPages: number;
  category: string;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain")?.trim().toLowerCase();

    if (!domain) {
      return NextResponse.json({ error: "Domain required" }, { status: 400 });
    }

    // Get latest completed crawl job for this domain + user
    const { data: job } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id, domain, status, pages_limit, pages_crawled, created_at, updated_at")
      .eq("user_id", session.user.id)
      .eq("domain", domain)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!job) {
      return NextResponse.json({ noData: true, domain });
    }

    // Fetch all audit pages for this job
    const { data: pages } = await supabaseAdmin
      .from("audit_pages")
      .select("url, score, issues, metadata")
      .eq("job_id", job.id);

    if (!pages || pages.length === 0) {
      return NextResponse.json({ noData: true, domain });
    }

    // ── Site Health Score ──────────────────────────────────────────
    const avgScore = Math.round(
      pages.reduce((sum, p) => sum + (p.score ?? 0), 0) / pages.length
    );

    // ── Crawled Pages Breakdown ────────────────────────────────────
    const pageBreakdown = { healthy: 0, broken: 0, hasIssues: 0, redirects: 0, blocked: 0 };
    for (const page of pages) {
      const issues = (page.issues as RawIssue[]) ?? [];
      const hasBroken = issues.some((i) =>
        ["broken", "4xx", "404", "not-found"].some((k) => i.id?.includes(k))
      );
      const hasRedirect = issues.some((i) => i.id?.includes("redirect"));
      if (hasBroken) pageBreakdown.broken++;
      else if (hasRedirect) pageBreakdown.redirects++;
      else if ((page.score ?? 0) >= 80) pageBreakdown.healthy++;
      else pageBreakdown.hasIssues++;
    }

    // ── Errors / Warnings + Top Issues ───────────────────────────
    let errors = 0;
    let warnings = 0;
    const issueMap = new Map<string, AggregatedIssue>();

    for (const page of pages) {
      const issues = (page.issues as RawIssue[]) ?? [];
      for (const issue of issues) {
        if (issue.priority === "critical" || issue.priority === "high") errors++;
        else if (issue.priority === "medium") warnings++;

        const existing = issueMap.get(issue.id);
        if (existing) {
          existing.affectedPages++;
        } else {
          const severity: IssueSeverity =
            issue.priority === "critical" || issue.priority === "high"
              ? "error"
              : issue.priority === "medium"
              ? "warning"
              : "notice";
          issueMap.set(issue.id, {
            id: issue.id,
            title: issue.title,
            severity,
            affectedPages: 1,
            category: issue.category ?? "general",
          });
        }
      }
    }

    const severityOrder: Record<IssueSeverity, number> = { error: 0, warning: 1, notice: 2 };
    const topIssues = Array.from(issueMap.values())
      .sort(
        (a, b) =>
          severityOrder[a.severity] - severityOrder[b.severity] ||
          b.affectedPages - a.affectedPages
      )
      .slice(0, 12);

    // ── Thematic Scores ────────────────────────────────────────────
    const allIssues = pages.flatMap((p) => (p.issues as RawIssue[]) ?? []);

    const calcTheme = (...keywords: string[]): number => {
      const matching = allIssues.filter((i) =>
        keywords.some((k) => `${i.id ?? ""} ${i.title ?? ""}`.toLowerCase().includes(k))
      );
      return Math.min(100, Math.max(0, 100 - matching.length * 5));
    };

    const robotsScore = calcTheme("robots");
    const thematic = {
      robotsTxt: {
        score: robotsScore,
        status: (robotsScore >= 90 ? "ok" : robotsScore >= 50 ? "issues" : "missing") as "ok" | "issues" | "missing",
      },
      crawlability: calcTheme("canonical", "redirect", "crawl"),
      https: calcTheme("http", "ssl", "https", "insecure", "mixed"),
      internationalSeo: "not_implemented" as const,
      coreWebVitals: calcTheme("lcp", "cls", "fid", "inp", "core-web-vital"),
      sitePerformance: calcTheme("speed", "performance", "image", "compress", "render"),
      internalLinking: calcTheme("link", "orphan", "broken-link", "internal"),
      markup: calcTheme("schema", "og", "open-graph", "meta", "h1", "structured"),
    };

    // ── Robots.txt: AI Bot Accessibility ──────────────────────────
    let robotsTxtContent = "";
    try {
      const r = await fetch(`https://${domain}/robots.txt`, {
        signal: AbortSignal.timeout(3000),
        headers: { "User-Agent": "RankyPulse-Bot/1.0" },
      });
      if (r.ok) robotsTxtContent = (await r.text()).toLowerCase();
    } catch {
      // robots.txt unreachable — assume accessible
    }

    const AI_BOTS = [
      { name: "ChatGPT-User", agent: "chatgpt-user" },
      { name: "OAI-SearchBot", agent: "oai-searchbot" },
      { name: "Googlebot", agent: "googlebot" },
      { name: "Google-Extended", agent: "google-extended" },
      { name: "Bingbot", agent: "bingbot" },
    ];

    const isBlockedByRobots = (agent: string): boolean => {
      const lines = robotsTxtContent.split("\n");
      let inBlock = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("user-agent:")) {
          const ua = trimmed.replace("user-agent:", "").trim();
          inBlock = ua === agent || ua === "*";
        }
        if (inBlock && trimmed.startsWith("disallow: /") && trimmed !== "disallow: /\r") {
          return true;
        }
      }
      return false;
    };

    const bots = AI_BOTS.map((b) => ({
      name: b.name,
      status: (isBlockedByRobots(b.agent) ? "blocked" : "ok") as BotStatus,
    }));

    // ── AI Search Health Score ─────────────────────────────────────
    const hasSchemaIssue = allIssues.some((i) =>
      ["schema", "structured-data"].some((k) => i.id?.includes(k))
    );
    const hasSitemapIssue = allIssues.some((i) => i.id?.includes("sitemap"));
    const blockedBotCount = bots.filter((b) => b.status === "blocked").length;

    const aiScore = Math.max(
      20,
      100 - (hasSchemaIssue ? 15 : 0) - (hasSitemapIssue ? 10 : 0) - blockedBotCount * 8
    );

    const aiMessage =
      aiScore >= 80
        ? "Website is better optimized for AI search engines"
        : aiScore >= 60
        ? "Partially optimized for AI search visibility"
        : "Needs AI search optimization — key issues found";

    return NextResponse.json({
      domain: job.domain,
      crawledAt: job.updated_at ?? job.created_at,
      pagesLimit: job.pages_limit ?? 10,
      pagesCrawled: job.pages_crawled ?? pages.length,
      siteHealthScore: avgScore,
      previousScore: null,
      pageBreakdown,
      errors,
      warnings,
      topIssues,
      thematic,
      aiSearchHealth: {
        score: aiScore,
        message: aiMessage,
        issues: Math.max(0, (hasSchemaIssue ? 1 : 0) + (hasSitemapIssue ? 1 : 0) + blockedBotCount),
        bots,
      },
      noData: false,
    });
  } catch (err) {
    console.error("[api/audits/full-report]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
