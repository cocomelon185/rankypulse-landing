/**
 * seo-score.ts — shared SEO score calculation
 *
 * Single source of truth for health-score computation.
 * Used by getDashboardData(), /api/audits/data, and /api/audits/[auditId]/data
 * so every page shows the same number.
 */

/**
 * Calculate the average SEO health score across a set of audited pages.
 * Each page has a numeric score 0–100; we return the rounded mean.
 * Returns 0 when the pages array is empty (new/unaudited site).
 *
 * NOTE: Still used for previousScore delta calculations and getDashboardData.
 * For the primary audit score, prefer computeSeoScore() which is more reliable
 * when per-page PSI scores are null (free tier).
 */
export function calculateSeoScore(pages: { score: number | null }[]): number {
  if (!pages.length) return 0;
  const total = pages.reduce((sum, p) => sum + (p.score ?? 0), 0);
  return Math.round(total / pages.length);
}

// ── Guardrail-based deterministic scorer ─────────────────────────────────────

export interface SeoScoreInput {
  /** Number of pages crawled in this job */
  pages: number;
  /** Total distinct issue types found (errors + warnings + notices) */
  totalIssues: number;
  /** Distinct HIGH-severity issue types */
  criticalIssues: number;
  /** Distinct MED-severity issue types */
  warningIssues: number;
  /** Distinct LOW-severity issue types */
  noticeIssues: number;
  /** Optional page-level scores — reserved for future PSI integration */
  pageScores?: number[];
}

/**
 * Computes SEO score from issue counts using a deterministic, issue-weighted formula.
 * More reliable than calculateSeoScore() when per-page PSI scores are null (free tier).
 *
 * Formula:  score = 100 − (critical×8) − (warning×3) − (notice×1),  floor 0
 * Guardrails:
 *   • pages === 0  → 0  (nothing crawled, no score possible)
 *   • pages > 0 && totalIssues === 0  → 95  (clean crawl, nearly perfect)
 *
 * This is the primary scoring function for /api/audits/data.
 */
export function computeSeoScore(input: SeoScoreInput): number {
  const { pages, totalIssues, criticalIssues, warningIssues, noticeIssues } = input;

  // Guardrail: no pages crawled → no score
  if (pages === 0) return 0;

  // Issue-weighted base score
  let score = 100;
  score -= criticalIssues * 8;
  score -= warningIssues * 3;
  score -= noticeIssues * 1;
  score = Math.max(score, 0);

  // Guardrail: clean crawl → 95 (not 100, leaves room for content improvements)
  if (pages > 0 && totalIssues === 0) {
    score = 95;
  }

  if (process.env.NODE_ENV === "development" && totalIssues === 0 && pages > 0) {
    console.warn("[RankyPulse] Score guardrail applied: clean crawl → 95/100");
  }

  return score;
}
