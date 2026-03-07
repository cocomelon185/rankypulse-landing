/**
 * audit-validator.ts — data integrity layer for audit API responses.
 *
 * Prevents logically contradictory audit states from ever reaching the UI.
 * Call validateAuditData() immediately before returning /api/audits/data responses.
 *
 * Guarantees:
 *   ✓  pages > 0, issues = 0  → score is always ≥ 90
 *   ✓  pages = 0              → score is always 0
 *   ✓  issues = 0, score < 50 → score is corrected to 95
 */

export interface AuditResult {
  /** The computed SEO health score (0–100) */
  score: number;
  /** Total number of pages crawled */
  pages: number;
  /** Total distinct issue types found across all severity levels */
  totalIssues: number;
}

/**
 * Validates an audit result object and corrects any logically contradictory states.
 * Returns a new object (does not mutate input).
 *
 * Three guardrails:
 *   1. score < 90 with pages > 0 and no issues → correct to 95
 *   2. score > 0 with pages = 0                → correct to 0
 *   3. score < 50 with pages > 0 and no issues → correct to 95 (belt-and-suspenders)
 */
export function validateAuditData<T extends AuditResult>(audit: T): T {
  const result = { ...audit };

  // Contradiction 1: low score but no issues detected (impossible state)
  if (result.pages > 0 && result.totalIssues === 0 && result.score < 90) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[RankyPulse] Score guardrail applied: score=${result.score} with 0 issues and ${result.pages} pages → corrected to 95`
      );
    }
    result.score = 95;
  }

  // Contradiction 2: positive score but no pages were crawled
  if (result.pages === 0 && result.score > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[RankyPulse] Score guardrail applied: score=${result.score} with 0 pages → corrected to 0`
      );
    }
    result.score = 0;
  }

  // Contradiction 3: extremely low score with no issues (belt-and-suspenders)
  if (result.totalIssues === 0 && result.score < 50 && result.pages > 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[RankyPulse] Score guardrail applied: score=${result.score} < 50 with 0 issues → corrected to 95`
      );
    }
    result.score = 95;
  }

  return result;
}
