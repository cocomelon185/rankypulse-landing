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
 */
export function calculateSeoScore(pages: { score: number | null }[]): number {
  if (!pages.length) return 0;
  const total = pages.reduce((sum, p) => sum + (p.score ?? 0), 0);
  return Math.round(total / pages.length);
}
