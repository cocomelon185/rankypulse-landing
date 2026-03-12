"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookmarkPlus,
  Check,
  CheckSquare,
  ChevronDown,
  FolderPlus,
  Globe,
  Loader2,
  RefreshCcw,
  Search,
  Sparkles,
  Square,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { isDataProviderUnavailableCode } from "@/lib/data-provider";
import { computeFullOpportunityScore } from "@/lib/dataforseo/opportunity-score";

type SearchRow = {
  keyword: string;
  searchVolume: number | null;
  cpc: number | null;
  competition: number | null;
  difficultyScore: number | null;
  difficultyLabel: string;
  difficultyStatus: "pending" | "available" | "unavailable";
  intent: "informational" | "commercial" | "transactional" | "navigational" | "unknown";
  clusterName: string | null;
  recommendedContentType: string;
  preOpportunityScore: number;
  opportunityScore: number | null;
  opportunityKind: "preliminary" | "full" | "unavailable";
  opportunityLabel: string;
  serpFeaturesCount: number;
  serpPressure: "Low" | "Medium" | "High" | "Unknown";
  freshness: "cached" | "fresh";
};

type KeywordSearchResponse = {
  cacheKey: string;
  cached: boolean;
  freshnessLabel: string;
  query: {
    domain: string;
    seedKeyword: string;
    countryCode: string;
    languageCode: string;
    mode: "preview" | "expanded";
    limit: number;
    offset: number;
  };
  quota: {
    plan: "free" | "starter" | "pro";
    searchesUsedToday: number;
    searchesPerDay: number;
    searchesRemainingToday: number;
    maxAnalyzedKeywordsPerSearch: number;
    initialFetchSize: number;
    autoDifficultyCount: number;
  };
  budget: {
    spendToday: number;
    softLimitReached: boolean;
    hardLimitReached: boolean;
    budgetUsd: number;
    softThresholdUsd: number;
    hardThresholdUsd: number;
    mode: "normal" | "degraded" | "cache_only";
  };
  summary: {
    totalKeywords: number;
    avgSearchVolume: number;
    avgCpc: number;
    lowCompetitionOpportunities: number;
    analyzedKeywords: number;
  };
  topOpportunity: {
    keyword: string | null;
    score: number | null;
    label: string;
  };
  clusters: Array<{
    clusterId: string;
    clusterName: string;
    totalSearchVolume: number;
    averageDifficulty: number | null;
    topKeyword: string;
    topOpportunityScore: number | null;
  }>;
  rows: SearchRow[];
  page: {
    hasMore: boolean;
    nextOffset: number | null;
  };
  controls: {
    canRefresh: boolean;
    minRefreshAgeMinutes: number;
    autoAnalyzedCount: number;
    showingMessage: string;
  };
};

type KeywordSuggestionResponse = {
  cached: boolean;
  domain: string;
  topic: string;
  recommendedSeed: string | null;
  suggestedSeeds: Array<{
    keyword: string;
    source: "domain" | "ai" | "autocomplete" | "fallback";
    score: number;
    reason: string;
  }>;
  expandedKeywords: Array<{
    keyword: string;
    source: "autocomplete";
    basedOn: string;
    score: number;
    reason: string;
  }>;
  sourceSummary: {
    usedAuditData: boolean;
    usedAiExpansion: boolean;
    usedAutocomplete: boolean;
    cacheKey: string;
  };
};

type RecentKeywordSearch = {
  domain: string;
  seed: string;
  country: string;
};

type VolumeFilter = "all" | "50" | "100" | "1000";
type DifficultyFilter = "all" | "pending" | "easy" | "medium" | "hard" | "very-hard" | "unavailable";
type OpportunityFilter = "all" | "top" | "quick-wins" | "low-competition";

const CARD_BG = "#151B27";
const CARD_BG_ALT = "#0D1424";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";
const DEFAULT_LIMIT = 25;

const COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
];

const SUGGESTED_KEYWORDS = [
  "seo audit",
  "website audit",
  "technical seo",
  "backlink checker",
  "competitor analysis",
  "rank tracker",
];

const RECENT_KEYWORD_STORAGE_KEY = "rankypulse_recent_keyword_searches";

