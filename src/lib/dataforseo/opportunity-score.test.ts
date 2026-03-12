import { describe, expect, it } from "vitest";
import {
  computeFullOpportunityScore,
  computePreOpportunityScore,
  normalizeCpc,
  normalizeVolume,
} from "./opportunity-score";

describe("dataforseo opportunity score", () => {
  it("computes a provisional score safely", () => {
    const result = computePreOpportunityScore({ volume: 1200, cpc: 4.5 });
    expect(result.kind).toBe("preliminary");
    expect(result.score).not.toBeNull();
    expect(Number.isFinite(result.score as number)).toBe(true);
  });

  it("computes a full score when difficulty exists", () => {
    const result = computeFullOpportunityScore({ volume: 1200, cpc: 4.5, difficulty: 32 });
    expect(result.kind).toBe("full");
    expect((result.score as number) > 0).toBe(true);
  });

  it("returns unavailable when difficulty is missing", () => {
    const result = computeFullOpportunityScore({ volume: 1200, cpc: 4.5, difficulty: null });
    expect(result.kind).toBe("unavailable");
    expect(result.score).toBeNull();
  });

  it("never emits nan during normalization", () => {
    expect(normalizeVolume(undefined)).toBe(0);
    expect(normalizeCpc(undefined)).toBe(0);
  });
});
