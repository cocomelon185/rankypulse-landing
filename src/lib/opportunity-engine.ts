/**
 * opportunity-engine.ts
 * Phase 5.2 — SEO Opportunity Alerts System
 *
 * Detects keywords in positions 11–20 with volume ≥ 1000 and computes
 * estimated traffic gain using a position-based CTR model. Also pulls
 * recommended actions from real audit issues for each domain.
 *
 * Called by /api/cron/rank-update after each daily ranking refresh.
 */

import { supabaseAdmin } from "@/lib/supabase";
import { ISSUE_META } from "@/lib/dashboard-data";

// ── CTR Model (standard industry position→CTR lookup) ────────────────────────
// Sources: Advanced Web Ranking, Sistrix, Backlinko CTR studies

const CTR_MAP: Record<number, number> = {
  1: 0.276, 2: 0.158, 3: 0.110, 4: 0.084, 5: 0.063,
  6: 0.049, 7: 0.039, 8: 0.033, 9: 0.027, 10: 0.024,
  11: 0.015, 12: 0.012, 13: 0.010, 14: 0.009, 15: 0.008,
  16: 0.006, 17: 0.006, 18: 0.006, 19: 0.006, 20: 0.006,
};

export function getCTR(position: number): number {
  return CTR_MAP[position] ?? 0.005;
}

/**
 * computeTrafficGain — estimates additional monthly visits if keyword
 * moves from current position up by 4 spots (toward top of page 1).
 *
 * Example: pos 12, vol 18500 → target 8
 *   gain = 18500 × (0.033 – 0.012) = +388 visits/month
 */
export function computeTrafficGain(
  position: number,
  volume: number
): { gain: number; targetPosition: number } {
  const targetPosition = Math.max(1, position - 4);
  const gain = Math.round(volume * (getCTR(targetPosition) - getCTR(position)));
  return { gain: Math.max(0, gain), targetPosition };
}

// ── Position-based generic recommended actions (fallback) ────────────────────

function genericActions(position: number): string[] {
  if (position <= 13) {
    return ["Strengthen backlinks to this page", "Add more internal links from related pages"];
  }
  if (position <= 17) {
    return ["Improve content depth & add FAQs", "Add structured data / schema markup"];
  }
  return ["Fix missing meta description", "Optimize title tag with primary keyword", "Add or improve H1 tag"];
}

// ── Fetch audit issues for a domain (reuses action-center pattern) ───────────

interface RawIssue {
  id: string;
  sev: "LOW" | "MED" | "HIGH";
}

/**
 * getAuditIssuesForDomain — fetches real audit issues from the latest
 * completed crawl job for a domain and returns top 4 HIGH-severity
 * issue labels as recommended actions.
 */
export async function getAuditIssuesForDomain(
  userId: string,
  domain: string
): Promise<string[]> {
  try {
    // Latest completed crawl job for this domain
    const { data: job } = await supabaseAdmin
      .from("crawl_jobs")
      .select("id")
      .eq("user_id", userId)
      .eq("domain", domain)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!job) return [];

    // Fetch issues from audit pages
    const { data: pages } = await supabaseAdmin
      .from("audit_pages")
      .select("issues")
      .eq("job_id", job.id);

    if (!pages || pages.length === 0) return [];

    // Aggregate HIGH-severity issue IDs by frequency
    const issueCount: Record<string, number> = {};
    for (const page of pages) {
      if (Array.isArray(page.issues)) {
        for (const issue of page.issues as RawIssue[]) {
          if (issue.sev === "HIGH") {
            issueCount[issue.id] = (issueCount[issue.id] ?? 0) + 1;
          }
        }
      }
    }

    // Sort by frequency, pick top 4, map to labels
    const sortedIssues = Object.entries(issueCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    const labels = sortedIssues
      .map(([id]) => ISSUE_META[id]?.label ?? null)
      .filter((l): l is string => l !== null);

    return labels.length > 0 ? labels : [];
  } catch {
    return [];
  }
}

// ── Main detection function ──────────────────────────────────────────────────

/**
 * detectAndSaveOpportunities — scans all rank_keywords for a user where
 * position is 11–20 and volume ≥ 1000. Upserts into seo_opportunities.
 * Auto-closes opportunities where position has improved to ≤ 10.
 *
 * Called once per user by /api/cron/rank-update after all domains refreshed.
 */