function normalizeDomainInput(raw: string): string {
  return raw
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

function formatVolume(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

function formatCurrency(value: number | null): string {
  if (value === null) return "—";
  return `$${value.toFixed(2)}`;
}

function formatIntent(intent: SearchRow["intent"]): string {
  if (intent === "unknown") return "Unknown";
  return intent.charAt(0).toUpperCase() + intent.slice(1);
}

function difficultyTone(label: string): { color: string; bg: string } {
  switch (label) {
    case "Easy":
      return { color: "#22C55E", bg: "rgba(34,197,94,0.14)" };
    case "Medium":
      return { color: "#FACC15", bg: "rgba(250,204,21,0.14)" };
    case "Hard":
      return { color: "#F97316", bg: "rgba(249,115,22,0.14)" };
    case "Very Hard":
      return { color: "#EF4444", bg: "rgba(239,68,68,0.14)" };
    case "Pending analysis":
      return { color: "#60A5FA", bg: "rgba(96,165,250,0.14)" };
    default:
      return { color: TEXT_MUTED, bg: "rgba(100,116,139,0.14)" };
  }
}

function opportunityTone(score: number | null): { color: string; bg: string } {
  if (score === null) return { color: TEXT_MUTED, bg: "rgba(100,116,139,0.14)" };
  if (score >= 90) return { color: "#22C55E", bg: "rgba(34,197,94,0.14)" };
  if (score >= 75) return { color: "#60A5FA", bg: "rgba(96,165,250,0.14)" };
  if (score >= 60) return { color: "#FACC15", bg: "rgba(250,204,21,0.14)" };
  if (score >= 40) return { color: "#F97316", bg: "rgba(249,115,22,0.14)" };
  return { color: "#EF4444", bg: "rgba(239,68,68,0.14)" };
}

function serpPressureTone(value: SearchRow["serpPressure"]): { color: string; bg: string } {
  if (value === "Low") return { color: "#22C55E", bg: "rgba(34,197,94,0.14)" };
  if (value === "Medium") return { color: "#F59E0B", bg: "rgba(245,158,11,0.14)" };
  if (value === "High") return { color: "#EF4444", bg: "rgba(239,68,68,0.14)" };
  return { color: TEXT_MUTED, bg: "rgba(100,116,139,0.14)" };
}

function SummaryCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border p-4" style={{ background: CARD_BG, borderColor: BORDER }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
          {label}
        </p>
        <span style={{ color: ACCENT }}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-black tracking-tight text-white">{value}</p>
      <p className="mt-1 text-xs" style={{ color: TEXT_DIM }}>{note}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {["Keywords", "Avg Volume", "Avg CPC", "Low Competition", "Analyzed"].map((label) => (
          <SummaryCard key={label} label={label} value="…" note="Loading keyword research" icon={<Loader2 size={16} className="animate-spin" />} />
        ))}
      </div>
      <div className="rounded-xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
        <div className="h-6 w-64 animate-pulse rounded bg-white/10" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackButton({ keyword, domain, country }: { keyword: string; domain: string; country: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function track() {
    setState("loading");
    try {
      const res = await fetch("/api/rank/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, keyword, country }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  return (
    <button
      type="button"
      onClick={track}
      disabled={state === "loading" || state === "done"}
      className="inline-flex min-w-[108px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: state === "done" ? "rgba(34,197,94,0.14)" : `linear-gradient(135deg, ${ACCENT}, #E8541F)`,
        color: state === "done" ? "#22C55E" : "#fff",
      }}
    >
      {state === "loading" ? <Loader2 size={12} className="animate-spin" /> : state === "done" ? <Check size={12} /> : <Target size={12} />}
      {state === "done" ? "Tracking" : state === "error" ? "Retry" : "Track"}
    </button>
  );
}

export function KeywordsClient() {
  const [domain, setDomain] = useState("");
  const [seed, setSeed] = useState("");
  const [country, setCountry] = useState("US");
  const [lastAuditDomain, setLastAuditDomain] = useState("");
  const [recentSearches, setRecentSearches] = useState<RecentKeywordSearch[]>([]);
  const [suggestions, setSuggestions] = useState<KeywordSuggestionResponse | null>(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [didAutoLoadSuggestions, setDidAutoLoadSuggestions] = useState(false);
  const [data, setData] = useState<KeywordSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [keywordSearch, setKeywordSearch] = useState("");
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [opportunityFilter, setOpportunityFilter] = useState<OpportunityFilter>("all");
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [projectAdded, setProjectAdded] = useState<Set<string>>(new Set());
  const [analyzingKeywords, setAnalyzingKeywords] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(DEFAULT_LIMIT);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("rankypulse_last_url") ?? "" : "";
    const cleaned = normalizeDomainInput(raw);
    setLastAuditDomain(cleaned);
    setDomain(cleaned);
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem(RECENT_KEYWORD_STORAGE_KEY) ?? "[]") as RecentKeywordSearch[];
        if (Array.isArray(stored)) {
          setRecentSearches(
            stored.filter((item) => item && typeof item.domain === "string" && typeof item.seed === "string" && typeof item.country === "string").slice(0, 6)
          );
        }
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  function persistRecentSearch(entry: RecentKeywordSearch) {
    setRecentSearches((prev) => {
      const deduped = [
        entry,
        ...prev.filter((item) => !(item.domain === entry.domain && item.seed === entry.seed && item.country === entry.country)),
      ].slice(0, 6);
      if (typeof window !== "undefined") {
        localStorage.setItem(RECENT_KEYWORD_STORAGE_KEY, JSON.stringify(deduped));
      }
      return deduped;
    });
  }

  function resetResults(preserveDomain = false) {
    setData(null);
    setError(null);
    setProviderUnavailable(false);
    setHasSearched(false);
    setSelected(new Set());
    setKeywordSearch("");
    setVolumeFilter("all");
    setDifficultyFilter("all");
    setOpportunityFilter("all");
    setAnalyzingKeywords(new Set());
    setLimit(DEFAULT_LIMIT);
    setSuggestionError(null);
    if (!preserveDomain) setDomain("");
  }

  function handleDomainChange(next: string) {
    setDomain(normalizeDomainInput(next));
    setData(null);
    setSuggestions(null);
    setSuggestionError(null);
    setSelected(new Set());
    setHasSearched(false);
  }

  const runSuggestionDiscovery = useCallback(async (options?: { nextDomain?: string; nextTopic?: string }) => {
    const requestDomain = normalizeDomainInput(options?.nextDomain ?? domain);
    const requestTopic = (options?.nextTopic ?? seed).trim();
    if (!requestDomain && !requestTopic) return;

    setSuggestionLoading(true);
    setSuggestionError(null);

    try {
      const res = await fetch("/api/keywords/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: requestDomain,
          topic: requestTopic,
          countryCode: country,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSuggestionError(json.error ?? "Could not generate keyword ideas.");
        setSuggestions(null);
        return;
      }
      setSuggestions(json as KeywordSuggestionResponse);
    } catch {
      setSuggestionError("Network error. Please try again.");
      setSuggestions(null);
    } finally {
      setSuggestionLoading(false);
    }
  }, [country, domain, seed]);

  useEffect(() => {
    if (!lastAuditDomain || didAutoLoadSuggestions) return;
    setDidAutoLoadSuggestions(true);
    void runSuggestionDiscovery({ nextDomain: lastAuditDomain });
  }, [didAutoLoadSuggestions, lastAuditDomain, runSuggestionDiscovery]);

  async function runSearch(options?: { forceRefresh?: boolean; nextLimit?: number; overrideSeed?: string }) {
    const activeSeed = (options?.overrideSeed ?? seed).trim();
    if (!activeSeed || !domain.trim()) return;

    const requestedLimit = options?.nextLimit ?? limit;
    setLoading(true);
    setError(null);
    setProviderUnavailable(false);
    setHasSearched(true);

    try {
      const res = await fetch("/api/keywords/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          seedKeyword: activeSeed,
          countryCode: country,
          limit: requestedLimit,
          mode: requestedLimit > DEFAULT_LIMIT ? "expanded" : "preview",
          forceRefresh: Boolean(options?.forceRefresh),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (isDataProviderUnavailableCode(json.code)) {
          setProviderUnavailable(true);
          setData(null);
          return;
        }
        setError(json.error ?? "Failed to fetch keyword research.");
        setData(null);
        return;
      }

      setLimit(requestedLimit);
      setData(json as KeywordSearchResponse);
      setSeed(activeSeed);
      persistRecentSearch({ domain, seed: activeSeed, country });
    } catch {
      setError("Network error. Please try again.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function runSearchForSeed(nextSeed: string) {
    const normalized = nextSeed.trim();
    if (!normalized) return;
    setSeed(normalized);
    await runSearch({ overrideSeed: normalized });
  }

  async function analyzeDifficulty(keywords: string[]) {
    const unique = [...new Set(keywords.filter(Boolean))];
    if (!unique.length || !data) return;

    setAnalyzingKeywords((prev) => new Set([...prev, ...unique]));
    try {
      const res = await fetch("/api/keywords/difficulty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords: unique, countryCode: country }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Difficulty analysis failed.");
        return;
      }

      const updates = new Map<string, { difficultyScore: number | null; difficultyLabel: string; difficultyStatus: "pending" | "available" | "unavailable"; serpFeaturesCount: number; }>();
      for (const row of json.rows ?? []) {
        updates.set(String(row.keyword).toLowerCase().trim(), row);
      }

      setData((prev) => {
        if (!prev) return prev;
        const rows = prev.rows.map((row) => {
          const update = updates.get(row.keyword.toLowerCase().trim());
          if (!update) return row;
          const fullOpportunity = computeFullOpportunityScore({
            volume: row.searchVolume,
            cpc: row.cpc,
            difficulty: update.difficultyScore,
          });
          return {
            ...row,
            difficultyScore: update.difficultyScore,
            difficultyLabel: update.difficultyLabel,
            difficultyStatus: update.difficultyStatus,
            serpFeaturesCount: update.serpFeaturesCount,
            serpPressure: (update.serpFeaturesCount >= 4 ? "High" : update.serpFeaturesCount >= 2 ? "Medium" : "Low") as SearchRow["serpPressure"],
            opportunityScore: fullOpportunity.score ?? row.opportunityScore,
            opportunityKind: fullOpportunity.kind,
            opportunityLabel: fullOpportunity.label === "Unavailable" ? row.opportunityLabel : fullOpportunity.label,
          };
        }).sort((left, right) => (right.opportunityScore ?? right.preOpportunityScore) - (left.opportunityScore ?? left.preOpportunityScore));

        const lowCompetitionOpportunities = rows.filter((row) => typeof row.difficultyScore === "number" && row.difficultyScore < 40).length;
        const analyzedKeywords = rows.filter((row) => row.difficultyStatus === "available").length;
        const topRow = rows[0] ?? null;

        return {
          ...prev,
          rows,
          summary: {
            ...prev.summary,
            lowCompetitionOpportunities,
            analyzedKeywords,
          },
          topOpportunity: {
            keyword: topRow?.keyword ?? null,
            score: topRow?.opportunityScore ?? topRow?.preOpportunityScore ?? null,
            label: topRow?.opportunityLabel ?? "Unavailable",
          },
        };
      });
    } finally {
      setAnalyzingKeywords((prev) => {
        const next = new Set(prev);
        for (const keyword of unique) next.delete(keyword);
        return next;
      });
    }
  }

  const quickWins = useMemo(() => {
    return (data?.rows ?? []).filter((row) => (row.searchVolume ?? 0) > 50 && (row.difficultyScore ?? 999) < 40 && (row.opportunityScore ?? -1) > 70);
  }, [data]);

  const filteredRows = useMemo(() => {
    const rows = data?.rows ?? [];
    return rows.filter((row) => {
      const volume = row.searchVolume ?? 0;
      if (volumeFilter === "50" && volume <= 50) return false;
      if (volumeFilter === "100" && volume <= 100) return false;
      if (volumeFilter === "1000" && volume < 1000) return false;
      if (difficultyFilter === "pending" && row.difficultyStatus !== "pending") return false;
      if (difficultyFilter === "easy" && row.difficultyLabel !== "Easy") return false;
      if (difficultyFilter === "medium" && row.difficultyLabel !== "Medium") return false;
      if (difficultyFilter === "hard" && row.difficultyLabel !== "Hard") return false;
      if (difficultyFilter === "very-hard" && row.difficultyLabel !== "Very Hard") return false;
      if (difficultyFilter === "unavailable" && row.difficultyStatus !== "unavailable") return false;
      if (opportunityFilter === "top" && (row.opportunityScore ?? row.preOpportunityScore) < 75) return false;
      if (opportunityFilter === "quick-wins" && !quickWins.find((item) => item.keyword === row.keyword)) return false;
      if (opportunityFilter === "low-competition" && (row.difficultyScore ?? 999) >= 40) return false;
      if (keywordSearch && !row.keyword.toLowerCase().includes(keywordSearch.toLowerCase())) return false;
      return true;
    });
  }, [data, difficultyFilter, keywordSearch, opportunityFilter, quickWins, volumeFilter]);

  const visibleSeedSuggestions = suggestions?.suggestedSeeds ?? [];
  const visibleExpandedKeywords = suggestions?.expandedKeywords.slice(0, 12) ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-[2rem] font-black tracking-tight text-white">Keyword Research</h1>
        <p className="max-w-3xl text-sm leading-7" style={{ color: TEXT_DIM }}>
          Discover keyword opportunities, search demand, and ranking potential for your website.
        </p>
      </div>

      <div className="rounded-xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
          className="grid gap-3 xl:grid-cols-[1.15fr_2.5fr_0.8fr_auto]"
        >
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>Website domain</span>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
              <input
                value={domain}
                onChange={(event) => handleDomainChange(event.target.value)}
                placeholder="yourdomain.com"
                autoComplete="off"
                className="w-full rounded-xl border bg-transparent py-3 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                style={{ borderColor: BORDER, background: CARD_BG_ALT }}
              />
            </div>
            {lastAuditDomain && lastAuditDomain === domain && (
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>Using your latest audited domain as context.</p>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>Seed keyword</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
              <input
                value={seed}
                onChange={(event) => {
                  setSeed(event.target.value);
                  setData(null);
                }}
                placeholder="Enter a keyword or topic (example: seo audit, website audit, technical seo)"
                autoComplete="off"
                className="w-full rounded-xl border bg-transparent py-3 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                style={{ borderColor: BORDER, background: CARD_BG_ALT }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_KEYWORDS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSeed(item);
                    setData(null);
                  }}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                  style={{ borderColor: BORDER, color: TEXT_DIM, background: CARD_BG_ALT }}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void runSuggestionDiscovery()}
                disabled={suggestionLoading || (!domain.trim() && !seed.trim())}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03] disabled:opacity-50"
                style={{ borderColor: BORDER, color: TEXT_DIM }}
              >
                {suggestionLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Suggest Seeds
              </button>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>
                Discover ideas from your audited site first, then expand with autocomplete-style suggestions.
              </p>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>Country</span>
            <div className="relative">
              <select
                value={country}
                onChange={(event) => {
                  setCountry(event.target.value);
                  setData(null);
                }}
                className="w-full appearance-none rounded-xl border bg-transparent px-3 py-3 pr-9 text-sm text-white focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                style={{ borderColor: BORDER, background: CARD_BG_ALT }}
              >
                {COUNTRIES.map((item) => (
                  <option key={item.code} value={item.code} style={{ background: CARD_BG }}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
            </div>
          </label>

          <div className="flex flex-col gap-2 self-end">
            <button
              type="submit"
              disabled={loading || !seed.trim() || !domain.trim()}
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              Find Keyword Opportunities
            </button>
            <button
              type="button"
              onClick={() => {
                setSeed("");
                resetResults(true);
                setDomain(lastAuditDomain);
              }}
              className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-white/[0.03]"
              style={{ borderColor: BORDER, color: TEXT_DIM }}
            >
              Clear search
            </button>
          </div>
        </form>
      </div>

      {(suggestions || suggestionLoading || suggestionError) && !loading && (
        <div className="rounded-xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
                Suggested Seed Keywords
              </p>
              <p className="mt-2 text-sm" style={{ color: TEXT_DIM }}>
                Start with domain-derived seeds, then expand into long-tail opportunities before spending on keyword metrics.
              </p>
            </div>
            {suggestions && (
              <div className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ color: suggestions.cached ? "#A5B4FC" : "#86EFAC", background: suggestions.cached ? "rgba(99,102,241,0.14)" : "rgba(34,197,94,0.14)" }}>
                {suggestions.cached ? "Cached suggestions" : "Fresh suggestions"}
              </div>
            )}
          </div>

          {suggestionLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: TEXT_DIM }}>
              <Loader2 size={14} className="animate-spin" />
              Generating low-cost seed ideas…
            </div>
          )}

          {suggestionError && (
            <div className="mt-4 rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.22)", color: "#FCA5A5" }}>
              {suggestionError}
            </div>
          )}

          {suggestions && (
            <div className="mt-4 space-y-5">
              <div className="grid gap-3 lg:grid-cols-[1.25fr_1fr]">
                <div className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">Recommended seed</p>
                      <p className="mt-1 text-xs" style={{ color: TEXT_DIM }}>
                        Best starting point based on your domain/topic context.
                      </p>
                    </div>
                    {suggestions.recommendedSeed && (
                      <button
                        type="button"
                        onClick={() => void runSearchForSeed(suggestions.recommendedSeed!)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
                      >
                        <Search size={12} />
                        Find opportunities
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-lg font-black text-white">{suggestions.recommendedSeed ?? "No strong recommendation yet"}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visibleSeedSuggestions.slice(0, 8).map((item) => (
                      <button
                        key={item.keyword}
                        type="button"
                        onClick={() => void runSearchForSeed(item.keyword)}
                        className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                        style={{ borderColor: BORDER, color: TEXT_DIM, background: "rgba(255,255,255,0.02)" }}
                        title={item.reason}
                      >
                        {item.keyword}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                  <p className="text-sm font-bold text-white">How RankyPulse is helping</p>
                  <ul className="mt-3 space-y-2 text-sm" style={{ color: TEXT_DIM }}>
                    <li>Uses existing audit data before external APIs.</li>
                    <li>Expands seeds with autocomplete-style modifiers.</li>
                    <li>Shortlists ideas before DataForSEO enrichment.</li>
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {suggestions.sourceSummary.usedAuditData && (
                      <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#86EFAC", background: "rgba(34,197,94,0.14)" }}>
                        Audit-derived
                      </span>
                    )}
                    {suggestions.sourceSummary.usedAiExpansion && (
                      <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#A78BFA", background: "rgba(167,139,250,0.14)" }}>
                        AI-expanded
                      </span>
                    )}
                    {suggestions.sourceSummary.usedAutocomplete && (
                      <span className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#60A5FA", background: "rgba(96,165,250,0.14)" }}>
                        Autocomplete
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {visibleExpandedKeywords.length > 0 && (
                <div className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">Expanded keyword ideas</p>
                      <p className="mt-1 text-xs" style={{ color: TEXT_DIM }}>
                        Cheap long-tail candidates generated before any metrics call.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {visibleExpandedKeywords.map((item) => (
                      <button
                        key={item.keyword}
                        type="button"
                        onClick={() => {
                          setSeed(item.keyword);
                          setData(null);
                        }}
                        className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                        style={{ borderColor: BORDER, color: TEXT_DIM, background: "rgba(255,255,255,0.02)" }}
                        title={item.reason}
                      >
                        {item.keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!hasSearched && !loading && (
        <div className="rounded-xl border p-6" style={{ background: CARD_BG, borderColor: BORDER }}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>How Keyword Research Works</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ["1", "Enter a keyword", "Start with a seed topic to discover related opportunities for your website."],
              ["2", "See top 25 first", "RankyPulse shows the most actionable opportunities first to reduce cost and keep research focused."],
              ["3", "Analyze only what matters", "Advanced difficulty is calculated only for top opportunities or keywords you select."],
            ].map(([step, title, body]) => (
              <div key={title} className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: "rgba(255,100,45,0.15)" }}>{step}</div>
                <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: TEXT_DIM }}>{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {["Search Volume", "CPC", "Difficulty", "Competition", "Related Keywords", "Ranking Opportunities"].map((item) => (
              <div key={item} className="rounded-xl border px-4 py-3 text-sm font-semibold text-white" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
              <p className="text-sm font-bold text-white">Popular starters</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED_KEYWORDS.map((item) => (
                  <button
                    key={`starter-${item}`}
                    type="button"
                    onClick={() => {
                      setSeed(item);
                      void runSuggestionDiscovery({ nextTopic: item });
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                    style={{ borderColor: BORDER, color: TEXT_DIM }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
              <p className="text-sm font-bold text-white">Recent searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentSearches.length > 0 ? recentSearches.map((item) => (
                  <button
                    key={`${item.domain}-${item.seed}-${item.country}`}
                    type="button"
                    onClick={() => {
                      setDomain(item.domain);
                      setSeed(item.seed);
                      setCountry(item.country);
                    }}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                    style={{ borderColor: BORDER, color: TEXT_DIM }}
                  >
                    {item.seed}
                  </button>
                )) : (
                  <p className="text-sm" style={{ color: TEXT_DIM }}>Your recent keyword research searches will appear here.</p>
                )}
              </div>
            </div>
            <div className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
              <p className="text-sm font-bold text-white">Domain ideas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {visibleSeedSuggestions.length > 0 ? visibleSeedSuggestions.slice(0, 6).map((item) => (
                  <button
                    key={`domain-${item.keyword}`}
                    type="button"
                    onClick={() => void runSearchForSeed(item.keyword)}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                    style={{ borderColor: BORDER, color: TEXT_DIM }}
                  >
                    {item.keyword}
                  </button>
                )) : (
                  <p className="text-sm" style={{ color: TEXT_DIM }}>
                    {domain ? "Click Suggest Seeds to pull ideas from your domain and topic context." : "Enter a domain to unlock crawl-based keyword seeds."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading && <LoadingState />}

      {error && !loading && (
        <div className="rounded-xl border p-5" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.22)" }}>
          <p className="text-sm font-semibold text-red-300">Couldn&apos;t load keyword research</p>
          <p className="mt-1 text-sm text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && providerUnavailable && (
        <div className="rounded-xl border p-6 space-y-3" style={{ background: "rgba(123,92,245,0.05)", borderColor: "rgba(123,92,245,0.16)" }}>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: "#A78BFA" }} />
            <p className="text-sm font-semibold text-white">Keyword intelligence is temporarily unavailable</p>
          </div>
          <p className="text-sm leading-7" style={{ color: TEXT_DIM }}>
            RankyPulse could not reach the external keyword intelligence provider. Cached results and rank tracking stay available.
          </p>
          <a href="/app/rank-tracking" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}>
            <ArrowRight size={14} />
            Open Rank Tracking
          </a>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3" style={{ background: CARD_BG, borderColor: BORDER }}>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: data.cached ? "#A5B4FC" : "#86EFAC", background: data.cached ? "rgba(99,102,241,0.14)" : "rgba(34,197,94,0.14)" }}>
              {data.freshnessLabel}
            </span>
            <span className="text-xs" style={{ color: TEXT_DIM }}>
              {data.controls.showingMessage}
            </span>
            <span className="text-xs" style={{ color: TEXT_DIM }}>
              {data.quota.searchesRemainingToday}/{data.quota.searchesPerDay} live searches left today
            </span>
            <span className="text-xs" style={{ color: data.budget.mode === "normal" ? TEXT_DIM : "#FCD34D" }}>
              Spend today ${data.budget.spendToday.toFixed(2)} / ${data.budget.budgetUsd.toFixed(2)} ({data.budget.mode.replace("_", " ")})
            </span>
            <button
              type="button"
              onClick={() => void runSearch({ forceRefresh: true })}
              disabled={!data.controls.canRefresh || loading}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03] disabled:opacity-50"
              style={{ borderColor: BORDER, color: TEXT_DIM }}
            >
              <RefreshCcw size={12} />
              Refresh data
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Total Keywords" value={String(data.summary.totalKeywords)} note="Top opportunities loaded for this search." icon={<Search size={16} />} />
            <SummaryCard label="Avg Search Volume" value={formatVolume(data.summary.avgSearchVolume)} note="Average monthly demand across visible opportunities." icon={<TrendingUp size={16} />} />
            <SummaryCard label="Avg CPC" value={formatCurrency(data.summary.avgCpc)} note="Estimated commercial value across the result set." icon={<Sparkles size={16} />} />
            <SummaryCard label="Low Competition" value={String(data.summary.lowCompetitionOpportunities)} note="Keywords with confirmed difficulty under 40." icon={<Target size={16} />} />
            <SummaryCard label="Analyzed Difficulty" value={String(data.summary.analyzedKeywords)} note={`Auto-analyzed for top ${data.controls.autoAnalyzedCount} opportunities.`} icon={<Zap size={16} />} />
          </div>

          <div className="rounded-xl border p-5" style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.2)" }}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "#86EFAC" }}>Recommended first target</p>
                <p className="mt-2 text-xl font-black text-white">{data.topOpportunity.keyword ?? "No fully analyzed keyword yet"}</p>
                <p className="mt-1 text-sm" style={{ color: TEXT_DIM }}>
                  Opportunity score {data.topOpportunity.score ?? "—"} · {data.topOpportunity.label}
                </p>
              </div>
              <div className="max-w-xl rounded-xl border px-4 py-3 text-sm leading-6" style={{ background: CARD_BG_ALT, borderColor: BORDER, color: TEXT_DIM }}>
                To keep research fast and cost-efficient, advanced difficulty is calculated only for top opportunities or selected keywords.
              </div>
            </div>
          </div>

          {quickWins.length > 0 && (
            <div className="rounded-xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>Quick SEO Wins</p>
                  <p className="mt-2 text-sm" style={{ color: TEXT_DIM }}>
                    Volume over 50, difficulty under 40, and opportunity score over 70.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 xl:grid-cols-3">
                {quickWins.slice(0, 6).map((row) => {
                  const difficultyStyle = difficultyTone(row.difficultyLabel);
                  const opportunityStyle = opportunityTone(row.opportunityScore);
                  return (
                    <div key={row.keyword} className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{row.keyword}</p>
                          <p className="mt-1 text-xs" style={{ color: TEXT_DIM }}>{row.recommendedContentType}</p>
                        </div>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ color: opportunityStyle.color, background: opportunityStyle.bg }}>
                          {row.opportunityScore ?? row.preOpportunityScore}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: difficultyStyle.color, background: difficultyStyle.bg }}>{row.difficultyLabel}</span>
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: "#A5B4FC", background: "rgba(99,102,241,0.14)" }}>{formatIntent(row.intent)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {data.clusters.length > 0 && (
            <div className="rounded-xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>Keyword Clusters</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.clusters.slice(0, 6).map((cluster) => (
                  <div key={cluster.clusterId} className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                    <p className="font-semibold text-white">{cluster.clusterName}</p>
                    <p className="mt-2 text-xs" style={{ color: TEXT_DIM }}>Top keyword: {cluster.topKeyword}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: TEXT_MUTED }}>Volume</p>
                        <p className="mt-1 text-sm font-bold text-white">{formatVolume(cluster.totalSearchVolume)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: TEXT_MUTED }}>Avg difficulty</p>
                        <p className="mt-1 text-sm font-bold text-white">{cluster.averageDifficulty ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: TEXT_MUTED }}>Top score</p>
                        <p className="mt-1 text-sm font-bold text-white">{cluster.topOpportunityScore ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border p-4" style={{ background: CARD_BG, borderColor: BORDER }}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <p className="text-lg font-bold text-white">{filteredRows.length}{filteredRows.length !== data.rows.length ? ` / ${data.rows.length}` : ""} keyword opportunities</p>
                  <p className="mt-1 text-sm" style={{ color: TEXT_DIM }}>
                    {data.cached ? "Showing cached keyword research." : "Showing fresh keyword research."}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-4">
                <input
                  value={keywordSearch}
                  onChange={(event) => setKeywordSearch(event.target.value)}
                  placeholder="Search keywords…"
                  className="rounded-xl border px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none"
                  style={{ borderColor: BORDER, background: CARD_BG_ALT }}
                />
                <select value={volumeFilter} onChange={(event) => setVolumeFilter(event.target.value as VolumeFilter)} className="rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}>
                  <option value="all">Volume: All</option>
                  <option value="50">Volume: 50+</option>
                  <option value="100">Volume: 100+</option>
                  <option value="1000">Volume: 1K+</option>
                </select>
                <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)} className="rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}>
                  <option value="all">Difficulty: All</option>
                  <option value="pending">Difficulty: Pending</option>
                  <option value="easy">Difficulty: Easy</option>
                  <option value="medium">Difficulty: Medium</option>
                  <option value="hard">Difficulty: Hard</option>
                  <option value="very-hard">Difficulty: Very Hard</option>
                  <option value="unavailable">Difficulty: Unavailable</option>
                </select>
                <select value={opportunityFilter} onChange={(event) => setOpportunityFilter(event.target.value as OpportunityFilter)} className="rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}>
                  <option value="all">Opportunity: All</option>
                  <option value="top">Top opportunities</option>
                  <option value="quick-wins">Quick wins</option>
                  <option value="low-competition">Low competition</option>
                </select>
              </div>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "rgba(255,100,45,0.1)", borderColor: "rgba(255,100,45,0.24)" }}>
              <div className="flex items-center gap-2">
                <CheckSquare size={16} style={{ color: ACCENT }} />
                <span className="text-sm font-semibold text-white">{selected.size} selected</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setSelected(new Set())} className="rounded-lg px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.05]" style={{ color: TEXT_DIM }}>
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={() => void analyzeDifficulty([...selected])}
                  disabled={analyzingKeywords.size > 0}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
                >
                  {analyzingKeywords.size > 0 ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                  Analyze selected
                </button>
              </div>
            </div>
          )}

          <div className="rounded-xl border overflow-hidden" style={{ borderColor: BORDER }}>
            <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full text-sm">
                <thead>
                  <tr style={{ background: CARD_BG_ALT, borderBottom: `1px solid ${BORDER}` }}>
                    <th className="px-4 py-3 w-10">
                      <button
                        type="button"
                        onClick={() => {
                          if (selected.size === filteredRows.length) setSelected(new Set());
                          else setSelected(new Set(filteredRows.map((row) => row.keyword)));
                        }}
                        style={{ color: TEXT_DIM }}
                      >
                        {selected.size === filteredRows.length && filteredRows.length > 0 ? <CheckSquare size={15} style={{ color: ACCENT }} /> : <Square size={15} />}
                      </button>
                    </th>
                    {["Keyword", "Intent", "Search Volume", "CPC", "Difficulty", "Trend", "Opportunity", "Recommended Content", "Action"].map((label) => (
                      <th key={label} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => {
                    const difficultyStyle = difficultyTone(row.difficultyLabel);
                    const pressureStyle = serpPressureTone(row.serpPressure);
                    const opportunityStyle = opportunityTone(row.opportunityScore ?? row.preOpportunityScore);
                    const isSelected = selected.has(row.keyword);
                    const isSaved = saved.has(row.keyword);
                    const inProject = projectAdded.has(row.keyword);
                    const isAnalyzing = analyzingKeywords.has(row.keyword);

                    return (
                      <motion.tr
                        key={row.keyword}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        style={{
                          background: isSelected ? "rgba(255,100,45,0.06)" : index % 2 === 0 ? CARD_BG : CARD_BG_ALT,
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(row.keyword)) next.delete(row.keyword);
                                else next.add(row.keyword);
                                return next;
                              });
                            }}
                            style={{ color: isSelected ? ACCENT : TEXT_DIM }}
                          >
                            {isSelected ? <CheckSquare size={15} style={{ color: ACCENT }} /> : <Square size={15} />}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="max-w-[260px]">
                            <p className="font-semibold text-white">{row.keyword}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {row.clusterName && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#A5B4FC", background: "rgba(99,102,241,0.14)" }}>
                                  {row.clusterName}
                                </span>
                              )}
                              {row.opportunityKind === "preliminary" && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#FCD34D", background: "rgba(245,158,11,0.14)" }}>
                                  Provisional
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: "#A5B4FC", background: "rgba(99,102,241,0.14)" }}>
                            {formatIntent(row.intent)}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-mono font-bold text-white">{formatVolume(row.searchVolume)}</td>
                        <td className="px-4 py-4 font-mono text-white/90">{formatCurrency(row.cpc)}</td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{row.difficultyScore != null ? Math.round(row.difficultyScore) : "—"}</span>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: difficultyStyle.color, background: difficultyStyle.bg }}>
                                {row.difficultyLabel}
                              </span>
                            </div>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                              <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, row.difficultyScore ?? 0))}%`, background: difficultyStyle.color }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ color: pressureStyle.color, background: pressureStyle.bg }}>
                              {row.difficultyStatus === "pending" ? "Pending" : row.serpPressure}
                            </span>
                            <p className="text-[11px]" style={{ color: TEXT_DIM }}>
                              {row.difficultyStatus === "pending" ? "Difficulty pending" : `${row.serpFeaturesCount} SERP features`}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-white">{row.opportunityScore ?? row.preOpportunityScore}</span>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: opportunityStyle.color, background: opportunityStyle.bg }}>
                                {row.opportunityLabel}
                              </span>
                            </div>
                            <p className="text-[11px]" style={{ color: TEXT_DIM }}>
                              {row.opportunityKind === "preliminary" ? "Pre-score until difficulty is analyzed" : "Full score"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-white">{row.recommendedContentType}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <TrackButton keyword={row.keyword} domain={domain} country={country} />
                            <button
                              type="button"
                              onClick={() => void analyzeDifficulty([row.keyword])}
                              disabled={isAnalyzing || row.difficultyStatus === "available"}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03] disabled:opacity-40"
                              style={{ borderColor: BORDER, color: row.difficultyStatus === "available" ? "#22C55E" : TEXT_DIM }}
                            >
                              {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                              {row.difficultyStatus === "available" ? "Analyzed" : "Analyze difficulty"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setProjectAdded((prev) => {
                                const next = new Set(prev);
                                if (next.has(row.keyword)) next.delete(row.keyword);
                                else next.add(row.keyword);
                                return next;
                              })}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03]"
                              style={{ borderColor: BORDER, color: inProject ? "#22C55E" : TEXT_DIM }}
                            >
                              <FolderPlus size={12} />
                              {inProject ? "Added" : "Add to project"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setSaved((prev) => {
                                const next = new Set(prev);
                                if (next.has(row.keyword)) next.delete(row.keyword);
                                else next.add(row.keyword);
                                return next;
                              })}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03]"
                              style={{ borderColor: BORDER, color: isSaved ? "#A78BFA" : TEXT_DIM }}
                            >
                              <BookmarkPlus size={12} />
                              {isSaved ? "Saved" : "Save"}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {data.page.hasMore && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => void runSearch({ nextLimit: limit + DEFAULT_LIMIT })}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.03] disabled:opacity-50"
                style={{ borderColor: BORDER, background: CARD_BG }}
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
                Load more opportunities
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
