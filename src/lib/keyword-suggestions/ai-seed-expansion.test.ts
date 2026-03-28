import { describe, expect, it } from "vitest";
import { generateAiSeedSuggestions } from "./ai-seed-expansion";

describe("generateAiSeedSuggestions", () => {
  it("returns practical starter seeds for a broad topic even without AI", async () => {
    const rows = await generateAiSeedSuggestions({ topic: "SEO", domain: "rankypulse.com" });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.keyword.includes("seo audit"))).toBe(true);
  });
});