export async function detectAndSaveOpportunities(
  userId: string
): Promise<{ detected: number; errors: number }> {
  let detected = 0;
  let errors = 0;

  try {
    // 1. Fetch all qualifying keywords for this user (positions 11–20, volume ≥ 1000)
    const { data: keywords, error: kwErr } = await supabaseAdmin
      .from("rank_keywords")
      .select("id, domain, keyword, volume, position:rank_history(position, checked_at)")
      .eq("user_id", userId);

    if (kwErr || !keywords) return { detected: 0, errors: 1 };

    // We need current position from rank_history — fetch separately for accuracy
    const { data: kwWithPos } = await supabaseAdmin
      .from("rank_keywords")
      .select(`
        id,
        domain,
        keyword,
        volume,
        rank_history!inner(position, checked_at)
      `)
      .eq("user_id", userId)
      .gte("volume", 1000)
      .order("checked_at", { foreignTable: "rank_history", ascending: false });

    // Build a map of keyword_id → latest position (from rank_history)
    // Also get the latest position directly
    const { data: latestPositions } = await supabaseAdmin
      .from("rank_keywords")
      .select("id, domain, keyword, volume")
      .eq("user_id", userId)
      .gte("volume", 1000);

    if (!latestPositions) return { detected: 0, errors: 1 };

    // Get latest rank_history entry per keyword
    const { data: historyRows } = await supabaseAdmin
      .from("rank_history")
      .select("keyword_id, position, checked_at")
      .in("keyword_id", latestPositions.map(k => k.id))
      .order("checked_at", { ascending: false });

    // Build map: keyword_id → latest position
    const positionMap = new Map<string, number | null>();
    for (const row of historyRows ?? []) {
      if (!positionMap.has(row.keyword_id)) {
        positionMap.set(row.keyword_id, row.position);
      }
    }

    // 2. Filter to opportunity range (11–20) and group by domain
    const domainAuditCache = new Map<string, string[]>();
    const qualifying = latestPositions.filter(kw => {
      const pos = positionMap.get(kw.id);
      return pos !== null && pos !== undefined && pos >= 11 && pos <= 20;
    });

    // 3. Auto-close opportunities that have improved to ≤ 10
    const keywordsOnPage1 = latestPositions.filter(kw => {
      const pos = positionMap.get(kw.id);
      return pos !== null && pos !== undefined && pos <= 10;
    }).map(kw => kw.id);

    if (keywordsOnPage1.length > 0) {
      await supabaseAdmin
        .from("seo_opportunities")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("status", "open")
        .in("keyword_id", keywordsOnPage1);
    }

    // 4. Upsert each qualifying opportunity
    for (const kw of qualifying) {
      try {
        const position = positionMap.get(kw.id)!;
        const volume = kw.volume ?? 0;

        // Get audit issues for domain (cached per domain)
        if (!domainAuditCache.has(kw.domain)) {
          const issues = await getAuditIssuesForDomain(userId, kw.domain);
          domainAuditCache.set(kw.domain, issues);
        }
        const auditIssues = domainAuditCache.get(kw.domain)!;
        const recommendedActions =
          auditIssues.length > 0 ? auditIssues : genericActions(position);

        const { gain, targetPosition } = computeTrafficGain(position, volume);

        // Upsert: update if exists (preserve dismissed status), insert if new
        const { error: upsertErr } = await supabaseAdmin
          .from("seo_opportunities")
          .upsert(
            {
              user_id: userId,
              keyword_id: kw.id,
              domain: kw.domain,
              keyword: kw.keyword,
              current_position: position,
              target_position: targetPosition,
              search_volume: volume,
              estimated_traffic_gain: gain,
              recommended_actions: recommendedActions,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,keyword_id",
              ignoreDuplicates: false,
            }
          );

        // After upsert, if this keyword was previously auto-completed (position was ≤10
        // before, now back to 11–20), reset status to 'open'
        await supabaseAdmin
          .from("seo_opportunities")
          .update({ status: "open" })
          .eq("user_id", userId)
          .eq("keyword_id", kw.id)
          .eq("status", "completed"); // only reset auto-completed, NOT dismissed

        if (!upsertErr) detected++;
        else errors++;
      } catch {
        errors++;
      }
    }

    return { detected, errors };
  } catch {
    return { detected: 0, errors: 1 };
  }
}
