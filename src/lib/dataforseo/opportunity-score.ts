export type OpportunityKind = "preliminary" | "full" | "unavailable";

export type OpportunityScore = {
  score: number | null;
  kind: OpportunityKind;
  label: "Excellent" | "Strong" | "Moderate" | "Weak" | "Poor" | "Unavailable";
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

function safeNumber(value: number | null | undefined): number | null {
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

export function getOpportunityLabel(score: number | null | undefined): OpportunityScore["label"] {
  const safe = safeNumber(score);
  if (safe === null) return "Unavailable";
  if (safe >= 90) return "Excellent";
  if (safe >= 75) return "Strong";
  if (safe >= 60) return "Moderate";
  if (safe >= 40) return "Weak";
  return "Poor";
}

export function computePreOpportunityScore(input: {
  volume: number | null | undefined;
  cpc: number | null | undefined;
}): OpportunityScore {
  const score = clamp(
    Math.round(normalizeVolume(input.volume) * 0.7 + normalizeCpc(input.cpc) * 0.3)
  );

  return {
    score,
    kind: "preliminary",
    label: getOpportunityLabel(score),
  };
}

export function computeFullOpportunityScore(input: {
  volume: number | null | undefined;
  cpc: number | null | undefined;
  difficulty: number | null | undefined;
}): OpportunityScore {
  const difficulty = safeNumber(input.difficulty);
  if (difficulty === null) {
    return {
      score: null,
      kind: "unavailable",
      label: "Unavailable",
    };
  }

  const score = clamp(
    Math.round(
      normalizeVolume(input.volume) * VOLUME_WEIGHT +
        normalizeCpc(input.cpc) * CPC_WEIGHT +
        clamp(100 - difficulty) * DIFFICULTY_WEIGHT
    )
  );

  return {
    score,
    kind: "full",
    label: getOpportunityLabel(score),
  };
}

