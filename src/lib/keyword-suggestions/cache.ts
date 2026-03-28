import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { normalizeDomainInput, normalizePhrase } from "./normalize";
import type { KeywordSuggestionPayload } from "./types";

const KEYWORD_SUGGESTION_TTL_DAYS = 7;

function plusDays(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

function isFresh(expiresAt: string): boolean {
  const ts = new Date(expiresAt).getTime();
  return Number.isFinite(ts) && ts > Date.now();
}

export function buildKeywordSuggestionCacheKey(input: {
  domain?: string;
  topic?: string;
  countryCode?: string;
  languageCode?: string;
}): string {
  return createHash("sha256")
    .update(
      [
        normalizeDomainInput(input.domain ?? ""),
        normalizePhrase(input.topic ?? ""),
        (input.countryCode ?? "US").toUpperCase(),
        (input.languageCode ?? "en").toLowerCase(),
      ].join("|")
    )
    .digest("hex");
}

export async function getKeywordSuggestionCache(cacheKey: string): Promise<KeywordSuggestionPayload | null> {
  const { data, error } = await supabaseAdmin
    .from("keyword_suggestion_cache")
    .select("payload_json, expires_at")
    .eq("cache_key", cacheKey)
    .maybeSingle();

  if (error || !data || !isFresh(data.expires_at)) return null;
  return data.payload_json as KeywordSuggestionPayload;
}

export async function upsertKeywordSuggestionCache(input: {
  cacheKey: string;
  domain?: string;
  topic?: string;
  countryCode?: string;
  languageCode?: string;
  payload: KeywordSuggestionPayload;
  suggestionCount: number;
  ttlDays?: number;
}): Promise<void> {
  await supabaseAdmin.from("keyword_suggestion_cache").upsert(
    {
      cache_key: input.cacheKey,
      domain: normalizeDomainInput(input.domain ?? ""),
      topic: normalizePhrase(input.topic ?? ""),
      country_code: (input.countryCode ?? "US").toUpperCase(),
      language_code: (input.languageCode ?? "en").toLowerCase(),
      payload_json: input.payload,
      suggestion_count: input.suggestionCount,
      fetched_at: new Date().toISOString(),
      expires_at: plusDays(input.ttlDays ?? KEYWORD_SUGGESTION_TTL_DAYS),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "cache_key" }
  );
}
