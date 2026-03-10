"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { isDataProviderUnavailableCode } from "@/lib/data-provider";
import {
  ArrowRight,
  BarChart2,
  BookmarkPlus,
  Check,
  CheckSquare,
  ChevronDown,
  DollarSign,
  Download,
  FolderPlus,
  Globe,
  Loader2,
  Search,
  Sparkles,
  Square,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

interface Suggestion {
  keyword: string;
  volume: number | null;
  cpc: number | null;
  competition: number | null;
}

type VolumeFilter = "all" | "1k" | "5k" | "10k";
type DifficultyFilter = "all" | "low" | "medium" | "high";
type CpcFilter = "all" | "low" | "mid" | "high";
type IntentFilter = "all" | "informational" | "commercial" | "transactional" | "navigational";
type SortKey = "volume" | "cpc" | "competition" | "opportunity";

const CARD_BG = "#151B27";
const CARD_BG_ALT = "#0D1424";
const BORDER = "#1E2940";
const ACCENT = "#FF642D";
const TEXT_MUTED = "#64748B";
const TEXT_DIM = "#8B9BB4";

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

function normalizeDomainInput(raw: string): string {
  return raw
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

function formatVolume(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

function formatCurrency(v: number | null): string {
  if (v === null) return "—";
  return `$${v.toFixed(2)}`;
}

function competitionLabel(c: number | null): { label: "Low" | "Medium" | "High" | "—"; color: string; tone: string } {
  if (c === null) return { label: "—", color: TEXT_MUTED, tone: "rgba(100,116,139,0.16)" };
  if (c < 0.33) return { label: "Low", color: "#22C55E", tone: "rgba(34,197,94,0.14)" };
  if (c < 0.66) return { label: "Medium", color: "#F59E0B", tone: "rgba(245,158,11,0.14)" };
  return { label: "High", color: "#EF4444", tone: "rgba(239,68,68,0.14)" };
}

function classifyIntent(keyword: string): IntentFilter {
  const value = keyword.toLowerCase();
  if (/\b(buy|pricing|price|demo|service|agency|software|tool|platform)\b/.test(value)) return "transactional";
  if (/\b(best|top|vs|review|compare|comparison|alternative|competitor)\b/.test(value)) return "commercial";
  if (/\b(login|signin|sign in|docs|documentation|github|youtube)\b/.test(value)) return "navigational";
  return "informational";
}

function intentLabel(intent: IntentFilter): string {
  if (intent === "all") return "All intents";
  return intent.charAt(0).toUpperCase() + intent.slice(1);
}

function cpcBand(value: number | null): CpcFilter {
  if (value === null) return "low";
  if (value < 2) return "low";
  if (value < 8) return "mid";
  return "high";
}

function trendMeta(suggestion: Suggestion): { label: string; color: string; tone: string } {
  const volume = suggestion.volume ?? 0;
  const competition = suggestion.competition ?? 1;
  if (volume >= 5000 && competition < 0.5) {
    return { label: "Rising", color: "#22C55E", tone: "rgba(34,197,94,0.14)" };
  }
  if (volume >= 1000) {
    return { label: "Steady", color: "#60A5FA", tone: "rgba(96,165,250,0.14)" };
  }
  return { label: "Niche", color: "#A78BFA", tone: "rgba(167,139,250,0.14)" };
}

function opportunityScore(suggestion: Suggestion): number {
  const volume = suggestion.volume ?? 0;
  const cpc = suggestion.cpc ?? 0;
  const competition = suggestion.competition ?? 1;
  return volume * (1.25 - competition) + cpc * 100;
}

function getKDScore(competition: number | null): number {
  if (competition === null) return -1;
  return Math.round(competition * 100);
}

function getKDColor(kd: number): string {
  if (kd < 0) return TEXT_MUTED;
  if (kd < 34) return "#22C55E";
  if (kd < 67) return "#F59E0B";
  return "#EF4444";
}

function getKDLabel(kd: number): string {
  if (kd < 0) return "—";
  if (kd < 34) return "Easy";
  if (kd < 67) return "Medium";
  return "Hard";
}

function isQuickWin(suggestion: Suggestion): boolean {
  return (suggestion.competition ?? 1) < 0.33 && (suggestion.volume ?? 0) >= 500;
}

function exportCSV(rows: Suggestion[], seed: string): void {
  const header = "Keyword,Monthly Volume,CPC ($),KD Score,KD Label,Intent";
  const lines = rows.map((s) => {
    const kd = getKDScore(s.competition);
    const intent = classifyIntent(s.keyword);
    const cpc = s.cpc != null ? s.cpc.toFixed(2) : "";
    return `"${s.keyword.replace(/"/g, '""')}",${s.volume ?? ""},${cpc},${kd >= 0 ? kd : ""},${kd >= 0 ? getKDLabel(kd) : ""},${intent}`;
  });
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `keywords-${seed.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function extractKeywordAverage(values: Array<number | null>): string {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (!valid.length) return "—";
  const avg = valid.reduce((sum, value) => sum + value, 0) / valid.length;
  return avg >= 1000 ? formatVolume(Math.round(avg)) : avg.toFixed(1);
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
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: CARD_BG, borderColor: BORDER }}
    >
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

function DataCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border p-4"
      style={{ background: CARD_BG, borderColor: BORDER }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}>
        {icon}
      </div>
      <h3 className="mt-4 text-sm font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6" style={{ color: TEXT_DIM }}>{description}</p>
    </div>
  );
}

function KeywordTableSkeleton() {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
      <div className="grid grid-cols-[2.4fr_1fr_0.8fr_1.1fr_1fr_1.4fr] gap-3 border-b px-4 py-3" style={{ background: CARD_BG_ALT, borderColor: BORDER }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-3 rounded bg-white/10 animate-pulse" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, row) => (
        <div key={row} className="grid grid-cols-[2.4fr_1fr_0.8fr_1.1fr_1fr_1.4fr] gap-3 border-b px-4 py-4" style={{ background: row % 2 === 0 ? CARD_BG : CARD_BG_ALT, borderColor: BORDER }}>
          {Array.from({ length: 6 }).map((_, col) => (
            <div key={col} className={`h-4 rounded bg-white/8 animate-pulse ${col === 0 ? "w-4/5" : col === 5 ? "w-full" : "w-3/4"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

function KDCell({ competition }: { competition: number | null }) {
  const kd = getKDScore(competition);
  const color = getKDColor(kd);
  const label = getKDLabel(kd);

  if (kd < 0) {
    return <span style={{ color: TEXT_MUTED }}>—</span>;
  }

  return (
    <div className="flex flex-col gap-1" style={{ minWidth: 56 }}>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-black tabular-nums" style={{ color }}>{kd}</span>
        <span className="text-[10px] font-semibold" style={{ color: TEXT_MUTED }}>{label}</span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 5, background: "rgba(255,255,255,0.07)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${kd}%`, background: color, opacity: 0.9 }}
        />
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
      className="inline-flex min-w-[118px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        background: state === "done" ? "rgba(34,197,94,0.14)" : `linear-gradient(135deg, ${ACCENT}, #E8541F)`,
        color: state === "done" ? "#22C55E" : "#fff",
      }}
    >
      {state === "loading" ? (
        <Loader2 size={12} className="animate-spin" />
      ) : state === "done" ? (
        <Check size={12} />
      ) : (
        <Target size={12} />
      )}
      {state === "done" ? "Tracking" : state === "error" ? "Retry Track" : "Track"}
    </button>
  );
}

export function KeywordsClient() {
  const [domain, setDomain] = useState("");
  const [seed, setSeed] = useState("");
  const [country, setCountry] = useState("US");
  const [lastAuditDomain, setLastAuditDomain] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerUnavailable, setProviderUnavailable] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [cpcFilter, setCpcFilter] = useState<CpcFilter>("all");
  const [intentFilter, setIntentFilter] = useState<IntentFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("opportunity");
  const [keywordSearch, setKeywordSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [projectAdded, setProjectAdded] = useState<Set<string>>(new Set());
  const [batchState, setBatchState] = useState<"idle" | "running" | "done">("idle");
  const [batchProgress, setBatchProgress] = useState(0);
  const batchRef = useRef(false);
  const seededFromAuditRef = useRef(false);

  function resetResults() {
    batchRef.current = false;
    setSuggestions([]);
    setLoading(false);
    setError(null);
    setProviderUnavailable(false);
    setFromCache(false);
    setHasSearched(false);
    setSelected(new Set());
    setBatchState("idle");
    setBatchProgress(0);
    setKeywordSearch("");
  }

  function clearSearch() {
    setSeed("");
    resetResults();
  }

  useEffect(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem("rankypulse_last_url") ?? "" : "";
    const cleaned = normalizeDomainInput(raw);
    setLastAuditDomain(cleaned);
    setDomain(cleaned);
    resetResults();

    return () => {
      batchRef.current = false;
      resetResults();
    };
  }, []);

  function handleDomainChange(nextDomain: string) {
    setDomain(normalizeDomainInput(nextDomain));
    resetResults();
  }

  function handleSeedChange(nextSeed: string) {
    setSeed(nextSeed);
    resetResults();
  }

  function handleCountryChange(nextCountry: string) {
    setCountry(nextCountry);
    resetResults();
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const cleanedSeed = seed.trim();
    if (!cleanedSeed || !domain) return;

    setLoading(true);
    setError(null);
    setProviderUnavailable(false);
    setFromCache(false);
    setHasSearched(true);
    setSelected(new Set());
    setBatchState("idle");
    setBatchProgress(0);

    try {
      const cacheRes = await fetch(
        `/api/keywords/research?domain=${encodeURIComponent(domain)}&seed=${encodeURIComponent(cleanedSeed)}`
      );
      if (cacheRes.ok) {
        const cacheJson = await cacheRes.json() as { suggestions?: Suggestion[]; cached?: boolean };
        if (cacheJson.suggestions && cacheJson.suggestions.length > 0) {
          setSuggestions(cacheJson.suggestions);
          setFromCache(Boolean(cacheJson.cached));
          setLoading(false);
          return;
        }
      }
    } catch {
      // Fall through to live request.
    }

    try {
      const res = await fetch("/api/keywords/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, seed: cleanedSeed, country }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (isDataProviderUnavailableCode(data.code)) {
          setProviderUnavailable(true);
          setSuggestions([]);
          return;
        }
        setError(data.error ?? "Failed to fetch keyword opportunities.");
        setSuggestions([]);
      } else {
        setSuggestions(data.suggestions ?? []);
        setFromCache(Boolean(data.cached));
      }
    } catch {
      setError("Network error. Please try again.");
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  async function trackSelected() {
    const keywords = Array.from(selected);
    if (!keywords.length || batchState === "running") return;
    batchRef.current = true;
    setBatchState("running");
    setBatchProgress(0);

    for (let index = 0; index < keywords.length; index += 1) {
      if (!batchRef.current) break;
      await fetch("/api/rank/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, keyword: keywords[index], country }),
      });
      setBatchProgress(index + 1);
    }

    setBatchState("done");
    setSelected(new Set());
  }

  function toggleSelect(keyword: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  }

  function toggleSaved(keyword: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  }

  function toggleProjectAdded(keyword: string) {
    setProjectAdded((prev) => {
      const next = new Set(prev);
      if (next.has(keyword)) next.delete(keyword);
      else next.add(keyword);
      return next;
    });
  }

  const maxVolume = useMemo(
    () => Math.max(1, ...suggestions.map((s) => s.volume ?? 0)),
    [suggestions]
  );

  const filtered = useMemo(
    () =>
      suggestions
        .filter((suggestion) => {
          const volume = suggestion.volume ?? 0;
          const difficulty = competitionLabel(suggestion.competition).label.toLowerCase();
          const intent = classifyIntent(suggestion.keyword);
          const cpc = cpcBand(suggestion.cpc);

          if (volumeFilter === "1k" && volume < 1000) return false;
          if (volumeFilter === "5k" && volume < 5000) return false;
          if (volumeFilter === "10k" && volume < 10000) return false;
          if (difficultyFilter !== "all" && difficulty !== difficultyFilter) return false;
          if (intentFilter !== "all" && intent !== intentFilter) return false;
          if (cpcFilter !== "all" && cpc !== cpcFilter) return false;
          if (keywordSearch && !suggestion.keyword.toLowerCase().includes(keywordSearch.toLowerCase())) return false;
          return true;
        })
        .sort((left, right) => {
          if (sortKey === "volume") return (right.volume ?? 0) - (left.volume ?? 0);
          if (sortKey === "cpc") return (right.cpc ?? 0) - (left.cpc ?? 0);
          if (sortKey === "competition") return (left.competition ?? 0) - (right.competition ?? 0);
          return opportunityScore(right) - opportunityScore(left);
        }),
    [suggestions, volumeFilter, difficultyFilter, intentFilter, cpcFilter, keywordSearch, sortKey]
  );

  const totalKeywordsFound = suggestions.length;
  const lowCompetitionCount = suggestions.filter((item) => (item.competition ?? 1) < 0.33).length;
  const peopleAlsoSearchFor = filtered
    .filter((item) => item.keyword.toLowerCase() !== seed.trim().toLowerCase())
    .slice(0, 5);

  useEffect(() => {
    if (seededFromAuditRef.current) return;
    if (!lastAuditDomain) return;
    seededFromAuditRef.current = true;
  }, [lastAuditDomain]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Keyword Research</h1>
            <p className="mt-2 max-w-3xl text-base leading-7" style={{ color: TEXT_DIM }}>
              Discover keyword opportunities, search demand, and ranking potential for your website.
            </p>
          </div>
          <div
            className="rounded-2xl border px-4 py-3"
            style={{ background: CARD_BG, borderColor: BORDER }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
              Research context
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {lastAuditDomain ? `Using latest audited site: ${lastAuditDomain}` : "Start with your website domain"}
            </p>
            <p className="mt-1 text-xs" style={{ color: TEXT_DIM }}>
              Search inputs reset on every visit. Results only live in this session until you run another search.
            </p>
          </div>
        </div>
      </header>

      <section
        className="rounded-3xl border p-5 md:p-6"
        style={{ background: CARD_BG, borderColor: BORDER }}
      >
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
              Search Module
            </p>
            <h2 className="text-xl font-bold text-white">Find keyword opportunities for your site</h2>
            <p className="text-sm" style={{ color: TEXT_DIM }}>
              Enter a website and a seed topic. We&apos;ll surface related keywords with volume, CPC, competition, and beginner-friendly opportunity signals.
            </p>
          </div>

          <form onSubmit={handleSearch} className="grid gap-3 xl:grid-cols-[1.2fr_2.4fr_0.7fr_1fr_auto]">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>
                Website domain
              </span>
              <div className="relative">
                <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
                <input
                  value={domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  placeholder="yourdomain.com"
                  autoComplete="off"
                  className="w-full rounded-xl border bg-transparent py-3 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  style={{ borderColor: BORDER, background: CARD_BG_ALT }}
                />
              </div>
              {lastAuditDomain && lastAuditDomain === domain && (
                <p className="text-[11px]" style={{ color: TEXT_DIM }}>
                  Suggested from your latest audit.
                </p>
              )}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>
                Seed keyword
              </span>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: TEXT_MUTED }} />
                <input
                  value={seed}
                  onChange={(e) => handleSeedChange(e.target.value)}
                  placeholder="Enter a keyword (example: seo audit, website audit, technical seo)"
                  required
                  autoComplete="off"
                  className="w-full rounded-xl border bg-transparent py-3 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  style={{ borderColor: BORDER, background: CARD_BG_ALT }}
                />
              </div>
              <p className="text-[11px]" style={{ color: TEXT_DIM }}>
                Tip: broad topics help discovery, longer-tail terms help find lower competition ideas.
              </p>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>
                Country
              </span>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full appearance-none rounded-xl border bg-transparent px-3 py-3 pr-9 text-sm text-white focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10"
                  style={{ borderColor: BORDER, background: CARD_BG_ALT }}
                  aria-label="Country selector"
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

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }}>
                Search quality
              </span>
              <div className="flex h-[50px] items-center rounded-xl border px-3 text-xs" style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}>
                <Sparkles size={13} className="mr-2" style={{ color: ACCENT }} />
                {fromCache ? "Cached results cost $0" : "Fresh query when needed"}
              </div>
            </div>

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
                onClick={clearSearch}
                className="inline-flex h-[42px] items-center justify-center gap-1.5 rounded-xl border px-4 text-xs font-semibold transition hover:bg-white/[0.03]"
                style={{ borderColor: BORDER, color: TEXT_DIM }}
              >
                <X size={12} />
                Clear search
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYWORDS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleSeedChange(item)}
                className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                style={{ borderColor: BORDER, color: TEXT_DIM, background: CARD_BG_ALT }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {!hasSearched && !loading && (
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <section
            className="rounded-3xl border p-6"
            style={{ background: CARD_BG, borderColor: BORDER }}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}>
                <Search size={22} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
                  How Keyword Research Works
                </p>
                <h2 className="mt-2 text-2xl font-bold text-white">Turn one topic into a list of real SEO opportunities</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: TEXT_DIM }}>
                  Start with a topic your audience searches for. We expand it into related keyword ideas and help you spot the best terms to track and optimize next.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                { step: "1", title: "Enter a keyword", text: "Use a seed topic related to your product, service, or page." },
                { step: "2", title: "Discover opportunities", text: "Review related keywords by volume, CPC, intent, and competition." },
                { step: "3", title: "Track and optimize", text: "Send winning keywords into Rank Tracking and use them in content updates." },
              ].map((item) => (
                <div key={item.step} className="rounded-2xl border p-4" style={{ borderColor: BORDER, background: CARD_BG_ALT }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}>
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: TEXT_DIM }}>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <DataCard
              title="Search Volume"
              description="See how much monthly demand exists before you spend time creating content."
              icon={<BarChart2 size={18} />}
            />
            <DataCard
              title="CPC"
              description="Use paid-search pricing as a proxy for how valuable a term is commercially."
              icon={<DollarSign size={18} />}
            />
            <DataCard
              title="Keyword Difficulty"
              description="Understand whether a topic is realistically winnable for your site today."
              icon={<Zap size={18} />}
            />
            <DataCard
              title="Competition Score"
              description="Separate easier wins from crowded head terms without leaving the page."
              icon={<Target size={18} />}
            />
            <DataCard
              title="Related Keywords"
              description="Expand one idea into a cluster of terms your customers actually search."
              icon={<Sparkles size={18} />}
            />
            <DataCard
              title="Ranking Opportunities"
              description="Push strong candidates into rank tracking so research turns into execution."
              icon={<TrendingUp size={18} />}
            />
          </section>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {["Total Keywords Found", "Avg Search Volume", "Avg CPC", "Low Competition Opportunities"].map((label) => (
              <SummaryCard
                key={label}
                label={label}
                value="…"
                note="Fetching live keyword data"
                icon={<Loader2 size={16} className="animate-spin" />}
              />
            ))}
          </div>
          <KeywordTableSkeleton />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border p-5" style={{ background: "rgba(239,68,68,0.08)", borderColor: "rgba(239,68,68,0.22)" }}>
          <p className="text-sm font-semibold text-red-300">Couldn&apos;t load keyword opportunities</p>
          <p className="mt-1 text-sm text-red-200/80">{error}</p>
        </div>
      )}

      {!loading && providerUnavailable && (
        <div className="rounded-2xl border p-6 space-y-3" style={{ background: "rgba(123,92,245,0.05)", borderColor: "rgba(123,92,245,0.16)" }}>
          <div className="flex items-center gap-2">
            <Zap size={16} style={{ color: "#A78BFA" }} />
            <p className="text-sm font-semibold text-white">Keyword ideas are temporarily unavailable</p>
          </div>
          <p className="text-sm leading-7" style={{ color: TEXT_DIM }}>
            Automatic suggestions are unavailable right now. Your saved keywords and rank tracking continue to work normally.
          </p>
          <a
            href="/app/rank-tracking"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
          >
            <ArrowRight size={14} />
            Open Rank Tracking
          </a>
        </div>
      )}

      {!loading && hasSearched && !error && !providerUnavailable && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Keywords Found"
              value={String(totalKeywordsFound)}
              note={fromCache ? "Loaded from cache. No additional provider cost." : "Fresh keyword pull for this search."}
              icon={<Search size={16} />}
            />
            <SummaryCard
              label="Avg Search Volume"
              value={extractKeywordAverage(suggestions.map((item) => item.volume))}
              note="Average monthly demand across these keyword ideas."
              icon={<BarChart2 size={16} />}
            />
            <SummaryCard
              label="Avg CPC"
              value={extractKeywordAverage(suggestions.map((item) => item.cpc))}
              note="Commercial value signal from paid-search bids."
              icon={<DollarSign size={16} />}
            />
            <SummaryCard
              label="Low Competition Opportunities"
              value={String(lowCompetitionCount)}
              note="Keywords currently classified as lower competition."
              icon={<Target size={16} />}
            />
          </div>

          <div className="rounded-2xl border p-4" style={{ background: CARD_BG, borderColor: BORDER }}>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <div>
                  <p className="text-lg font-bold text-white">
                    {filtered.length}
                    {filtered.length !== suggestions.length ? ` / ${suggestions.length}` : ""} keyword opportunities
                  </p>
                  <p className="mt-1 text-sm" style={{ color: TEXT_DIM }}>
                    {fromCache ? "Loaded from cache · $0 provider cost for this repeat search." : "Fresh search pulled from DataForSEO."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportCSV(filtered, seed.trim())}
                  disabled={filtered.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white disabled:opacity-40"
                  style={{ borderColor: BORDER, color: TEXT_DIM, background: CARD_BG_ALT }}
                >
                  <Download size={13} />
                  Export CSV
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                  <input
                    value={keywordSearch}
                    onChange={(e) => setKeywordSearch(e.target.value)}
                    placeholder="Search keywords…"
                    className="w-full rounded-xl border pl-8 pr-3 py-2.5 text-xs focus:border-orange-500/60 focus:outline-none focus:ring-4 focus:ring-orange-500/10 text-white placeholder:text-slate-500"
                    style={{ borderColor: BORDER, background: CARD_BG_ALT }}
                  />
                </div>
                <div className="relative">
                  <select
                    value={volumeFilter}
                    onChange={(e) => setVolumeFilter(e.target.value as VolumeFilter)}
                    className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-xs font-semibold focus:border-orange-500/60 focus:outline-none"
                    style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}
                    aria-label="Volume filter"
                  >
                    <option value="all">Volume: All</option>
                    <option value="1k">Volume: 1K+</option>
                    <option value="5k">Volume: 5K+</option>
                    <option value="10k">Volume: 10K+</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                </div>

                <div className="relative">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value as DifficultyFilter)}
                    className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-xs font-semibold focus:border-orange-500/60 focus:outline-none"
                    style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}
                    aria-label="Difficulty filter"
                  >
                    <option value="all">Difficulty: All</option>
                    <option value="low">Difficulty: Low</option>
                    <option value="medium">Difficulty: Medium</option>
                    <option value="high">Difficulty: High</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                </div>

                <div className="relative">
                  <select
                    value={cpcFilter}
                    onChange={(e) => setCpcFilter(e.target.value as CpcFilter)}
                    className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-xs font-semibold focus:border-orange-500/60 focus:outline-none"
                    style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}
                    aria-label="CPC filter"
                  >
                    <option value="all">CPC: All</option>
                    <option value="low">CPC: Low</option>
                    <option value="mid">CPC: Mid</option>
                    <option value="high">CPC: High</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={intentFilter}
                      onChange={(e) => setIntentFilter(e.target.value as IntentFilter)}
                      className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-xs font-semibold focus:border-orange-500/60 focus:outline-none"
                      style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}
                      aria-label="Keyword intent filter"
                    >
                      <option value="all">Intent: All</option>
                      <option value="informational">Intent: Informational</option>
                      <option value="commercial">Intent: Commercial</option>
                      <option value="transactional">Intent: Transactional</option>
                      <option value="navigational">Intent: Navigational</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                  </div>

                  <div className="relative min-w-[164px]">
                    <select
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as SortKey)}
                      className="w-full appearance-none rounded-xl border px-3 py-2.5 pr-8 text-xs font-semibold focus:border-orange-500/60 focus:outline-none"
                      style={{ borderColor: BORDER, background: CARD_BG_ALT, color: TEXT_DIM }}
                      aria-label="Sort keywords"
                    >
                      <option value="opportunity">Sort: Opportunity</option>
                      <option value="volume">Sort: Volume</option>
                      <option value="cpc">Sort: CPC</option>
                      <option value="competition">Sort: Competition</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: TEXT_MUTED }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between" style={{ background: "rgba(255,100,45,0.1)", borderColor: "rgba(255,100,45,0.24)" }}>
              <div className="flex items-center gap-2">
                <CheckSquare size={16} style={{ color: ACCENT }} />
                <span className="text-sm font-semibold text-white">
                  {selected.size} keyword{selected.size === 1 ? "" : "s"} selected
                </span>
                {batchState === "running" && (
                  <span className="text-xs" style={{ color: TEXT_DIM }}>
                    Tracking {batchProgress}/{selected.size + batchProgress}
                  </span>
                )}
                {batchState === "done" && (
                  <span className="text-xs text-emerald-400">Tracked successfully.</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelected(new Set())}
                  className="rounded-lg px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.05]"
                  style={{ color: TEXT_DIM }}
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  onClick={trackSelected}
                  disabled={batchState === "running"}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #E8541F)` }}
                >
                  {batchState === "running" ? <Loader2 size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                  Track selected
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="rounded-2xl border p-10 text-center" style={{ background: CARD_BG, borderColor: BORDER }}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl" style={{ background: "rgba(255,100,45,0.12)", color: ACCENT }}>
                <Search size={24} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">No results match these filters</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7" style={{ color: TEXT_DIM }}>
                Try relaxing the volume, difficulty, CPC, or intent filters. Broad seeds and lower CPC filters usually surface more beginner-friendly opportunities.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: BORDER }}>
              <div className="overflow-x-auto">
                <table className="min-w-[1000px] w-full text-sm">
                  <thead>
                    <tr style={{ background: CARD_BG_ALT, borderBottom: `1px solid ${BORDER}` }}>
                      <th className="px-4 py-3 w-10">
                        <button
                          type="button"
                          onClick={() => {
                            if (selected.size === filtered.length) setSelected(new Set());
                            else setSelected(new Set(filtered.map((item) => item.keyword)));
                          }}
                          className="transition hover:text-white"
                          style={{ color: TEXT_DIM }}
                          aria-label={selected.size === filtered.length ? "Deselect all keywords" : "Select all keywords"}
                        >
                          {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare size={15} style={{ color: ACCENT }} /> : <Square size={15} />}
                        </button>
                      </th>
                      {[
                        { label: "Keyword", title: "Keyword and search intent" },
                        { label: "Search Volume", title: "Average monthly search volume" },
                        { label: "CPC", title: "Cost-per-click (Google Ads)" },
                        { label: "KD Score", title: "Keyword difficulty 0–100. Lower = easier to rank." },
                        { label: "Trend", title: "Opportunity signal based on volume and competition" },
                        { label: "Action", title: "Track or save this keyword" },
                      ].map(({ label, title }) => (
                        <th key={label} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: TEXT_MUTED }} title={title}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((suggestion, index) => {
                      const difficulty = competitionLabel(suggestion.competition);
                      const intent = classifyIntent(suggestion.keyword);
                      const trend = trendMeta(suggestion);
                      const isSelected = selected.has(suggestion.keyword);
                      const isSaved = saved.has(suggestion.keyword);
                      const inProject = projectAdded.has(suggestion.keyword);
                      const quickWin = isQuickWin(suggestion);
                      const volPct = maxVolume > 0 ? Math.round(((suggestion.volume ?? 0) / maxVolume) * 100) : 0;

                      return (
                        <tr
                          key={suggestion.keyword}
                          style={{
                            background: isSelected ? "rgba(255,100,45,0.06)" : index % 2 === 0 ? CARD_BG : CARD_BG_ALT,
                            borderBottom: `1px solid ${BORDER}`,
                          }}
                          className="transition hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => toggleSelect(suggestion.keyword)}
                              className="transition hover:text-white"
                              style={{ color: isSelected ? ACCENT : TEXT_DIM }}
                              aria-label={`${isSelected ? "Deselect" : "Select"} ${suggestion.keyword}`}
                            >
                              {isSelected ? <CheckSquare size={15} style={{ color: ACCENT }} /> : <Square size={15} />}
                            </button>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="max-w-[320px]">
                              <p className="font-semibold text-white">{suggestion.keyword}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ background: "rgba(99,102,241,0.14)", color: "#A5B4FC" }}>
                                  {intentLabel(intent)}
                                </span>
                                {quickWin && (
                                  <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ background: "rgba(34,197,94,0.14)", color: "#22C55E" }}>
                                    <Zap size={8} /> Quick Win
                                  </span>
                                )}
                                {isSaved && (
                                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ background: "rgba(167,139,250,0.14)", color: "#A78BFA" }}>
                                    Saved
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <div className="flex flex-col gap-1">
                              <span className="font-mono font-bold text-white">{formatVolume(suggestion.volume)}</span>
                              <div className="rounded-full overflow-hidden" style={{ width: 64, height: 4, background: "rgba(255,255,255,0.07)" }}>
                                <div className="h-full rounded-full" style={{ width: `${volPct}%`, background: "#FF642D", opacity: 0.75 }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-mono text-white/90">{formatCurrency(suggestion.cpc)}</td>
                          <td className="px-4 py-4 align-top">
                            <KDCell competition={suggestion.competition} />
                          </td>
                          <td className="px-4 py-4">
                            <span className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: trend.tone, color: trend.color }}>
                              {trend.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <TrackButton keyword={suggestion.keyword} domain={domain} country={country} />
                              <button
                                type="button"
                                onClick={() => toggleProjectAdded(suggestion.keyword)}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03]"
                                style={{ borderColor: BORDER, color: inProject ? "#22C55E" : TEXT_DIM }}
                              >
                                <FolderPlus size={12} />
                                {inProject ? "Added" : "Add to project"}
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleSaved(suggestion.keyword)}
                                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-white/[0.03]"
                                style={{ borderColor: BORDER, color: isSaved ? "#A78BFA" : TEXT_DIM }}
                              >
                                <BookmarkPlus size={12} />
                                {isSaved ? "Saved" : "Save"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {peopleAlsoSearchFor.length > 0 && (
            <div className="rounded-2xl border p-5" style={{ background: CARD_BG, borderColor: BORDER }}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: TEXT_MUTED }}>
                People also search for
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {peopleAlsoSearchFor.map((item) => (
                  <button
                    key={item.keyword}
                    type="button"
                    onClick={() => handleSeedChange(item.keyword)}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-orange-500/30 hover:text-white"
                    style={{ borderColor: BORDER, color: TEXT_DIM, background: CARD_BG_ALT }}
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
  );
}
