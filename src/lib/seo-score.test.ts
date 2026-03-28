import { describe, it, expect } from "vitest";
import { computeSeoScore } from "./seo-score";
import { validateAuditData } from "./audit-validator";

// ── computeSeoScore (density-based) ──────────────────────────────────────────

describe("computeSeoScore", () => {
  it("zero density → score 95 (clean site guardrail)", () => {
    expect(
      computeSeoScore({ critical: 0, warning: 0, notice: 0 })
    ).toBe(95);
  });

  it("pure warning density 0.5 → score 98 (100 - 0.5×4 = 98)", () => {
    expect(
      computeSeoScore({ critical: 0, warning: 0.5, notice: 0 })
    ).toBe(98);
  });

  it("critical density 1.0 → score 90 (100 - 1×10 = 90)", () => {
    expect(
      computeSeoScore({ critical: 1.0, warning: 0, notice: 0 })
    ).toBe(90);
  });

  it("critical density 3.0 → score 70 (100 - 3×10 = 70)", () => {
    expect(
      computeSeoScore({ critical: 3.0, warning: 0, notice: 0 })
    ).toBe(70);
  });

  it("mixed density → score = 100 − (2×10) − (1×4) − (2×1) = 74", () => {
    expect(
      computeSeoScore({ critical: 2, warning: 1, notice: 2 })
    ).toBe(74);
  });

  it("very high density → score floors at 0, never negative", () => {
    expect(
      computeSeoScore({ critical: 15, warning: 5, notice: 0 })
    ).toBe(0);
  });

  it("score never exceeds 95", () => {
    const s = computeSeoScore({ critical: 0, warning: 0, notice: 0 });
    expect(s).toBe(95);
    expect(s).not.toBe(100);
  });

  // ── Showstopper tests (applied after density calculation) ────────────────────

  it("noHttps showstopper: -25 flat deduction on top of density score", () => {
    // Density: critical 1.0 → score = 100 − 10 = 90
    // After noHttps (−25) → 90 − 25 = 65
    expect(
      computeSeoScore({ critical: 1.0, warning: 0, notice: 0, showstoppers: { noHttps: true } })
    ).toBe(65);
  });

  it("notMobileFriendly showstopper: -30 flat deduction on top of density score", () => {
    // Density: warning 2.0 → score = 100 − 8 = 92
    // After notMobileFriendly (−30) → 92 − 30 = 62
    expect(
      computeSeoScore({ critical: 0, warning: 2.0, notice: 0, showstoppers: { notMobileFriendly: true } })
    ).toBe(62);
  });

  it("both showstoppers: -55 total deduction, floors at 0", () => {
    // Density: critical 1.5 → score = 100 − 15 = 85
    // After both (−55) → 85 − 55 = 30
    expect(
      computeSeoScore({
        critical: 1.5,
        warning: 0,
        notice: 0,
        showstoppers: { noHttps: true, notMobileFriendly: true },
      })
    ).toBe(30);
  });

  it("showstoppers combined floor at 0, never negative", () => {
    // Density: critical 5.0 → score = 100 − 50 = 50
    // After both (−55) → 50 − 55 = −5 → floor to 0
    expect(
      computeSeoScore({
        critical: 5.0,
        warning: 0,
        notice: 0,
        showstoppers: { noHttps: true, notMobileFriendly: true },
      })
    ).toBe(0);
  });

  it("no showstoppers passed → uses only density calculation", () => {
    expect(
      computeSeoScore({ critical: 1.0, warning: 1.0, notice: 1.0 })
    ).toBe(
      computeSeoScore({
        critical: 1.0,
        warning: 1.0,
        notice: 1.0,
        showstoppers: undefined,
      })
    );
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
