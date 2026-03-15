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
   * Showstoppers: apply proportional percentage-based reductions.
   * Ensures "broken" sites don't score too high, while rewarding smaller sites for effort.
   * Uses multipliers (not flat deductions) so penalties scale with baseline quality.
   */
  showstoppers?: {
    /** Site serves pages over HTTP — ×0.80 multiplier (20% reduction) */
    noHttps?: boolean;
    /** Site has no viewport meta tag — not mobile-friendly — ×0.70 multiplier (30% reduction) */
    notMobileFriendly?: boolean;
  };
}

/**
 * Compute SEO score from issue density (occurrences per page).
 *
 * Formula: score = 100 − (criticalDensity×10 + warningDensity×4 + noticeDensity×1)
 * Apply showstopper multipliers (×0.8 for HTTPS, ×0.7 for mobile-friendliness).
 * Soft floor at 20 — matches Ahrefs/Semrush practices (never shows 0).
 * Max score is 100 — a perfect site with zero issues gets a perfect score.
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

  // Apply Showstopper multipliers (Density First, Percentage Reductions Last)
  // These proportional penalties ensure critical structural failures reduce scores fairly:
  // - A "perfect" site (100) losing 30% becomes 70 (still respectable)
  // - A struggling site (50) losing 30% becomes 35 (clearly bad)
  // This matches how Ahrefs/Semrush handle site-wide penalties.
  if (densities.showstoppers?.noHttps) score *= 0.8;        // 20% reduction
  if (densities.showstoppers?.notMobileFriendly) score *= 0.7; // 30% reduction

  // Soft floor at 20 — never shows 0 (looks like a bug)
  // Max is 100 — a perfect site gets a perfect score
  if (score > 100) score = 100;
  if (score < 20) score = 20;
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
  return Math.min(avg, 100);
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
