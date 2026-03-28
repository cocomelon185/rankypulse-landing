export type OpportunityRating = "⭐⭐⭐⭐⭐" | "⭐⭐⭐⭐" | "⭐⭐⭐" | "⭐⭐" | "⭐" | "Unavailable";
export type OpportunityStatus =
  | "Top opportunity"
  | "Strong opportunity"
  | "Worth testing"
  | "Low upside"
  | "Very low priority"
  | "Opportunity unavailable";

export type OpportunityScoreResult = {
  opportunityScore: number | null;
  opportunityRating: OpportunityRating;
  opportunityStatus: OpportunityStatus;
};

const VOLUME_WEIGHT = 0.5;
const CPC_WEIGHT = 0.2;
const DIFFICULTY_WEIGHT = 0.3;

const VOLUME_CAP = 10_000;
const CPC_CAP = 20;

function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function safeNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizeVolume(volume: number | null | undefined): number {
  const safe = Math.max(0, safeNumber(volume) ?? 0);
  if (safe === 0) return 0;
  return clamp((Math.log10(safe + 1) / Math.log10(VOLUME_CAP + 1)) * 100);
}

export function normalizeCpc(cpc: number | null | undefined): number {
  const safe = Math.max(0, safeNumber(cpc) ?? 0);
  if (safe === 0) return 0;
  return clamp((Math.min(safe, CPC_CAP) / CPC_CAP) * 100);
}

export function getOpportunityRating(score: number | null | undefined): OpportunityRating {
  const safe = safeNumber(score);
  if (safe === null) return "Unavailable";
  if (safe >= 90) return "⭐⭐⭐⭐⭐";
  if (safe >= 70) return "⭐⭐⭐⭐";
  if (safe >= 50) return "⭐⭐⭐";
  if (safe >= 30) return "⭐⭐";
  return "⭐";
}

export function getOpportunityStatus(score: number | null | undefined): OpportunityStatus {
  const safe = safeNumber(score);
  if (safe === null) return "Opportunity unavailable";
  if (safe >= 90) return "Top opportunity";
  if (safe >= 70) return "Strong opportunity";
  if (safe >= 50) return "Worth testing";
  if (safe >= 30) return "Low upside";
  return "Very low priority";
}

export function computeOpportunityScore(input: {
  volume: number | null | undefined;
  cpc: number | null | undefined;
  difficultyScore: number | null | undefined;
}): OpportunityScoreResult {
  const difficultyScore = safeNumber(input.difficultyScore);
  if (difficultyScore === null) {
    return {
      opportunityScore: null,
      opportunityRating: "Unavailable",
      opportunityStatus: "Opportunity unavailable",
    };
  }

  const volumeComponent = normalizeVolume(input.volume);
  const cpcComponent = normalizeCpc(input.cpc);
  const difficultyComponent = clamp(100 - difficultyScore);

  const score = clamp(
    Math.round(
      volumeComponent * VOLUME_WEIGHT +
        cpcComponent * CPC_WEIGHT +
        difficultyComponent * DIFFICULTY_WEIGHT
    )
  );

  return {
    opportunityScore: score,
    opportunityRating: getOpportunityRating(score),
    opportunityStatus: getOpportunityStatus(score),
  };
}

export function sortByOpportunity<T extends { opportunityScore: number | null | undefined }>(rows: T[]): T[] {
  return [...rows].sort((left, right) => (safeNumber(right.opportunityScore) ?? -1) - (safeNumber(left.opportunityScore) ?? -1));
}
