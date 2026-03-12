import { describe, expect, it } from "vitest";
import {
  computeOpportunityScore,
  getOpportunityRating,
  getOpportunityStatus,
  normalizeCpc,
  normalizeVolume,
  sortByOpportunity,
} from "./keyword-opportunity-score";

describe("keyword opportunity score", () => {
  it("computes a stable opportunity score with full inputs", () => {
    const result = computeOpportunityScore({
      volume: 4400,
      cpc: 12.5,
      difficultyScore: 34,
    });

    expect(result.opportunityScore).toBeTypeOf("number");
    expect(result.opportunityScore).toBeGreaterThan(60);
    expect(result.opportunityRating).toBe("⭐⭐⭐⭐");
    expect(result.opportunityStatus).toBe("Strong opportunity");
  });

  it("returns unavailable when difficulty is missing", () => {
    const result = computeOpportunityScore({
      volume: 1200,
      cpc: 4,
      difficultyScore: null,
    });

    expect(result.opportunityScore).toBeNull();
    expect(result.opportunityRating).toBe("Unavailable");
    expect(result.opportunityStatus).toBe("Opportunity unavailable");
  });

  it("handles missing cpc without NaN", () => {
    const result = computeOpportunityScore({
      volume: 800,
      cpc: null,
      difficultyScore: 48,
    });

    expect(Number.isFinite(result.opportunityScore)).toBe(true);
  });

  it("keeps zero volume valid and low", () => {
    const result = computeOpportunityScore({
      volume: 0,
      cpc: 0,
      difficultyScore: 25,
    });

    expect(result.opportunityScore).toBe(23);
    expect(result.opportunityRating).toBe("⭐");
  });

  it("normalizes volume and cpc with caps", () => {
    expect(normalizeVolume(0)).toBe(0);
    expect(normalizeVolume(10_000)).toBe(100);
    expect(normalizeCpc(0)).toBe(0);
    expect(normalizeCpc(25)).toBe(100);
  });

  it("maps ratings and statuses across thresholds", () => {
    expect(getOpportunityRating(95)).toBe("⭐⭐⭐⭐⭐");
    expect(getOpportunityRating(80)).toBe("⭐⭐⭐⭐");
    expect(getOpportunityRating(55)).toBe("⭐⭐⭐");
    expect(getOpportunityRating(35)).toBe("⭐⭐");
    expect(getOpportunityRating(10)).toBe("⭐");
    expect(getOpportunityRating(null)).toBe("Unavailable");

    expect(getOpportunityStatus(95)).toBe("Top opportunity");
    expect(getOpportunityStatus(80)).toBe("Strong opportunity");
    expect(getOpportunityStatus(55)).toBe("Worth testing");
    expect(getOpportunityStatus(35)).toBe("Low upside");
    expect(getOpportunityStatus(10)).toBe("Very low priority");
    expect(getOpportunityStatus(null)).toBe("Opportunity unavailable");
  });

  it("sorts rows by opportunity descending with nulls last", () => {
    const rows = [
      { keyword: "a", opportunityScore: 42 },
      { keyword: "b", opportunityScore: null },
      { keyword: "c", opportunityScore: 91 },
      { keyword: "d", opportunityScore: 65 },
    ];

    expect(sortByOpportunity(rows).map((row) => row.keyword)).toEqual(["c", "d", "a", "b"]);
  });

  it("never emits NaN or Infinity", () => {
    const result = computeOpportunityScore({
      volume: Number.NaN,
      cpc: Number.POSITIVE_INFINITY,
      difficultyScore: 50,
    });

    expect(Number.isFinite(result.opportunityScore)).toBe(true);
  });
});
