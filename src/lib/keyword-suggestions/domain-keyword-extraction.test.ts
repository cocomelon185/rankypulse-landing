import { describe, expect, it } from "vitest";
import { extractDomainSeedSuggestions } from "./domain-keyword-extraction";

describe("extractDomainSeedSuggestions", () => {
  it("pulls strong seeds from homepage and repeated page metadata", () => {
    const seeds = extractDomainSeedSuggestions({
      domain: "rankypulse.com",
      pages: [
        {
          url: "https://rankypulse.com",
          metadata: {
            title: "SEO Audit Tool | RankyPulse",
            meta_description: "Run an SEO audit and technical SEO analysis for your website.",
          },
        },
        {
          url: "https://rankypulse.com/technical-seo-audit",
          metadata: {
            title: "Technical SEO Audit Guide | RankyPulse",
            meta_description: "Technical SEO audit checklist and site health analysis.",
          },
        },
      ],
    });

    expect(seeds.length).toBeGreaterThan(0);
    expect(seeds.map((row) => row.keyword)).toContain("seo audit tool");
  });
});
