import type { RecommendedContentType } from "@/lib/keyword-content-recommendation";

const CTR_BY_CONTENT: Record<RecommendedContentType, { low: number; high: number }> = {
  "Landing Page": { low: 0.08, high: 0.16 },
  "Comparison Article": { low: 0.07, high: 0.15 },
  "Blog Post": { low: 0.05, high: 0.12 },
  "Tool Page": { low: 0.1, high: 0.2 },
};

export function estimateTrafficPotential(params: {
  volume: number | null | undefined;
  difficultyScore: number | null | undefined;
  contentType: RecommendedContentType;
}): { low: number | null; high: number | null } {
  const volume = typeof params.volume === "number" && Number.isFinite(params.volume) ? Math.max(0, params.volume) : null;
  const difficulty = typeof params.difficultyScore === "number" && Number.isFinite(params.difficultyScore) ? params.difficultyScore : null;

  if (volume === null || difficulty === null) {
    return { low: null, high: null };
  }

  const ctr = CTR_BY_CONTENT[params.contentType];
  const difficultyPenalty = difficulty >= 80 ? 0.55 : difficulty >= 60 ? 0.7 : difficulty >= 40 ? 0.82 : 1;

  return {
    low: Math.max(0, Math.round(volume * ctr.low * difficultyPenalty)),
    high: Math.max(0, Math.round(volume * ctr.high * difficultyPenalty)),
  };
}
