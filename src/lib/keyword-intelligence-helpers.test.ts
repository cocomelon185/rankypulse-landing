import { describe, expect, it } from "vitest";
import { clusterKeywords } from "./keyword-clustering";
import { recommendContentType } from "./keyword-content-recommendation";
import { classifyKeywordIntent } from "./keyword-intent";
import { estimateTrafficPotential } from "./keyword-traffic-potential";

describe("keyword intelligence helpers", () => {
  it("classifies keyword intent deterministically", () => {
    expect(classifyKeywordIntent("what is seo audit")).toBe("informational");
    expect(classifyKeywordIntent("best free seo audit")).toBe("commercial");
    expect(classifyKeywordIntent("seo audit tool")).toBe("transactional");
    expect(classifyKeywordIntent("rankypulse login")).toBe("navigational");
  });

  it("recommends content types from keyword shape and intent", () => {
    expect(recommendContentType("best seo audit tools", "commercial")).toBe("Comparison Article");
    expect(recommendContentType("seo audit tool", "transactional")).toBe("Tool Page");
    expect(recommendContentType("what is seo audit", "informational")).toBe("Blog Post");
  });

  it("estimates traffic conservatively and safely", () => {
    expect(
      estimateTrafficPotential({
        volume: 1000,
        difficultyScore: 30,
        contentType: "Tool Page",
      })
    ).toEqual({ low: 100, high: 200 });

    expect(
      estimateTrafficPotential({
        volume: null,
        difficultyScore: 30,
        contentType: "Landing Page",
      })
    ).toEqual({ low: null, high: null });
  });

  it("clusters keywords deterministically and picks the top opportunity keyword", () => {
    const { clusters, keywordToCluster } = clusterKeywords([
      { keyword: "best free seo audit", volume: 1000, difficultyScore: 35, opportunityScore: 82 },
      { keyword: "seo audit tool", volume: 800, difficultyScore: 48, opportunityScore: 74 },
      { keyword: "backlink checker", volume: 600, difficultyScore: 42, opportunityScore: 77 },
      { keyword: "free backlink checker", volume: 300, difficultyScore: 31, opportunityScore: 80 },
    ]);

    expect(clusters).toHaveLength(2);
    expect(keywordToCluster.get("best free seo audit")?.clusterName).toBe("General Opportunities");
    expect(keywordToCluster.get("backlink checker")?.clusterName).toBe("Backlink");
    expect(clusters.find((cluster) => cluster.clusterName === "Backlink")?.topKeyword).toBe("free backlink checker");
  });
});
