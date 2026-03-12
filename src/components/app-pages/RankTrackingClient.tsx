"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp, TrendingDown, Plus, Monitor, Smartphone, Zap,
    ChevronUp, ChevronDown, ChevronsUpDown, Trash2, MoreVertical,
    Bell, Globe, Upload, Users, ChevronRight, X, PlusCircle, Activity,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrackKeywordModal } from "@/components/modals/TrackKeywordModal";
import { KeywordHistoryPanel } from "@/components/rank/KeywordHistoryPanel";
import { BulkImportModal } from "@/components/rank/BulkImportModal";
import type { RankKeyword } from "@/lib/rank-engine";

// ── CTR model (mirrors opportunity-engine.ts) ────────────────────────────────
const CTR_MAP: Record<number, number> = {
    1: 0.276, 2: 0.158, 3: 0.110, 4: 0.084, 5: 0.063,
    6: 0.049, 7: 0.039, 8: 0.033, 9: 0.027, 10: 0.024,
    11: 0.015, 12: 0.012, 13: 0.010, 14: 0.009, 15: 0.008,
    16: 0.006, 17: 0.006, 18: 0.006, 19: 0.006, 20: 0.006,
};
function getCTR(pos: number) { return CTR_MAP[pos] ?? 0.005; }
function estTraffic(pos: number | null, vol: number | null): number | null {
    if (pos == null || vol == null) return null;
    return Math.round(vol * getCTR(pos));
}

// ── Position badge helpers ───────────────────────────────────────────────────
function posClass(pos: number | null): string {
    if (pos == null) return "text-gray-500";
    if (pos <= 3) return "text-emerald-400";
    if (pos <= 10) return "text-amber-400";
    if (pos <= 20) return "text-orange-400";
    return "text-red-400";
}
function posBg(pos: number | null): string {
    if (pos == null) return "";
    if (pos <= 3) return "bg-emerald-400/10";
    if (pos <= 10) return "bg-amber-400/10";
    if (pos <= 20) return "bg-orange-400/10";
    return "bg-red-400/10";
}

// ── Sort helpers ─────────────────────────────────────────────────────────────
type SortKey = "keyword" | "position" | "change" | "volume" | "traffic";
type SortDir = "asc" | "desc";

function sortKeywords(kws: RankKeyword[], key: SortKey, dir: SortDir): RankKeyword[] {
    return [...kws].sort((a, b) => {
        let av: number | string, bv: number | string;
        switch (key) {
            case "keyword":   av = a.keyword; bv = b.keyword; break;
            case "position":  av = a.position ?? 999; bv = b.position ?? 999; break;
            case "change":    av = a.change ?? 0; bv = b.change ?? 0; break;
            case "volume":    av = a.volume ?? 0; bv = b.volume ?? 0; break;
            case "traffic":   av = estTraffic(a.position, a.volume) ?? 0; bv = estTraffic(b.position, b.volume) ?? 0; break;
            default: return 0;
        }
        if (av < bv) return dir === "asc" ? -1 : 1;
        if (av > bv) return dir === "asc" ? 1 : -1;
        return 0;
    });
}

// ── Types ────────────────────────────────────────────────────────────────────
interface VisibilityPoint { month: string; visibility: number; }
interface PlanInfo { plan: string; keywordsUsed: number; keywordCap: number; }
interface WinnerEntry { keyword: string; change: number; position: number; }
interface Overview {
    avg_position: number | null;
    top3_count: number;
    top10_count: number;
    total_keywords: number;
    visibility: number;
    visibility_change: number;
    winners: WinnerEntry[];
    losers: WinnerEntry[];
}
interface AlertRule {
    id: string;
    keyword_id: string;
    keyword: string;
    type: "drop" | "enter_top10" | "any_change";
    threshold?: number;
}

