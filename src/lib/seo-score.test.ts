import { describe, it, expect } from "vitest";
import { computeSeoScore } from "./seo-score";
import { validateAuditData } from "./audit-validator";

// ── computeSeoScore ───────────────────────────────────────────────────────────

describe("computeSeoScore", () => {
  it("50 pages + 0 issues → score 95 (clean guardrail)", () => {
    expect(
      computeSeoScore({ pages: 50, totalIssues: 0, criticalIssues: 0, warningIssues: 0, noticeIssues: 0 })
    ).toBe(95);
  });

  it("10 pages + 0 issues → score 95 (clean guardrail)", () => {
    expect(
      computeSeoScore({ pages: 10, totalIssues: 0, criticalIssues: 0, warningIssues: 0, noticeIssues: 0 })
    ).toBe(95);
  });

  it("10 pages + 2 warnings → score 94 (100 − 2×3)", () => {
    expect(
      computeSeoScore({ pages: 10, totalIssues: 2, criticalIssues: 0, warningIssues: 2, noticeIssues: 0 })
    ).toBe(94);
  });

  it("10 pages + 1 critical + 2 warnings → score 86 (100 − 8 − 6)", () => {
    expect(
      computeSeoScore({ pages: 10, totalIssues: 3, criticalIssues: 1, warningIssues: 2, noticeIssues: 0 })
    ).toBe(86);
  });

  it("10 pages + 1 critical + 1 warning + 1 notice → score 88 (100 − 8 − 3 − 1)", () => {
    expect(
      computeSeoScore({ pages: 10, totalIssues: 3, criticalIssues: 1, warningIssues: 1, noticeIssues: 1 })
    ).toBe(88);
  });

  it("0 pages → score 0 (nothing crawled)", () => {
    expect(
      computeSeoScore({ pages: 0, totalIssues: 0, criticalIssues: 0, warningIssues: 0, noticeIssues: 0 })
    ).toBe(0);
  });

  it("many critical issues → score floors at 0, never negative", () => {
    expect(
      computeSeoScore({ pages: 5, totalIssues: 20, criticalIssues: 15, warningIssues: 5, noticeIssues: 0 })
    ).toBe(0);
  });

  it("score never exceeds 95 for clean site", () => {
    const s = computeSeoScore({ pages: 100, totalIssues: 0, criticalIssues: 0, warningIssues: 0, noticeIssues: 0 });
    expect(s).toBe(95);
    expect(s).not.toBe(100);
  });
});

// ── validateAuditData ─────────────────────────────────────────────────────────

describe("validateAuditData", () => {
  it("score = 0, pages > 0, issues = 0 → corrects to 95", () => {
    const result = validateAuditData({ score: 0, pages: 10, totalIssues: 0 });
    expect(result.score).toBe(95);
  });

  it("score = 50, pages > 0, issues = 0 → corrects to 95", () => {
    const result = validateAuditData({ score: 50, pages: 8, totalIssues: 0 });
    expect(result.score).toBe(95);
  });

  it("score = 75, pages = 0, issues = 5 → corrects to 0 (no pages crawled)", () => {
    const result = validateAuditData({ score: 75, pages: 0, totalIssues: 5 });
    expect(result.score).toBe(0);
  });

  it("score = 72, pages = 8, issues = 5 → unchanged (valid state)", () => {
    const result = validateAuditData({ score: 72, pages: 8, totalIssues: 5 });
    expect(result.score).toBe(72);
  });

  it("score = 95, pages = 10, issues = 0 → unchanged (already correct)", () => {
    const result = validateAuditData({ score: 95, pages: 10, totalIssues: 0 });
    expect(result.score).toBe(95);
  });

  it("score = 0, pages = 0, issues = 0 → stays 0 (no pages, no score)", () => {
    const result = validateAuditData({ score: 0, pages: 0, totalIssues: 0 });
    expect(result.score).toBe(0);
  });

  it("does not mutate the input object", () => {
    const input = { score: 0, pages: 10, totalIssues: 0 };
    validateAuditData(input);
    expect(input.score).toBe(0); // original unchanged
  });

  it("preserves extra fields from extended input", () => {
    const result = validateAuditData({ score: 0, pages: 5, totalIssues: 0, domain: "example.com" });
    expect(result.score).toBe(95);
    expect(result.domain).toBe("example.com");
  });
});
