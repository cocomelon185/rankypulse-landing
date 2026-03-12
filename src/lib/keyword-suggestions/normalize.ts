const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "by",
  "for",
  "from",
  "how",
  "in",
  "is",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
  "your",
]);

export function normalizePhrase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[|:()[\]{}]/g, " ")
    .replace(/[_/\\]+/g, " ")
    .replace(/[^\p{L}\p{N}\s-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeDomainInput(value: string): string {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

export function tokenizePhrase(value: string): string[] {
  return normalizePhrase(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);
}

export function meaningfulTokens(value: string): string[] {
  return tokenizePhrase(value).filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

export function domainTopicTokens(domain: string): string[] {
  return normalizeDomainInput(domain)
    .split(".")[0]
    .split(/[-_]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function dedupeNormalized<T extends { keyword: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];

  for (const row of rows) {
    const key = normalizePhrase(row.keyword);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      ...row,
      keyword: key,
    });
  }

  return out;
}

export function looksBroadTopic(input: string): boolean {
  const tokens = meaningfulTokens(input);
  if (tokens.length === 0) return false;
  if (tokens.length >= 3) return false;
  const broadTopics = new Set([
    "seo",
    "backlinks",
    "content",
    "rankings",
    "ranking",
    "keywords",
    "keyword",
    "technical seo",
    "site audit",
  ]);
  return broadTopics.has(normalizePhrase(input)) || tokens.length <= 2;
}

export function phraseOverlapScore(left: string, rightTokens: string[]): number {
  if (!rightTokens.length) return 0;
  const leftTokens = new Set(meaningfulTokens(left));
  const overlap = rightTokens.filter((token) => leftTokens.has(token)).length;
  return overlap / rightTokens.length;
}
