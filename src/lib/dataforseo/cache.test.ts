import { describe, expect, it, vi } from "vitest";
vi.mock("../supabase", () => ({
  supabaseAdmin: {},
}));
import {
  buildKeywordMetricKey,
  buildKeywordResearchCacheKey,
  normalizeDomain,
  normalizeKeywordSeed,
} from "./cache";

describe("dataforseo cache helpers", () => {
  it("normalizes domains and keywords consistently", () => {
    expect(normalizeDomain("https://www.RankyPulse.com/path")).toBe("rankypulse.com");
    expect(normalizeKeywordSeed("  SEO   Audit Tool  ")).toBe("seo audit tool");
  });

  it("creates stable search cache keys", () => {
    const first = buildKeywordResearchCacheKey({
      domain: "https://www.rankypulse.com",
      seedKeyword: " SEO   Audit Tool ",
      countryCode: "us",
    });
    const second = buildKeywordResearchCacheKey({
      domain: "rankypulse.com",
      seedKeyword: "seo audit tool",
      countryCode: "US",
    });
    expect(first).toBe(second);
  });

  it("creates stable metric keys", () => {
    expect(buildKeywordMetricKey({ keyword: " SEO Audit ", countryCode: "us" })).toBe(
      buildKeywordMetricKey({ keyword: "seo audit", countryCode: "US" })
    );
  });
});