// ── SortIcon ─────────────────────────────────────────────────────────────────
function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
    if (col !== sortKey) return <ChevronsUpDown size={11} className="opacity-30 ml-0.5 inline-block" />;
    return sortDir === "asc"
        ? <ChevronUp size={11} className="ml-0.5 inline-block" style={{ color: "#FF642D" }} />
        : <ChevronDown size={11} className="ml-0.5 inline-block" style={{ color: "#FF642D" }} />;
}

// ── AlertModal ───────────────────────────────────────────────────────────────
function AlertModal({
    keyword,
    domain,
    existingAlerts,
    onSaved,
    onClose,
}: {
    keyword: RankKeyword;
    domain: string;
    existingAlerts: AlertRule[];
    onSaved: (alerts: AlertRule[]) => void;
    onClose: () => void;
}) {
    const [type, setType] = useState<"drop" | "enter_top10" | "any_change">("drop");
    const [threshold, setThreshold] = useState(5);
    const [saving, setSaving] = useState(false);

    const kwAlerts = existingAlerts.filter((a) => a.keyword_id === keyword.id);

    async function handleSave() {
        setSaving(true);
        const res = await fetch("/api/rank/alerts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain, keyword_id: keyword.id, keyword: keyword.keyword, type, threshold }),
        });
        if (res.ok) {
            const data = await res.json();
            onSaved(data.alerts);
            onClose();
        }
        setSaving(false);
    }

    async function handleDelete(id: string) {
        const res = await fetch(`/api/rank/alerts?id=${id}&domain=${encodeURIComponent(domain)}`, { method: "DELETE" });
        if (res.ok) {
            const data = await res.json();
            onSaved(data.alerts);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-sm rounded-2xl border p-6" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Set Alert — {keyword.keyword}</h3>
                    <button onClick={onClose} className="p-1 rounded hover:bg-white/5" style={{ color: "#8B9BB4" }}><X size={14} /></button>
                </div>

                {kwAlerts.length > 0 && (
                    <div className="mb-4 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4A5568" }}>Active Alerts</p>
                        {kwAlerts.map((a) => (
                            <div key={a.id} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs border" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                                <span style={{ color: "#8B9BB4" }}>
                                    {a.type === "drop" ? `Drops ≥${a.threshold} positions` : a.type === "enter_top10" ? "Enters Top 10" : "Any position change"}
                                </span>
                                <button onClick={() => handleDelete(a.id)} className="hover:text-red-400 transition" style={{ color: "#4A5568" }}><Trash2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: "#8B9BB4" }}>Alert type</label>
                        <div className="space-y-1.5">
                            {(["drop", "enter_top10", "any_change"] as const).map((t) => (
                                <label key={t} className="flex items-center gap-2.5 cursor-pointer px-3 py-2.5 rounded-lg border transition" style={{ background: type === t ? "rgba(255,100,45,0.08)" : "transparent", borderColor: type === t ? "rgba(255,100,45,0.3)" : "#1E2940" }}>
                                    <input type="radio" checked={type === t} onChange={() => setType(t)} className="accent-orange-500" />
                                    <span className="text-xs" style={{ color: type === t ? "#FF642D" : "#8B9BB4" }}>
                                        {t === "drop" ? "Position drop" : t === "enter_top10" ? "Enters Top 10" : "Any position change"}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {type === "drop" && (
                        <div>
                            <label className="block text-xs font-semibold mb-2" style={{ color: "#8B9BB4" }}>Alert when drops ≥ <span style={{ color: "#FF642D" }}>{threshold}</span> positions</label>
                            <input type="range" min={1} max={20} value={threshold} onChange={(e) => setThreshold(+e.target.value)}
                                className="w-full accent-orange-500" />
                        </div>
                    )}
                </div>

                <button onClick={handleSave} disabled={saving}
                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                    <Bell size={13} />
                    {saving ? "Saving…" : "Save Alert"}
                </button>
            </div>
        </div>
    );
}

// ── CompetitorPanel ──────────────────────────────────────────────────────────
function CompetitorPanel({ domain }: { domain: string }) {
    const [competitors, setCompetitors] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!domain || !expanded) return;
        fetch(`/api/rank/competitors?domain=${encodeURIComponent(domain)}`)
            .then((r) => r.json())
            .then((d) => setCompetitors(d.competitors ?? []))
            .catch(() => {});
    }, [domain, expanded]);

    async function addCompetitor() {
        const clean = input.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
        if (!clean) return;
        setSaving(true);
        const res = await fetch("/api/rank/competitors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain, competitor: clean }),
        });
        if (res.ok) {
            const d = await res.json();
            setCompetitors(d.competitors ?? []);
            setInput("");
        }
        setSaving(false);
    }

    async function removeCompetitor(c: string) {
        const res = await fetch(`/api/rank/competitors?domain=${encodeURIComponent(domain)}&competitor=${encodeURIComponent(c)}`, { method: "DELETE" });
        if (res.ok) {
            const d = await res.json();
            setCompetitors(d.competitors ?? []);
        }
    }

    return (
        <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition"
            >
                <div className="flex items-center gap-2.5">
                    <Users size={15} style={{ color: "#8B9BB4" }} />
                    <span className="text-sm font-bold text-white">Competitor Tracking</span>
                    {competitors.length > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,100,45,0.12)", color: "#FF642D" }}>
                            {competitors.length}
                        </span>
                    )}
                </div>
                <ChevronRight size={14} style={{ color: "#4A5568", transform: expanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 space-y-3 border-t" style={{ borderColor: "#1E2940" }}>
                            <p className="text-[11px] pt-4" style={{ color: "#4A5568" }}>
                                Track up to 5 competitor domains. Their positions will be compared to yours across tracked keywords during the next daily update.
                            </p>

                            {/* Add competitor */}
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                                    placeholder="competitor.com"
                                    className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 border outline-none focus:border-orange-500/50 transition"
                                    style={{ background: "#0D1424", borderColor: "#1E2940" }}
                                />
                                <button
                                    onClick={addCompetitor}
                                    disabled={saving || !input.trim() || competitors.length >= 5}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-40"
                                    style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                                >
                                    <PlusCircle size={13} />
                                    Add
                                </button>
                            </div>

                            {competitors.length === 0 && (
                                <p className="text-xs text-center py-2" style={{ color: "#4A5568" }}>No competitors added yet.</p>
                            )}

                            <div className="space-y-1.5">
                                {competitors.map((c) => (
                                    <div key={c} className="flex items-center justify-between rounded-lg px-3 py-2.5 border" style={{ background: "#0D1424", borderColor: "#1E2940" }}>
                                        <div className="flex items-center gap-2">
                                            <Globe size={12} style={{ color: "#8B9BB4" }} />
                                            <span className="text-xs font-medium text-white">{c}</span>
                                        </div>
                                        <button onClick={() => removeCompetitor(c)} className="hover:text-red-400 transition" style={{ color: "#4A5568" }}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {competitors.length >= 5 && (
                                <p className="text-[11px]" style={{ color: "#F59E0B" }}>Maximum 5 competitors reached.</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function RankTrackingClient() {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
    const [keywords, setKeywords] = useState<RankKeyword[]>([]);
    const [visibility, setVisibility] = useState<VisibilityPoint[]>([]);
    const [overview, setOverview] = useState<Overview | null>(null);
    const [domain, setDomain] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

    // History panel
    const [historyKw, setHistoryKw] = useState<RankKeyword | null>(null);

    // Winners/Losers expanded state
    const [winnersExpanded, setWinnersExpanded] = useState(false);
    const [losersExpanded, setLosersExpanded] = useState(false);

    // Table state
    const [sortKey, setSortKey] = useState<SortKey>("position");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Date range
    const [days, setDays] = useState(30);

    // Alerts
    const [alerts, setAlerts] = useState<AlertRule[]>([]);
    const [alertKw, setAlertKw] = useState<RankKeyword | null>(null);

    // Deleting
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Resolve domain from localStorage
    useEffect(() => {
        const raw = localStorage.getItem("rankypulse_last_url") ?? "";
        const cleaned = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase().trim();
        setDomain(cleaned || "");
    }, []);

    // Fetch plan
    useEffect(() => {
        fetch("/api/user/plan")
            .then((r) => r.json())
            .then((d) => {
                if (d.keywordCap !== undefined) setPlanInfo({ plan: d.plan ?? "free", keywordsUsed: d.keywordsUsed ?? 0, keywordCap: d.keywordCap ?? 10 });
            })
            .catch(() => {});
    }, []);

    const fetchData = useCallback(async () => {
        if (!domain) return;
        setLoading(true);
        const [kwRes, visRes, ovRes, alertsRes] = await Promise.all([
            fetch(`/api/rank/keywords?domain=${encodeURIComponent(domain)}`),
            fetch(`/api/rank/visibility?domain=${encodeURIComponent(domain)}&days=${days}`),
            fetch(`/api/rank/overview?domain=${encodeURIComponent(domain)}`),
            fetch(`/api/rank/alerts?domain=${encodeURIComponent(domain)}`),
        ]);
        if (kwRes.ok) { const { keywords: kws } = await kwRes.json(); setKeywords(kws ?? []); }
        if (visRes.ok) {
            const { trend } = await visRes.json();
            setVisibility((trend ?? []).map((t: { date: string; score: number }) => ({
                month: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                visibility: t.score,
            })));
        }
        if (ovRes.ok) { const data = await ovRes.json(); setOverview(data); }
        if (alertsRes.ok) { const data = await alertsRes.json(); setAlerts(data.alerts ?? []); }
        setLoading(false);
    }, [domain, days]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Close context menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpenMenu(null);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    function handleSort(col: SortKey) {
        if (sortKey === col) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortKey(col); setSortDir(col === "position" ? "asc" : "desc"); }
    }

    async function handleDelete(id: string) {
        setDeletingId(id);
        setOpenMenu(null);
        await fetch(`/api/rank/keywords/${id}`, { method: "DELETE" });
        setKeywords((prev) => prev.filter((k) => k.id !== id));
        if (planInfo) setPlanInfo({ ...planInfo, keywordsUsed: Math.max(0, planInfo.keywordsUsed - 1) });
        setDeletingId(null);
    }

    const filtered = keywords.filter((k) => k.device === device);
    const sorted = sortKeywords(filtered, sortKey, sortDir);

    const winners = (overview?.winners ?? filtered.filter((k) => (k.change ?? 0) >= 3).map((k) => ({ keyword: k.keyword, change: k.change ?? 0, position: k.position ?? 999 })));
    const losers = (overview?.losers ?? filtered.filter((k) => (k.change ?? 0) <= -3).map((k) => ({ keyword: k.keyword, change: k.change ?? 0, position: k.position ?? 999 })));

    const visMom = visibility.length >= 2
        ? visibility[visibility.length - 1].visibility - visibility[0].visibility : 0;
    const visLabel = visMom >= 0 ? `+${visMom.toFixed(1)}` : `${visMom.toFixed(1)}`;

    // Est total monthly traffic
    const totalTraffic = filtered.reduce((sum, k) => sum + (estTraffic(k.position, k.volume) ?? 0), 0);

    const thClass = "text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none hover:text-white transition";

    return (
        <div className="space-y-5">
            {/* ── Page Header ─────────────────────────────────────────────── */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Rank Tracking</h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>
                        {domain ? `Monitoring ${domain}` : "Monitor keyword positions daily"}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {planInfo && (
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border"
                                style={{
                                    background: planInfo.keywordsUsed >= planInfo.keywordCap ? "rgba(239,68,68,0.1)" : "rgba(255,100,45,0.08)",
                                    borderColor: planInfo.keywordsUsed >= planInfo.keywordCap ? "rgba(239,68,68,0.3)" : "rgba(255,100,45,0.2)",
                                    color: planInfo.keywordsUsed >= planInfo.keywordCap ? "#EF4444" : "#FF642D",
                                }}>
                                {planInfo.keywordsUsed}/{planInfo.keywordCap} keywords
                            </span>
                            {planInfo.keywordsUsed / planInfo.keywordCap >= 0.8 && (
                                <a href="/app/billing" className="text-[11px] font-bold flex items-center gap-1 hover:opacity-80 transition" style={{ color: "#FF642D" }}>
                                    <Zap size={10} /> Upgrade
                                </a>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => setBulkOpen(true)}
                        disabled={!domain}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition hover:bg-white/5 disabled:opacity-40"
                        style={{ borderColor: "#1E2940", color: "#8B9BB4" }}
                    >
                        <Upload size={12} /> Bulk Import
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
                        disabled={!domain}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-40"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                    >
                        <Plus size={14} /> Track Keyword
                    </button>
                </div>
            </div>

            {/* ── Summary KPIs ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                    { label: "Visibility", value: overview ? `${overview.visibility.toFixed(1)}` : "—", sub: overview ? `${visMom >= 0 ? "+" : ""}${visMom.toFixed(1)} pts (${days}d)` : undefined, up: visMom >= 0 },
                    { label: "Avg. Position", value: overview?.avg_position != null ? `#${overview.avg_position}` : "—", sub: undefined },
                    { label: "Top 3", value: overview ? String(overview.top3_count) : "—", sub: "keywords", up: true },
                    { label: "Top 10", value: overview ? String(overview.top10_count) : "—", sub: "keywords", up: true },
                    { label: "Est. Traffic", value: totalTraffic > 0 ? `~${totalTraffic.toLocaleString()}` : "—", sub: "visits/month", up: true },
                ].map((kpi) => (
                    <div key={kpi.label} className="rounded-xl border p-4 flex flex-col gap-1.5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>{kpi.label}</p>
                        <p className="text-xl font-black text-white">{kpi.value}</p>
                        {kpi.sub && (
                            <p className="text-[11px] font-semibold" style={{ color: kpi.up !== undefined ? (kpi.up ? "#00C853" : "#FF3D3D") : "#4A5568" }}>
                                {kpi.sub}
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Visibility Trend + Winners/Losers ────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chart */}
                <div className="md:col-span-2 rounded-xl border p-5" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <Activity size={14} style={{ color: "#7B5CF5" }} />
                            <h2 className="text-sm font-bold text-white">Visibility Score Trend</h2>
                            {visibility.length > 0 && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: visMom >= 0 ? "rgba(0,200,83,0.12)" : "rgba(255,61,61,0.12)", color: visMom >= 0 ? "#00C853" : "#FF3D3D" }}>
                                    {visLabel} pts
                                </span>
                            )}
                        </div>
                        {/* Date range selector */}
                        <div className="flex rounded-lg overflow-hidden border text-[11px] font-bold" style={{ borderColor: "#1E2940" }}>
                            {([7, 30, 90] as const).map((d) => (
                                <button key={d} onClick={() => setDays(d)}
                                    className="px-2.5 py-1 transition"
                                    style={{ background: days === d ? "rgba(123,92,245,0.15)" : "transparent", color: days === d ? "#7B5CF5" : "#4A5568" }}>
                                    {d}d
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="h-[180px] flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                        </div>
                    ) : visibility.length === 0 ? (
                        <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-xs" style={{ color: "#4A5568" }}>
                            <p>No visibility data yet.</p>
                            <p className="text-[11px]">Add keywords and run a rank update to see your score.</p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={visibility} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="visGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7B5CF5" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7B5CF5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1E2940" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: "#4A5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#4A5568", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "#0D1424", border: "1px solid #1E2940", borderRadius: 8, fontSize: 12 }} />
                                <Area type="monotone" dataKey="visibility" stroke="#7B5CF5" strokeWidth={2.5} fill="url(#visGrad)" dot={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Winners / Losers */}
                <div className="grid grid-rows-2 gap-4">
                    {/* Winners */}
                    <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(0,200,83,0.05)", borderColor: "rgba(0,200,83,0.18)" }}>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition" onClick={() => setWinnersExpanded((v) => !v)}>
                            <div className="flex items-center gap-2">
                                <TrendingUp size={16} style={{ color: "#00C853" }} />
                                <div className="text-left">
                                    <p className="text-xl font-black" style={{ color: "#00C853" }}>{winners.length}</p>
                                    <p className="text-xs font-semibold text-white">Winners</p>
                                </div>
                            </div>
                            {winners.length > 0 && <ChevronRight size={13} style={{ color: "#4A5568", transform: winnersExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
                        </button>
                        <AnimatePresence>
                            {winnersExpanded && winners.length > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                    <div className="border-t px-3 pb-3 pt-2 space-y-1" style={{ borderColor: "rgba(0,200,83,0.18)" }}>
                                        {winners.map((w, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs rounded px-2 py-1.5" style={{ background: "rgba(0,200,83,0.05)" }}>
                                                <span className="truncate max-w-[110px]" style={{ color: "#E2E8F0" }}>{w.keyword}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="font-bold" style={{ color: "#8B9BB4" }}>#{w.position}</span>
                                                    <span className="font-bold" style={{ color: "#00C853" }}>+{w.change}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Losers */}
                    <div className="rounded-xl border overflow-hidden" style={{ background: "rgba(255,61,61,0.05)", borderColor: "rgba(255,61,61,0.18)" }}>
                        <button className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition" onClick={() => setLosersExpanded((v) => !v)}>
                            <div className="flex items-center gap-2">
                                <TrendingDown size={16} style={{ color: "#FF3D3D" }} />
                                <div className="text-left">
                                    <p className="text-xl font-black" style={{ color: "#FF3D3D" }}>{losers.length}</p>
                                    <p className="text-xs font-semibold text-white">Losers</p>
                                </div>
                            </div>
                            {losers.length > 0 && <ChevronRight size={13} style={{ color: "#4A5568", transform: losersExpanded ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />}
                        </button>
                        <AnimatePresence>
                            {losersExpanded && losers.length > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                                    <div className="border-t px-3 pb-3 pt-2 space-y-1" style={{ borderColor: "rgba(255,61,61,0.18)" }}>
                                        {losers.map((l, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs rounded px-2 py-1.5" style={{ background: "rgba(255,61,61,0.05)" }}>
                                                <span className="truncate max-w-[110px]" style={{ color: "#E2E8F0" }}>{l.keyword}</span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="font-bold" style={{ color: "#8B9BB4" }}>#{l.position}</span>
                                                    <span className="font-bold" style={{ color: "#FF3D3D" }}>{l.change}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* ── Keyword Table ─────────────────────────────────────────────── */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                    <h2 className="text-sm font-bold text-white">Tracked Keywords</h2>
                    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#1E2940" }}>
                        {(["desktop", "mobile"] as const).map((d) => (
                            <button key={d} onClick={() => setDevice(d)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition"
                                style={{ background: device === d ? "rgba(255,100,45,0.15)" : "transparent", color: device === d ? "#FF642D" : "#8B9BB4" }}>
                                {d === "desktop" ? <Monitor size={11} /> : <Smartphone size={11} />} {d}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="px-5 py-10 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                    </div>
                ) : sorted.length === 0 ? (
                    <div className="px-5 py-10 text-center space-y-3">
                        <p className="text-sm font-semibold text-white">
                            {keywords.length === 0 ? "No keywords tracked yet" : `No ${device} keywords`}
                        </p>
                        <p className="text-xs" style={{ color: "#4A5568" }}>
                            {keywords.length === 0
                                ? "Click \"Track Keyword\" or bulk import to start monitoring your Google rankings."
                                : `Switch to the other device tab or add ${device} keywords.`}
                        </p>
                        {keywords.length === 0 && (
                            <button onClick={() => setModalOpen(true)} disabled={!domain}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-40"
                                style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                                <Plus size={12} /> Track Your First Keyword
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto" ref={menuRef}>
                        <table className="w-full text-[13px]">
                            <thead>
                                <tr style={{ background: "#0D1424" }}>
                                    {/* Keyword */}
                                    <th className={thClass} style={{ color: sortKey === "keyword" ? "#FF642D" : "#4A5568" }} onClick={() => handleSort("keyword")}>
                                        Keyword <SortIcon col="keyword" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    {/* Vol */}
                                    <th className={thClass} style={{ color: sortKey === "volume" ? "#FF642D" : "#4A5568" }} onClick={() => handleSort("volume")}>
                                        Vol <SortIcon col="volume" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    {/* Position */}
                                    <th className={thClass} style={{ color: sortKey === "position" ? "#FF642D" : "#4A5568" }} onClick={() => handleSort("position")}>
                                        Position <SortIcon col="position" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    {/* Change */}
                                    <th className={thClass} style={{ color: sortKey === "change" ? "#FF642D" : "#4A5568" }} onClick={() => handleSort("change")}>
                                        Change <SortIcon col="change" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    {/* Est. Traffic */}
                                    <th className={thClass} style={{ color: sortKey === "traffic" ? "#FF642D" : "#4A5568" }} onClick={() => handleSort("traffic")}>
                                        Est. Traffic <SortIcon col="traffic" sortKey={sortKey} sortDir={sortDir} />
                                    </th>
                                    {/* URL */}
                                    <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>URL</th>
                                    {/* Actions */}
                                    <th className="px-4 py-3 w-10" />
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.map((kw, i) => {
                                    const traffic = estTraffic(kw.position, kw.volume);
                                    const kwAlertCount = alerts.filter((a) => a.keyword_id === kw.id).length;
                                    return (
                                        <motion.tr
                                            key={kw.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: deletingId === kw.id ? 0.4 : 1 }}
                                            transition={{ delay: i * 0.03 }}
                                            className="border-b hover:bg-white/[0.025] transition cursor-pointer group"
                                            style={{ borderColor: "#1E2940" }}
                                            onClick={() => setHistoryKw(kw)}
                                        >
                                            {/* Keyword */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white group-hover:text-orange-300 transition">{kw.keyword}</span>
                                                    {kwAlertCount > 0 && (
                                                        <span title={`${kwAlertCount} alert(s) set`}>
                                                            <Bell size={11} style={{ color: "#FF642D" }} />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] mt-0.5" style={{ color: "#4A5568" }}>
                                                    {kw.country} · {kw.device}
                                                </p>
                                            </td>
                                            {/* Vol */}
                                            <td className="px-4 py-3.5" style={{ color: "#8B9BB4" }}>
                                                {kw.volume != null ? kw.volume.toLocaleString() : "—"}
                                            </td>
                                            {/* Position */}
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center justify-center font-bold text-xs px-2 py-0.5 rounded ${posClass(kw.position)} ${posBg(kw.position)}`}>
                                                    {kw.position != null ? `#${kw.position}` : "—"}
                                                </span>
                                            </td>
                                            {/* Change */}
                                            <td className="px-4 py-3.5">
                                                <span className="flex items-center gap-1 font-bold text-xs"
                                                    style={{ color: (kw.change ?? 0) > 0 ? "#00C853" : (kw.change ?? 0) < 0 ? "#FF3D3D" : "#4A5568" }}>
                                                    {(kw.change ?? 0) > 0 ? <TrendingUp size={11} /> : (kw.change ?? 0) < 0 ? <TrendingDown size={11} /> : null}
                                                    {kw.change == null || kw.change === 0 ? "—" : `${kw.change > 0 ? "+" : ""}${kw.change}`}
                                                </span>
                                            </td>
                                            {/* Est. Traffic */}
                                            <td className="px-4 py-3.5 text-xs" style={{ color: traffic != null ? "#8B9BB4" : "#4A5568" }}>
                                                {traffic != null ? `~${traffic.toLocaleString()}` : "—"}
                                            </td>
                                            {/* URL */}
                                            <td className="px-4 py-3.5 font-mono text-[11px] max-w-[160px]">
                                                <span className="truncate block hover:underline" style={{ color: "#FF642D" }}>
                                                    {kw.ranked_url ?? kw.target_url ?? "—"}
                                                </span>
                                            </td>
                                            {/* Context menu */}
                                            <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setOpenMenu(openMenu === kw.id ? null : kw.id)}
                                                        className="p-1.5 rounded-lg hover:bg-white/5 transition opacity-0 group-hover:opacity-100"
                                                        style={{ color: "#8B9BB4" }}
                                                    >
                                                        <MoreVertical size={13} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {openMenu === kw.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                transition={{ duration: 0.1 }}
                                                                className="absolute right-0 top-8 z-30 w-44 rounded-xl border shadow-xl overflow-hidden"
                                                                style={{ background: "#151B27", borderColor: "#1E2940" }}
                                                            >
                                                                <button
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-white/5 transition text-left"
                                                                    style={{ color: "#E2E8F0" }}
                                                                    onClick={() => { setHistoryKw(kw); setOpenMenu(null); }}
                                                                >
                                                                    <Activity size={12} /> View History
                                                                </button>
                                                                <button
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-white/5 transition text-left"
                                                                    style={{ color: "#E2E8F0" }}
                                                                    onClick={() => { setAlertKw(kw); setOpenMenu(null); }}
                                                                >
                                                                    <Bell size={12} /> Set Alert
                                                                    {kwAlertCount > 0 && <span className="ml-auto text-[10px] font-bold" style={{ color: "#FF642D" }}>{kwAlertCount}</span>}
                                                                </button>
                                                                <div className="border-t" style={{ borderColor: "#1E2940" }} />
                                                                <button
                                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-red-500/10 transition text-left"
                                                                    style={{ color: "#FF3D3D" }}
                                                                    onClick={() => handleDelete(kw.id)}
                                                                >
                                                                    <Trash2 size={12} /> Remove
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {sorted.length > 0 && (
                    <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "#1E2940" }}>
                        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>
                            {sorted.length} keyword{sorted.length !== 1 ? "s" : ""} · {device}
                        </span>
                        <span className="text-[11px]" style={{ color: "#4A5568" }}>
                            Click any row to view history
                        </span>
                    </div>
                )}
            </div>

            {/* ── Competitor Tracking ───────────────────────────────────────── */}
            {domain && <CompetitorPanel domain={domain} />}

            {/* ── Modals & Panels ───────────────────────────────────────────── */}
            {domain && (
                <TrackKeywordModal
                    domain={domain}
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onAdded={(newKw) => {
                        setKeywords((prev) => [...prev, newKw]);
                        if (planInfo) setPlanInfo({ ...planInfo, keywordsUsed: planInfo.keywordsUsed + 1 });
                        setModalOpen(false);
                    }}
                />
            )}

            {domain && planInfo && (
                <BulkImportModal
                    domain={domain}
                    open={bulkOpen}
                    onClose={() => setBulkOpen(false)}
                    onAdded={(newKws) => {
                        setKeywords((prev) => {
                            const ids = new Set(prev.map((k) => k.id));
                            const fresh = newKws.filter((k) => !ids.has(k.id));
                            return [...prev, ...fresh];
                        });
                        if (planInfo) setPlanInfo({ ...planInfo, keywordsUsed: planInfo.keywordsUsed + newKws.length });
                    }}
                    keywordsUsed={planInfo.keywordsUsed}
                    keywordCap={planInfo.keywordCap}
                />
            )}

            {historyKw && (
                <KeywordHistoryPanel
                    keyword={historyKw}
                    onClose={() => setHistoryKw(null)}
                />
            )}

            {alertKw && domain && (
                <AlertModal
                    keyword={alertKw}
                    domain={domain}
                    existingAlerts={alerts}
                    onSaved={(updated) => setAlerts(updated)}
                    onClose={() => setAlertKw(null)}
                />
            )}
        </div>
    );
}
