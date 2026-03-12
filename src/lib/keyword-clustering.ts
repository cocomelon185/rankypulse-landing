type ClusterableKeyword = {
  keyword: string;
  volume: number | null;
  difficultyScore: number | null;
  opportunityScore: number | null;
};

export type KeywordCluster = {
  clusterId: string;
  clusterName: string;
  totalSearchVolume: number;
  averageDifficulty: number | null;
  topKeyword: string;
  topOpportunityScore: number | null;
  keywords: string[];
};

const STOP_WORDS = new Set([
  "a", "an", "and", "audit", "best", "checker", "for", "free", "how", "in", "is",
  "of", "on", "seo", "the", "to", "tool", "website", "with",
]);

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function titleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildClusterKey(keyword: string): string {
  const tokens = tokenize(keyword);
  if (tokens.length === 0) return "general";
  return tokens.slice(0, Math.min(2, tokens.length)).join(" ");
}

export function clusterKeywords(rows: ClusterableKeyword[]): {
  clusters: KeywordCluster[];
  keywordToCluster: Map<string, { clusterId: string; clusterName: string }>;
} {
  const groups = new Map<string, ClusterableKeyword[]>();

  for (const row of rows) {
    const key = buildClusterKey(row.keyword);
    const current = groups.get(key) ?? [];
    current.push(row);
    groups.set(key, current);
  }

  const keywordToCluster = new Map<string, { clusterId: string; clusterName: string }>();
  const clusters = [...groups.entries()].map(([key, keywords], index) => {
    const clusterName = titleCase(key === "general" ? "General Opportunities" : key);
    const clusterId = `cluster-${index + 1}`;
    const totalSearchVolume = keywords.reduce((sum, row) => sum + (row.volume ?? 0), 0);
    const difficulties = keywords
      .map((row) => row.difficultyScore)
      .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    const best = [...keywords].sort((left, right) => (right.opportunityScore ?? -1) - (left.opportunityScore ?? -1))[0];

    for (const keyword of keywords) {
      keywordToCluster.set(keyword.keyword, { clusterId, clusterName });
    }

    return {
      clusterId,
      clusterName,
      totalSearchVolume,
      averageDifficulty: difficulties.length
        ? Math.round(difficulties.reduce((sum, value) => sum + value, 0) / difficulties.length)
        : null,
      topKeyword: best?.keyword ?? keywords[0]?.keyword ?? "",
      topOpportunityScore: best?.opportunityScore ?? null,
      keywords: keywords.map((row) => row.keyword),
    };
  });

  return {
    clusters: clusters.sort((left, right) => right.totalSearchVolume - left.totalSearchVolume),
    keywordToCluster,
  };
}
