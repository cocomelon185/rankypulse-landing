import { describe, expect, it } from "vitest";
import { generateAutocompleteExpansions } from "./autocomplete-expansion";

describe("generateAutocompleteExpansions", () => {
  it("creates deduped modifier and alphabet suggestions", () => {
    const rows = generateAutocompleteExpansions({
      seed: "seo audit",
      contextKeywords: ["seo audit", "technical seo", "website audit"],
    });

    expect(rows.length).toBeGreaterThan(10);
    expect(new Set(rows.map((row) => row.keyword)).size).toBe(rows.length);
    expect(rows.some((row) => row.keyword === "seo audit tool")).toBe(true);
  });
});
