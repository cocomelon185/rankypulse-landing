import { supabaseAdmin } from "@/lib/supabase";
import { getLatestSharedAuditJobForDomain } from "@/lib/shared-audits";
import { buildKeywordSuggestionCacheKey, getKeywordSuggestionCache, upsertKeywordSuggestionCache } from "./cache";
import { generateAutocompleteExpansions } from "./autocomplete-expansion";
import { generateAiSeedSuggestions } from "./ai-seed-expansion";
import { extractDomainSeedSuggestions, type AuditKeywordPage } from "./domain-keyword-extraction";
import { dedupeNormalized, normalizeDomainInput, normalizePhrase } from "./normalize";
import type { KeywordSuggestionPayload, SeedSuggestion } from "./types";

const FALLBACK_SEEDS = [
  "seo audit",
  "website audit",
  "technical seo",
  "backlink checker",
  "competitor analysis",
  "rank tracker",
];

async function getAuditPagesForDomain(domain: string): Promise<AuditKeywordPage[]> {
  const latestCompleted = await getLatestSharedAuditJobForDomain(domain, ["completed"]);
  const latestAny = latestCompleted ?? await getLatestSharedAuditJobForDomain(domain);
  if (!latestAny?.id) return [];

  const { data } = await supabaseAdmin
    .from("audit_pages")
    .select("url, metadata")
    .eq("job_id", latestAny.id)
    .limit(80);

  return (data ?? []).map((row) => ({
    url: row.url as string,
    metadata: (row.metadata as AuditKeywordPage["metadata"]) ?? null,
  }));
}

function fallbackSeedSuggestions(): SeedSuggestion[] {
  return FALLBACK_SEEDS.map((keyword, index) => ({
    keyword,
    source: "fallback" as const,
    score: Math.max(42, 80 - index * 6),
    reason: "Starter keyword example from RankyPulse.",
  }));
}

function mergeSeedSuggestions(groups: SeedSuggestion[][]): SeedSuggestion[] {
  const merged = new Map<string, SeedSuggestion>();

  for (const group of groups) {
    for (const item of group) {
      const key = normalizePhrase(item.keyword);
      if (!key) continue;
      const existing = merged.get(key);
      if (!existing || item.score > existing.score) {
        merged.set(key, { ...item, keyword: key });
      }
    }
  }

  return [...merged.values()].sort((left, right) => right.score - left.score).slice(0, 12);
}

export async function buildHybridKeywordSuggestions(input: {
  domain?: string;
  topic?: string;
  countryCode?: string;
  languageCode?: string;
}): Promise<KeywordSuggestionPayload> {
  const domain = normalizeDomainInput(input.domain ?? "");
  const topic = normalizePhrase(input.topic ?? "");
  const cacheKey = buildKeywordSuggestionCacheKey(input);
  const cached = await getKeywordSuggestionCache(cacheKey);
  if (cached) {
    return {
      ...cached,
      cached: true,
      sourceSummary: {
        ...cached.sourceSummary,
        cacheKey,
      },
    };
  }

  const auditPages = domain ? await getAuditPagesForDomain(domain) : [];
  const domainSeeds = domain && auditPages.length > 0
    ? extractDomainSeedSuggestions({ domain, pages: auditPages })
    : [];
  const aiSeeds = topic ? await generateAiSeedSuggestions({ topic, domain }) : [];
  const suggestedSeeds = mergeSeedSuggestions([
    domainSeeds,
    aiSeeds,
    fallbackSeedSuggestions(),
  ]);

  const recommendedSeed =
    suggestedSeeds[0]?.keyword ??
    (topic && topic.split(" ").length >= 2 ? topic : null);

  const expandedKeywords = recommendedSeed
    ? generateAutocompleteExpansions({
        seed: recommendedSeed,
        contextKeywords: suggestedSeeds.map((item) => item.keyword),
      })
    : [];

  const payload: KeywordSuggestionPayload = {
    cached: false,
    domain,
    topic,
    recommendedSeed,
    suggestedSeeds: dedupeNormalized(suggestedSeeds),
    expandedKeywords,
    sourceSummary: {
      usedAuditData: auditPages.length > 0,
      usedAiExpansion: aiSeeds.length > 0,
      usedAutocomplete: expandedKeywords.length > 0,
      cacheKey,
    },
  };

  await upsertKeywordSuggestionCache({
    cacheKey,
    domain,
    topic,
    countryCode: input.countryCode,
    languageCode: input.languageCode,
    payload,
    suggestionCount: payload.suggestedSeeds.length + payload.expandedKeywords.length,
  });

  return payload;
}
