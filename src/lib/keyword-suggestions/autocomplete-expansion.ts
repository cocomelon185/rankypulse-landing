import { dedupeNormalized, meaningfulTokens, normalizePhrase, phraseOverlapScore } from "./normalize";
import type { ExpandedSuggestion } from "./types";

const PREFIX_MODIFIERS = [
  "best",
  "free",
  "local",
  "small business",
  "technical",
  "website",
  "site",
];

const SUFFIX_MODIFIERS = [
  "tool",
  "tools",
  "software",
  "checker",
  "checklist",
  "guide",
  "service",
  "template",
  "comparison",
  "pricing",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreExpansion(keyword: string, seed: string, contextTokens: string[]): number {
  const normalized = normalizePhrase(keyword);
  const tokens = meaningfulTokens(normalized);
  const overlap = phraseOverlapScore(normalized, contextTokens);
  const commercialHits = ["best", "free", "tool", "checker", "software", "service", "comparison", "pricing"].filter((term) => normalized.includes(term)).length;

  return clamp(
    35 +
      (normalized.startsWith(seed) ? 12 : 0) +
      overlap * 20 +
      commercialHits * 8 +
      (tokens.length >= 3 && tokens.length <= 5 ? 14 : 0),
    0,
    100
  );
}

export function generateAutocompleteExpansions(input: {
  seed: string;
  contextKeywords?: string[];
}): ExpandedSuggestion[] {
  const seed = normalizePhrase(input.seed);
  const contextTokens = (input.contextKeywords ?? []).flatMap((item) => meaningfulTokens(item));
  if (!seed) return [];

  const letterVariants = "abcdefghijklmnopqrstuvwxyz".split("").map((letter) => `${seed} ${letter}`);
  const prefixed = PREFIX_MODIFIERS.map((modifier) => `${modifier} ${seed}`);
  const suffixed = SUFFIX_MODIFIERS.map((modifier) => `${seed} ${modifier}`);
  const combined = [
    ...prefixed,
    ...suffixed,
    `${seed} for small business`,
    `${seed} for saas`,
    `${seed} for ecommerce`,
    `${seed} for wordpress`,
    `${seed} guide`,
    `${seed} ideas`,
    `${seed} examples`,
    ...letterVariants,
  ];

  return dedupeNormalized(
    combined.map((keyword) => ({
      keyword,
      source: "autocomplete" as const,
      basedOn: seed,
      score: scoreExpansion(keyword, seed, contextTokens),
      reason:
        keyword.length === seed.length + 2
          ? "Autocomplete-style alphabet expansion."
          : "Expanded with common SEO modifiers and commercial intent.",
    }))
  )
    .filter((row) => row.keyword !== seed)
    .sort((left, right) => right.score - left.score)
    .slice(0, 24);
}
