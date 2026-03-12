import { fetchDataForSeoJson } from "./dataforseo";

export type DifficultyLabel = "Easy" | "Medium" | "Hard" | "Very Hard" | "Difficulty unavailable";
export type DifficultyStatus = "available" | "unavailable";

export type DifficultySignals = {
  searchResultsCount: number | null;
  serpFeatures: string[];
  serpFeaturesCount: number;
  topDomains: string[];
  avgDomainAuthorityTop10: number | null;
  avgBacklinksTop10: number | null;
};

export type KeywordDifficultyResult = DifficultySignals & {
  difficultyScore: number | null;
  difficultyLabel: DifficultyLabel;
  difficultyStatus: DifficultyStatus;
};

type SerpItem = {
  type?: string;
  domain?: string;
  url?: string;
};

function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export function estimateFallbackDifficulty(input: {
  searchResultsCount: number | null | undefined;
  serpFeaturesCount: number | null | undefined;
  adsCompetitionScore: number | null | undefined;
}): number | null {
  const searchResults =
    typeof input.searchResultsCount === "number" &&
    Number.isFinite(input.searchResultsCount) &&
    input.searchResultsCount > 0
      ? input.searchResultsCount
      : null;

  if (searchResults === null) return null;

  const serpFeatures =
    typeof input.serpFeaturesCount === "number" && Number.isFinite(input.serpFeaturesCount)
      ? Math.max(0, input.serpFeaturesCount)
      : 0;
  const adsCompetition =
    typeof input.adsCompetitionScore === "number" && Number.isFinite(input.adsCompetitionScore)
      ? Math.max(0, Math.min(100, input.adsCompetitionScore))
      : 50;

  return clamp(
    Math.round(Math.log10(searchResults) * 8 + adsCompetition * 0.45 + serpFeatures * 4)
  );
}

function cleanDomain(value: string): string {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

export function classifyDifficultyLabel(score: number | null | undefined): DifficultyLabel {
  if (typeof score !== "number" || !Number.isFinite(score)) return "Difficulty unavailable";
  if (score <= 30) return "Easy";
  if (score <= 60) return "Medium";
  if (score <= 80) return "Hard";
  return "Very Hard";
}

export function computeDifficultyScore(input: {
  searchResultsCount: number | null | undefined;
  avgDomainAuthorityTop10: number | null | undefined;
  avgBacklinksTop10: number | null | undefined;
}): number | null {
  const searchResults = input.searchResultsCount;
  const domainAuthority = input.avgDomainAuthorityTop10;
  const backlinks = input.avgBacklinksTop10;

  if (
    typeof searchResults !== "number" ||
    !Number.isFinite(searchResults) ||
    searchResults <= 0 ||
    typeof domainAuthority !== "number" ||
    !Number.isFinite(domainAuthority) ||
    typeof backlinks !== "number" ||
    !Number.isFinite(backlinks) ||
    backlinks <= 0
  ) {
    return null;
  }

  return clamp(
    Math.round(
      Math.log10(searchResults) * 10 +
        domainAuthority / 2 +
        Math.log10(backlinks) * 5
    )
  );
}

export async function fetchKeywordDifficultySignals(params: {
  keyword: string;
  country: string;
  languageCode: string;
  locationCode: number;
  getAuthoritySignal: (domain: string) => Promise<{ authority: number | null; backlinks: number | null }>;
}): Promise<KeywordDifficultyResult> {
  const body = [
    {
      keyword: params.keyword,
      language_code: params.languageCode,
      location_code: params.locationCode,
      device: "desktop",
      depth: 10,
    },
  ];

  const json = await fetchDataForSeoJson<{
    tasks?: Array<{
      result?: Array<{
        se_results_count?: number | null;
        items?: SerpItem[];
      }>;
    }>;
  }>({
    feature: "rankings",
    url: "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
    method: "POST",
    body,
  });

  const result = json?.tasks?.[0]?.result?.[0];
  const items = result?.items ?? [];
  const topOrganicDomains = [...new Set(
    items
      .filter((item) => item.type === "organic")
      .map((item) => cleanDomain(item.domain ?? item.url ?? ""))
      .filter(Boolean)
      .slice(0, 10)
  )];

  const serpFeatures = [...new Set(
    items
      .map((item) => item.type ?? "")
      .filter((type) => Boolean(type) && type !== "organic")
  )];

  const authoritySignals = await Promise.all(
    topOrganicDomains.map((domain) => params.getAuthoritySignal(domain))
  );

  const validAuthorities = authoritySignals
    .map((row) => row.authority)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const validBacklinks = authoritySignals
    .map((row) => row.backlinks)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value > 0);

  const avgDomainAuthorityTop10 = validAuthorities.length
    ? Math.round(validAuthorities.reduce((sum, value) => sum + value, 0) / validAuthorities.length)
    : null;
  const avgBacklinksTop10 = validBacklinks.length
    ? Math.round(validBacklinks.reduce((sum, value) => sum + value, 0) / validBacklinks.length)
    : null;
  const searchResultsCount =
    typeof result?.se_results_count === "number" && Number.isFinite(result.se_results_count)
      ? result.se_results_count
      : null;

  const difficultyScore = computeDifficultyScore({
    searchResultsCount,
    avgDomainAuthorityTop10,
    avgBacklinksTop10,
  });

  return {
    searchResultsCount,
    serpFeatures,
    serpFeaturesCount: serpFeatures.length,
    topDomains: topOrganicDomains,
    avgDomainAuthorityTop10,
    avgBacklinksTop10,
    difficultyScore,
    difficultyLabel: classifyDifficultyLabel(difficultyScore),
    difficultyStatus: difficultyScore === null ? "unavailable" : "available",
  };
}
