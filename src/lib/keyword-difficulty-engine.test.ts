import { describe, expect, it } from "vitest";
import {
  classifyDifficultyLabel,
  computeDifficultyScore,
} from "./keyword-difficulty-engine";

describe("keyword difficulty engine", () => {
  it("computes deterministic difficulty from valid signals", () => {
    const score = computeDifficultyScore({
      searchResultsCount: 100_000,
      avgDomainAuthorityTop10: 30,
      avgBacklinksTop10: 100,
    });

    expect(score).toBe(75);
    expect(classifyDifficultyLabel(score)).toBe("Hard");
  });

  it("clamps very large values to 100", () => {
    const score = computeDifficultyScore({
      searchResultsCount: 10 ** 20,
      avgDomainAuthorityTop10: 100,
      avgBacklinksTop10: 10 ** 12,
    });

    expect(score).toBe(100);
    expect(classifyDifficultyLabel(score)).toBe("Very Hard");
  });

  it("returns null when required signals are missing", () => {
    expect(
      computeDifficultyScore({
        searchResultsCount: 1000,
        avgDomainAuthorityTop10: null,
        avgBacklinksTop10: 20,
      })
    ).toBeNull();
    expect(classifyDifficultyLabel(null)).toBe("Difficulty unavailable");
  });

  it("maps all thresholds correctly", () => {
    expect(classifyDifficultyLabel(10)).toBe("Easy");
    expect(classifyDifficultyLabel(45)).toBe("Medium");
    expect(classifyDifficultyLabel(75)).toBe("Hard");
    expect(classifyDifficultyLabel(90)).toBe("Very Hard");
  });
});
