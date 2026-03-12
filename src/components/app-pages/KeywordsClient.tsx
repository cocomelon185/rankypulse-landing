"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookmarkPlus,
  Check,
  CheckSquare,
  ChevronDown,
  Compass,
  FolderOpen,
  FolderPlus,
  Globe,
  HelpCircle,
  Info,
  Loader2,
  RefreshCcw,
  Search,
  ShoppingCart,
  Sparkles,
  Square,
  Target,
  TrendingUp,
  Zap,
  CheckCircle,
} from "lucide-react";
import { isDataProviderUnavailableCode } from "@/lib/data-provider";
import { computeFullOpportunityScore } from "@/lib/dataforseo/opportunity-score";
import { KeywordOpportunityMap } from "@/components/keywords/KeywordOpportunityMap";
import { DifficultyDistributionBar } from "@/components/keywords/DifficultyDistributionBar";

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
    keywords?: string[];
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

// CTR model for traffic estimate
const CTR_MAP: Record<number, number> = {
  90: 0.32, 80: 0.27, 70: 0.22, 60: 0.18, 50: 0.14,
  40: 0.10, 30: 0.07, 20: 0.04, 10: 0.02, 0: 0.01,
};
function getEstCTR(opportunityScore: number): number {
  const key = Math.round(opportunityScore / 10) * 10;
  return CTR_MAP[Math.max(0, Math.min(90, key))] ?? 0.01;
}

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

