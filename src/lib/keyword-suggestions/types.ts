export type SuggestionSource = "domain" | "ai" | "autocomplete" | "fallback";

export type SeedSuggestion = {
  keyword: string;
  source: SuggestionSource;
  score: number;
  reason: string;
};

export type ExpandedSuggestion = {
  keyword: string;
  source: Extract<SuggestionSource, "autocomplete">;
  basedOn: string;
  score: number;
  reason: string;
};

export type KeywordSuggestionPayload = {
  cached: boolean;
  domain: string;
  topic: string;
  recommendedSeed: string | null;
  suggestedSeeds: SeedSuggestion[];
  expandedKeywords: ExpandedSuggestion[];
  sourceSummary: {
    usedAuditData: boolean;
    usedAiExpansion: boolean;
    usedAutocomplete: boolean;
    cacheKey: string;
  };
};
