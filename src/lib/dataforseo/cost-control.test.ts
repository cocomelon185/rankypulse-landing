import { describe, expect, it, vi } from "vitest";
vi.mock("../supabase", () => ({
  supabaseAdmin: {},
}));
import {
  adjustFetchSizeForBudget,
  canAutoAnalyzeDifficulty,
  getKeywordPlanLimits,
  normalizePlan,
} from "./cost-control";

describe("dataforseo cost control helpers", () => {
  it("normalizes plans safely", () => {
    expect(normalizePlan("starter")).toBe("starter");
    expect(normalizePlan("unknown")).toBe("free");
  });

  it("returns plan limits", () => {
    expect(getKeywordPlanLimits("free").searchesPerDay).toBe(5);
    expect(getKeywordPlanLimits("pro").maxAnalyzedKeywordsPerSearch).toBe(25);
  });

  it("reduces fetch size in degraded mode", () => {
    expect(adjustFetchSizeForBudget({ requested: 25, defaultSize: 25, mode: "degraded" })).toBeLessThanOrEqual(12);
  });

  it("disables auto difficulty in cache-only mode", () => {
    expect(canAutoAnalyzeDifficulty({ mode: "cache_only", requestedCount: 5, planLimit: 10 })).toBe(0);
  });
});
