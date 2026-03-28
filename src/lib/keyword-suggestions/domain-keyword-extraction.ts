import { meaningfulTokens, normalizePhrase, phraseOverlapScore } from "./normalize";
import type { SeedSuggestion } from "./types";

export type AuditKeywordPage = {
  url: string;
  metadata?: {
    title?: string;
    meta_description?: string;
  } | null;
};

const COMMERCIAL_TERMS = [
  "analysis",
  "audit",
  "checker",
  "comparison",
  "guide",
  "report",
  "service",
  "software",
  "tool",
  "tracker",
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function splitTitleSegments(title: string): string[] {
  return title
    .split(/[|:-]/)
    .map((segment) => normalizePhrase(segment))
    .filter((segment) => segment.length >= 6);
}

function extractNgrams(text: string): string[] {
  const tokens = meaningfulTokens(text);
  const phrases: string[] = [];

  for (let size = 2; size <= 4; size += 1) {
    for (let index = 0; index <= tokens.length - size; index += 1) {
      phrases.push(tokens.slice(index, index + size).join(" "));
    }
  }

  return phrases;
}

function commercialBoost(keyword: string): number {
  return COMMERCIAL_TERMS.some((term) => keyword.includes(term)) ? 18 : 0;
}

export function extractDomainSeedSuggestions(input: {
  domain: string;
  pages: AuditKeywordPage[];
}): SeedSuggestion[] {
  const domainTokens = meaningfulTokens(input.domain.split(".")[0] ?? "");
  const pageCount = Math.max(input.pages.length, 1);
  const phraseStats = new Map<string, { count: number; homepageHits: number; titleHits: number; metaHits: number }>();

  for (const page of input.pages) {
    const url = page.url.toLowerCase();
    const isHomepage = /https?:\/\/[^/]+\/?$/.test(url);
    const title = page.metadata?.title ?? "";
    const meta = page.metadata?.meta_description ?? "";

    for (const segment of splitTitleSegments(title)) {
      const entry = phraseStats.get(segment) ?? { count: 0, homepageHits: 0, titleHits: 0, metaHits: 0 };
      entry.count += 1;
      entry.titleHits += 1;
      if (isHomepage) entry.homepageHits += 1;
      phraseStats.set(segment, entry);
    }

    for (const phrase of [...extractNgrams(title), ...extractNgrams(meta)]) {
      const entry = phraseStats.get(phrase) ?? { count: 0, homepageHits: 0, titleHits: 0, metaHits: 0 };
      entry.count += 1;
      if (title.includes(phrase)) entry.titleHits += 1;
      if (meta.includes(phrase)) entry.metaHits += 1;
      if (isHomepage) entry.homepageHits += 1;
      phraseStats.set(phrase, entry);
    }
  }

  const seeds = [...phraseStats.entries()]
    .map(([keyword, stats]) => {
      const normalized = normalizePhrase(keyword);
      const tokens = meaningfulTokens(normalized);
      if (tokens.length < 2 || tokens.length > 5) return null;
      if (normalized.length < 6) return null;

      const overlap = phraseOverlapScore(normalized, domainTokens);
      const score = clamp(
        stats.count * 12 +
          stats.homepageHits * 20 +
          stats.titleHits * 6 +
          stats.metaHits * 4 +
          commercialBoost(normalized) +
          overlap * 18 +
          (tokens.length >= 2 && tokens.length <= 4 ? 10 : 0) -
          (pageCount > 0 && stats.count === 1 ? 6 : 0),
        0,
        100
      );

      return {
        keyword: normalized,
        source: "domain" as const,
        score,
        reason:
          stats.homepageHits > 0
            ? "Derived from your homepage and crawl data."
            : stats.count > 1
              ? "Repeated across your audited titles and metadata."
              : "Pulled from audited page metadata.",
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .sort((left, right) => right.score - left.score);

  return seeds.slice(0, 10);
}