function difficultyTone(label: string): { color: string; bg: string } {
  switch (label) {
    case "Easy":
      return { color: "#22C55E", bg: "rgba(34,197,94,0.14)" };
    case "Medium":
      return { color: "#F59E0B", bg: "rgba(245,158,11,0.14)" };
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

function IntentIcon({ intent }: { intent: SearchRow["intent"] }) {
  const map: Record<SearchRow["intent"], { icon: typeof Info; color: string; label: string }> = {
    informational: { icon: Info, color: "#60A5FA", label: "Informational" },
    commercial: { icon: ShoppingCart, color: "#F59E0B", label: "Commercial" },
    transactional: { icon: Zap, color: "#FF642D", label: "Transactional" },
    navigational: { icon: Compass, color: "#A78BFA", label: "Navigational" },
    unknown: { icon: HelpCircle, color: "#4A5568", label: "Unknown" },
  };
  const { icon: Icon, color, label } = map[intent] ?? map.unknown;
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={11} style={{ color }} />
      <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
    </div>
  );
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
    <div className="rounded-2xl border p-4" style={{ background: CARD_BG, borderColor: BORDER }}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
          {label}
        </p>
        <span className="rounded-lg p-1.5" style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}>{icon}</span>
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
        {["Keywords", "Easy Wins", "Traffic Potential", "Avg Difficulty", "Analyzed"].map((label) => (
          <SummaryCard key={label} label={label} value="…" note="Loading keyword research" icon={<Loader2 size={14} className="animate-spin" />} />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
          <div className="h-5 w-48 rounded animate-pulse bg-white/10 mb-4" />
          <div className="h-64 rounded-xl animate-pulse bg-white/5" />
        </div>
        <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
          <div className="h-5 w-40 rounded animate-pulse bg-white/10 mb-4" />
          <div className="space-y-3">
            {[80, 60, 45, 30, 20, 10].map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-2 w-10 rounded animate-pulse bg-white/10" />
                <div className="h-2 rounded animate-pulse bg-white/5" style={{ width: `${w}%` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
        <div className="h-5 w-36 rounded animate-pulse bg-white/10 mb-4" />
        <div className="grid gap-3 xl:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-xl animate-pulse bg-white/5" />)}
        </div>
      </div>
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-4 border-b" style={{ borderColor: BORDER, background: i % 2 === 0 ? CARD_BG_ALT : CARD_BG }}>
            <div className="h-4 w-4 rounded animate-pulse bg-white/10" />
            <div className="h-4 flex-1 rounded animate-pulse bg-white/10" />
            <div className="h-4 w-16 rounded animate-pulse bg-white/5" />
            <div className="h-4 w-16 rounded animate-pulse bg-white/5" />
            <div className="h-4 w-20 rounded animate-pulse bg-white/5" />
            <div className="h-4 w-16 rounded animate-pulse bg-white/5" />
          </div>
        ))}
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
      className="inline-flex min-w-[100px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

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

  const estimatedTraffic = useMemo(() => {
    return (data?.rows ?? []).reduce((sum, row) => {
      if (!row.searchVolume) return sum;
      const opp = row.opportunityScore ?? row.preOpportunityScore;
      return sum + Math.round(row.searchVolume * getEstCTR(opp));
    }, 0);
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

  // Quick Seeds: combine recent searches + suggested seeds
  const quickSeeds = useMemo(() => {
    const seeds = new Set<string>();
    recentSearches.slice(0, 3).forEach((s) => seeds.add(s.seed));
    SUGGESTED_KEYWORDS.slice(0, 6).forEach((s) => seeds.add(s));
    return [...seeds].slice(0, 8);
  }, [recentSearches]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-[2rem] font-black tracking-tight text-white">Keyword Research</h1>
        <p className="text-sm" style={{ color: TEXT_DIM }}>
          Discover keyword opportunities with the highest traffic potential for your website.
        </p>
      </div>

      {/* Keyword Opportunity Command Center */}
      <div
        className="rounded-2xl border p-5"
        style={{
          background: "linear-gradient(135deg, rgba(255,100,45,0.08), rgba(123,92,245,0.05))",
          borderColor: BORDER,
        }}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runSearch();
          }}
          className="grid gap-3 xl:grid-cols-[1.15fr_2.5fr_0.8fr_auto]"
        >
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>Domain</span>
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
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>Seed keyword</span>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
              <input
                value={seed}
                onChange={(event) => {
                  setSeed(event.target.value);
                  setData(null);
                }}
                placeholder="Enter a seed keyword or topic"
                autoComplete="off"
                className="w-full rounded-xl border bg-transparent py-3 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                style={{ borderColor: BORDER, background: CARD_BG_ALT }}
              />
            </div>
            {/* Quick Seeds */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Quick:</span>
              {quickSeeds.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setSeed(item);
                    setData(null);
                  }}
                  className="rounded-full border px-2.5 py-1 text-[11px] font-semibold transition hover:border-orange-500/30 hover:text-white"
                  style={{ borderColor: BORDER, color: TEXT_DIM, background: "rgba(255,255,255,0.02)" }}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => void runSuggestionDiscovery()}
                disabled={suggestionLoading || (!domain.trim() && !seed.trim())}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition hover:border-orange-500/30 hover:text-white disabled:opacity-40"
                style={{ borderColor: BORDER, color: TEXT_DIM }}
              >
                {suggestionLoading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                AI seeds
              </button>
            </div>
          </label>

          <label className="space-y-1.5">
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
              Find Opportunities
            </button>
            <button
              type="button"
              onClick={() => {
                setSeed("");
                resetResults(true);
                setDomain(lastAuditDomain);
              }}
              className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-white/[0.03]"
              style={{ borderColor: BORDER, color: TEXT_DIM }}
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Suggested Seeds Panel */}
      {(suggestions || suggestionLoading || suggestionError) && !loading && (
        <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="text-sm font-bold text-white">Suggested Seed Keywords</p>
            {suggestions && (
              <div className="rounded-full px-3 py-1 text-[11px] font-semibold" style={{ color: suggestions.cached ? "#A5B4FC" : "#86EFAC", background: suggestions.cached ? "rgba(99,102,241,0.14)" : "rgba(34,197,94,0.14)" }}>
                {suggestions.cached ? "Cached" : "Fresh"}
              </div>
            )}
          </div>

          {suggestionLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: TEXT_DIM }}>
              <Loader2 size={14} className="animate-spin" />
              Generating seed ideas…
            </div>
          )}

          {suggestionError && (
            <div className="mt-4 rounded-xl border px-4 py-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.22)", color: "#FCA5A5" }}>
              {suggestionError}
            </div>
          )}

          {suggestions && (
            <div className="mt-4 space-y-4">
              {suggestions.recommendedSeed && (
                <div className="flex items-center justify-between gap-4 rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: TEXT_MUTED }}>Recommended seed</p>
                    <p className="text-lg font-black text-white">{suggestions.recommendedSeed}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void runSearchForSeed(suggestions.recommendedSeed!)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 shrink-0"
                    style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
                  >
                    <Search size={12} />
                    Search this
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
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

              {visibleExpandedKeywords.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: TEXT_MUTED }}>Long-tail ideas</p>
                  <div className="flex flex-wrap gap-2">
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

      {loading && <LoadingState />}

      {error && !loading && (
        <div className="rounded-2xl border p-5" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.22)" }}>
          <p className="text-sm font-semibold text-red-300">Couldn&apos;t load keyword research</p>
          <p className="mt-1 text-sm text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && providerUnavailable && (
        <div className="rounded-2xl border p-6 space-y-3" style={{ background: "rgba(123,92,245,0.05)", borderColor: "rgba(123,92,245,0.16)" }}>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: "#A78BFA" }} />
            <p className="text-sm font-semibold text-white">Keyword intelligence temporarily unavailable</p>
          </div>
          <p className="text-sm leading-7" style={{ color: TEXT_DIM }}>
            RankyPulse could not reach the external keyword data provider. Rank tracking stays available.
          </p>
          <a href="/app/rank-tracking" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}>
            <ArrowRight size={14} />
            Open Rank Tracking
          </a>
        </div>
      )}

      {!loading && data && (
        <div className="space-y-5">
          {/* Data freshness bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3" style={{ background: CARD_BG, borderColor: BORDER }}>
            <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: data.cached ? "#A5B4FC" : "#86EFAC", background: data.cached ? "rgba(99,102,241,0.14)" : "rgba(34,197,94,0.14)" }}>
              {data.freshnessLabel}
            </span>
            <span className="text-xs" style={{ color: TEXT_DIM }}>{data.controls.showingMessage}</span>
            <span className="text-xs" style={{ color: TEXT_DIM }}>
              {data.quota.searchesRemainingToday}/{data.quota.searchesPerDay} searches left today
            </span>
            <span className="text-xs" style={{ color: data.budget.mode === "normal" ? TEXT_DIM : "#FCD34D" }}>
              Spend ${data.budget.spendToday.toFixed(2)} / ${data.budget.budgetUsd.toFixed(2)}
            </span>
            <button
              type="button"
              onClick={() => void runSearch({ forceRefresh: true })}
              disabled={!data.controls.canRefresh || loading}
              className="ml-auto inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03] disabled:opacity-50"
              style={{ borderColor: BORDER, color: TEXT_DIM }}
            >
              <RefreshCcw size={12} />
              Refresh
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Total Keywords"
              value={String(data.summary.totalKeywords)}
              note="Opportunities found for this search"
              icon={<Search size={14} />}
            />
            <SummaryCard
              label="Easy Wins"
              value={String(quickWins.length)}
              note="Vol 50+, difficulty < 40, score > 70"
              icon={<Zap size={14} />}
            />
            <SummaryCard
              label="Traffic Potential"
              value={estimatedTraffic >= 1000 ? `${(estimatedTraffic / 1000).toFixed(1)}K` : String(estimatedTraffic)}
              note="Estimated monthly clicks if ranked"
              icon={<TrendingUp size={14} />}
            />
            <SummaryCard
              label="Low Competition"
              value={String(data.summary.lowCompetitionOpportunities)}
              note="Confirmed difficulty under 40"
              icon={<Target size={14} />}
            />
            <SummaryCard
              label="Analyzed"
              value={String(data.summary.analyzedKeywords)}
              note={`Auto-analyzed top ${data.controls.autoAnalyzedCount}`}
              icon={<CheckCircle size={14} />}
            />
          </div>

          {/* Top Opportunity Banner */}
          {data.topOpportunity.keyword && (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border px-5 py-4" style={{ background: "rgba(34,197,94,0.06)", borderColor: "rgba(34,197,94,0.2)" }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
                  <TrendingUp size={14} style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#86EFAC" }}>Top Opportunity</p>
                  <p className="text-sm font-bold text-white mt-0.5">{data.topOpportunity.keyword}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-2xl font-black" style={{ color: "#22C55E" }}>{data.topOpportunity.score ?? "—"}</span>
                <span className="text-xs font-semibold rounded-full px-2 py-1" style={{ color: "#86EFAC", background: "rgba(34,197,94,0.15)" }}>
                  {data.topOpportunity.label}
                </span>
              </div>
            </div>
          )}

          {/* Keyword Opportunity Map + Difficulty Distribution */}
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <KeywordOpportunityMap rows={data.rows} />
            <DifficultyDistributionBar rows={data.rows} />
          </div>

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(34,197,94,0.15)" }}>
                  <Zap size={13} style={{ color: "#22C55E" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Easy Win Keywords</p>
                  <p className="text-[11px]" style={{ color: TEXT_DIM }}>High opportunity, low difficulty — start here</p>
                </div>
              </div>
              <div className="grid gap-3 xl:grid-cols-3">
                {quickWins.slice(0, 6).map((row) => {
                  const diffStyle = difficultyTone(row.difficultyLabel);
                  const oppStyle = opportunityTone(row.opportunityScore);
                  const score = row.opportunityScore ?? row.preOpportunityScore;
                  return (
                    <div key={row.keyword} className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{row.keyword}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <IntentIcon intent={row.intent} />
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black" style={{ color: oppStyle.color }}>{score}</p>
                          <p className="text-[10px] font-semibold" style={{ color: oppStyle.color }}>{row.opportunityLabel}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${Math.max(0, Math.min(100, row.difficultyScore ?? 0))}%`, background: diffStyle.color }}
                            />
                          </div>
                          <span className="text-[10px] font-bold shrink-0" style={{ color: diffStyle.color }}>
                            {row.difficultyScore != null ? Math.round(row.difficultyScore) : "—"} {row.difficultyLabel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px]" style={{ color: TEXT_DIM }}>
                            {formatVolume(row.searchVolume)} / mo
                          </span>
                          <TrackButton keyword={row.keyword} domain={domain} country={country} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Keyword Clusters */}
          {data.clusters.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: "rgba(99,102,241,0.15)" }}>
                  <FolderOpen size={13} style={{ color: "#A5B4FC" }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Keyword Clusters</p>
                  <p className="text-[11px]" style={{ color: TEXT_DIM }}>Click a cluster to filter the table</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.clusters.slice(0, 6).map((cluster) => {
                  const isExpanded = expandedClusters.has(cluster.clusterId);
                  return (
                    <div key={cluster.clusterId} className="rounded-xl border p-4" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => {
                          setKeywordSearch(cluster.clusterName);
                          setOpportunityFilter("all");
                        }}
                      >
                        <p className="font-semibold text-white hover:text-orange-400 transition-colors">{cluster.clusterName}</p>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: TEXT_DIM }}>Top: {cluster.topKeyword}</p>
                      </button>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Volume</p>
                          <p className="mt-0.5 text-sm font-bold text-white">{formatVolume(cluster.totalSearchVolume)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Difficulty</p>
                          <p className="mt-0.5 text-sm font-bold text-white">{cluster.averageDifficulty ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: TEXT_MUTED }}>Score</p>
                          <p className="mt-0.5 text-sm font-bold text-white">{cluster.topOpportunityScore ?? "—"}</p>
                        </div>
                      </div>
                      {cluster.keywords && cluster.keywords.length > 0 && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setExpandedClusters((prev) => {
                              const next = new Set(prev);
                              if (next.has(cluster.clusterId)) next.delete(cluster.clusterId);
                              else next.add(cluster.clusterId);
                              return next;
                            })}
                            className="flex items-center gap-1 text-[11px] font-semibold transition hover:text-white"
                            style={{ color: TEXT_DIM }}
                          >
                            <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            {isExpanded ? "Hide" : "Show"} {cluster.keywords.length} keywords
                          </button>
                          {isExpanded && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {cluster.keywords.slice(0, 8).map((kw) => (
                                <button
                                  key={kw}
                                  type="button"
                                  onClick={() => setSeed(kw)}
                                  className="rounded-full border px-2 py-0.5 text-[10px] font-semibold transition hover:border-orange-500/30 hover:text-white"
                                  style={{ borderColor: BORDER, color: TEXT_DIM }}
                                >
                                  {kw}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table controls */}
          <div className="rounded-2xl border p-4" style={{ background: CARD_BG, borderColor: BORDER }}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {filteredRows.length}{filteredRows.length !== data.rows.length ? ` / ${data.rows.length}` : ""} keyword opportunities
                </p>
                <p className="mt-0.5 text-xs" style={{ color: TEXT_DIM }}>
                  {data.cached ? "Cached results" : "Fresh results"} · sorted by opportunity score
                </p>
              </div>
              <div className="grid gap-2 md:grid-cols-4">
                <input
                  value={keywordSearch}
                  onChange={(event) => setKeywordSearch(event.target.value)}
                  placeholder="Filter keywords…"
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
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                  <option value="very-hard">Very Hard</option>
                  <option value="pending">Pending</option>
                </select>
                <select value={opportunityFilter} onChange={(event) => setOpportunityFilter(event.target.value as OpportunityFilter)} className="rounded-xl border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}>
                  <option value="all">All opportunities</option>
                  <option value="top">Top scores (75+)</option>
                  <option value="quick-wins">Easy wins</option>
                  <option value="low-competition">Low competition</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "rgba(255,100,45,0.1)", borderColor: "rgba(255,100,45,0.24)" }}>
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
                  Analyze difficulty
                </button>
              </div>
            </div>
          )}

          {/* Keyword Table */}
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-sm">
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
                    {[
                      { label: "Keyword", width: "min-w-[200px]" },
                      { label: "Intent", width: "w-28" },
                      { label: "Volume", width: "w-24" },
                      { label: "CPC", width: "w-20" },
                      { label: "Difficulty", width: "min-w-[140px]" },
                      { label: "Opportunity", width: "min-w-[130px]" },
                      { label: "Action", width: "min-w-[260px]" },
                    ].map(({ label, width }) => (
                      <th key={label} className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest ${width}`} style={{ color: TEXT_MUTED }}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => {
                    const diffStyle = difficultyTone(row.difficultyLabel);
                    const oppStyle = opportunityTone(row.opportunityScore ?? row.preOpportunityScore);
                    const isSelected = selected.has(row.keyword);
                    const isSaved = saved.has(row.keyword);
                    const inProject = projectAdded.has(row.keyword);
                    const isAnalyzing = analyzingKeywords.has(row.keyword);
                    const score = row.opportunityScore ?? row.preOpportunityScore;

                    return (
                      <motion.tr
                        key={row.keyword}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.015 }}
                        style={{
                          background: isSelected ? "rgba(255,100,45,0.06)" : index % 2 === 0 ? CARD_BG : CARD_BG_ALT,
                          borderBottom: `1px solid ${BORDER}`,
                        }}
                        className="transition hover:bg-white/[0.02]"
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

                        {/* Keyword */}
                        <td className="px-4 py-4">
                          <div className="max-w-[280px]">
                            <p className="font-semibold text-white">{row.keyword}</p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {row.clusterName && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: "#A5B4FC", background: "rgba(99,102,241,0.14)" }}>
                                  {row.clusterName}
                                </span>
                              )}
                              {row.opportunityKind === "preliminary" && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: "#FCD34D", background: "rgba(245,158,11,0.14)" }}>
                                  Pre-score
                                </span>
                              )}
                              {row.serpFeaturesCount > 0 && (
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: TEXT_DIM, background: "rgba(100,116,139,0.14)" }} title={`${row.serpFeaturesCount} SERP features · ${row.serpPressure} competition`}>
                                  {row.serpFeaturesCount} SERP features
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Intent */}
                        <td className="px-4 py-4">
                          <IntentIcon intent={row.intent} />
                        </td>

                        {/* Volume */}
                        <td className="px-4 py-4 font-mono font-bold text-white">{formatVolume(row.searchVolume)}</td>

                        {/* CPC */}
                        <td className="px-4 py-4 font-mono text-white/90">{formatCurrency(row.cpc)}</td>

                        {/* Difficulty */}
                        <td className="px-4 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-white">{row.difficultyScore != null ? Math.round(row.difficultyScore) : "—"}</span>
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: diffStyle.color, background: diffStyle.bg }}>
                                {row.difficultyLabel}
                              </span>
                            </div>
                            <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: "#1E2940" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.max(0, Math.min(100, row.difficultyScore ?? 0))}%`, background: diffStyle.color }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Opportunity */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black" style={{ color: oppStyle.color }}>{score}</span>
                            <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ color: oppStyle.color, background: oppStyle.bg }}>
                              {row.opportunityLabel}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <TrackButton keyword={row.keyword} domain={domain} country={country} />
                            <button
                              type="button"
                              onClick={() => void analyzeDifficulty([row.keyword])}
                              disabled={isAnalyzing || row.difficultyStatus === "available"}
                              className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03] disabled:opacity-40"
                              style={{ borderColor: BORDER, color: row.difficultyStatus === "available" ? "#22C55E" : TEXT_DIM }}
                              title={row.recommendedContentType}
                            >
                              {isAnalyzing ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                              {row.difficultyStatus === "available" ? "Analyzed" : "Analyze"}
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
                              {inProject ? "Added" : "Project"}
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
