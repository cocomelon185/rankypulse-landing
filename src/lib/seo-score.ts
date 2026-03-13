/**
 * seo-score.ts — shared SEO score calculation
 *
 * Single source of truth for health-score computation.
 * Density-based formula (Semrush-style): score is normalized by page count
 * so a large site with the same ratio of issues scores identically to a small site.
 */

// ── Density-based scoring (primary) ─────────────────────────────────────────

export interface AuditDensity {
  /** totalCriticalOccurrences / totalPagesCrawled */
  critical: number;
  /** totalWarningOccurrences / totalPagesCrawled */
  warning: number;
  /** totalNoticeOccurrences / totalPagesCrawled */
  notice: number;
  /**
   * Showstoppers: trigger large flat deductions regardless of issue density.
   * Ensures "broken" sites can't hide behind a high page count.
   */
  showstoppers?: {
    /** Site serves pages over HTTP — -25 flat points */
    noHttps?: boolean;
    /** Site has no viewport meta tag — not mobile-friendly — -30 flat points */
    notMobileFriendly?: boolean;
  };
}

/**
 * Compute SEO score from issue density (occurrences per page).
 *
 * Formula: score = 100 − (criticalDensity×10 + warningDensity×4 + noticeDensity×1)
 * Apply showstopper deductions (-25 for HTTPS, -30 for mobile-friendliness).
 * Cap at 95 — no site is truly perfect.
 * Floor at 0.
 *
 * @param densities   Pre-computed density values (occurrences / pages)
 */
export function computeSeoScore(densities: AuditDensity): number {
  const CRITICAL_WEIGHT = 10;
  const WARNING_WEIGHT = 4;
  const NOTICE_WEIGHT = 1;

  const deduction =
    densities.critical * CRITICAL_WEIGHT +
    densities.warning  * WARNING_WEIGHT  +
    densities.notice   * NOTICE_WEIGHT;

  let score = 100 - deduction;

  // Apply Showstopper overrides (Density First, Showstoppers Last)
  // These flat deductions ensure critical structural failures drag the score down
  // regardless of page count or issue density.
  if (densities.showstoppers?.noHttps) score -= 25;
  if (densities.showstoppers?.notMobileFriendly) score -= 30;

  // Floor at 0, cap at 95
  if (score > 95) score = 95;
  if (score < 0)  score = 0;
  return Math.round(score);
}

// ── Urgency metrics ──────────────────────────────────────────────────────────

export interface UrgencyMetrics {
  /** Estimated monthly revenue leaking due to critical SEO issues */
  monthlyLoss: number;
  /** Urgency level based on loss amount */
  urgencyLevel: "critical" | "high" | "medium" | "low";
  /** Human-readable summary */
  summary: string;
}

/**
 * Calculate estimated monthly revenue loss from critical SEO issues.
 *
 * Formula: monthlyLoss = criticalCount × (traffic × conversionLeakRate × customerValue)
 *
 * @param criticalCount  Total critical issue occurrences across all pages
 * @param traffic        Estimated monthly organic visitors (default 1000)
 * @param customerValue  Average order/customer value in USD (default 50)
 */
export function calculateUrgencyMetrics(
  criticalCount: number,
  traffic: number = 1000,
  customerValue: number = 50
): UrgencyMetrics {
  const CONVERSION_LEAK_RATE = 0.02; // 2% conversion leak per critical issue
  const monthlyLoss = Math.round(
    criticalCount * (traffic * CONVERSION_LEAK_RATE * customerValue)
  );

  let urgencyLevel: UrgencyMetrics["urgencyLevel"];
  let summary: string;

  if (monthlyLoss >= 10000) {
    urgencyLevel = "critical";
    summary = `Critical: Estimated $${monthlyLoss.toLocaleString()}/month in lost revenue`;
  } else if (monthlyLoss >= 2000) {
    urgencyLevel = "high";
    summary = `High priority: Estimated $${monthlyLoss.toLocaleString()}/month in lost revenue`;
  } else if (monthlyLoss >= 500) {
    urgencyLevel = "medium";
    summary = `Medium priority: Estimated $${monthlyLoss.toLocaleString()}/month in lost revenue`;
  } else {
    urgencyLevel = "low";
    summary =
      monthlyLoss > 0
        ? `Low priority: Estimated $${monthlyLoss.toLocaleString()}/month in lost revenue`
        : "No critical issues — maintain regular audits";
  }

  return { monthlyLoss, urgencyLevel, summary };
}

// ── Legacy: page-average scorer (kept for backward compat) ───────────────────

/**
 * Calculate the average SEO health score across a set of audited pages.
 * Each page has a numeric score 0–100; we return the rounded mean.
 * Returns 0 when the pages array is empty (new/unaudited site).
 *
 * NOTE: Used for previousScore delta calculations and getDashboardData.
 * For the primary audit score, prefer computeSeoScore() with AuditDensity.
 */
export function calculateSeoScore(pages: { score: number | null }[]): number {
  if (!pages.length) return 0;
  const total = pages.reduce((sum, p) => sum + (p.score ?? 0), 0);
  const avg = Math.round(total / pages.length);
  // Cap at 95 — matches computeSeoScore guardrail
  return Math.min(avg, 95);
}

// ── Legacy SeoScoreInput shape (kept so any remaining callers don't break) ───

/** @deprecated Use AuditDensity + computeSeoScore() instead */
export interface SeoScoreInput {
  pages: number;
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  noticeIssues: number;
  pageScores?: number[];
}
