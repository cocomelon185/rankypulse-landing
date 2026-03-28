"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, CheckCircle, ChevronRight, AlertTriangle,
    XCircle, AlertCircle, ExternalLink, Check, X, Loader2,
    ChevronDown, Copy, Target, Shield, Sparkles, Globe, Lock, TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { ScoreRevealModal } from "@/components/action-center/ScoreRevealModal";
import type { FixedTaskSummary } from "@/components/action-center/ScoreRevealModal";

// ── Enriched Task interface (matches API v5 response) ────────────────────────

interface Task {
    id: string;
    issueId: string;
    title: string;
    description: string;
    category: string;
    severity: "error" | "warning" | "notice";
    effort: "easy" | "medium" | "hard";
    effortMinutes: number;
    estimatedPoints: number;
    affectedPages: number;
    affectedPageUrls: string[];
    actionHref: string;
    status: "todo" | "in_progress" | "done";
    progress: number;
    fixSteps: string[];
    exampleFix: string | null;
    templateSnippet: string | null;
    ctrImpact: string | null;
    trafficGain: string | null;
}

interface ApiResponse {
    tasks: Task[];
    domain: string | null;
    allDomains: string[];
    seoScore: number;
    projectedScore: number;
    currentProjected: number;
    totalPoints: number;
    earnedPoints: number;
}

// ── Config constants ─────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
    error:   { label: "Critical", color: "#FF3D3D", bg: "rgba(255,61,61,0.12)",   icon: XCircle },
    warning: { label: "Warning",  color: "#FF9800", bg: "rgba(255,152,0,0.12)",   icon: AlertTriangle },
    notice:  { label: "Notice",   color: "#00B0FF", bg: "rgba(0,176,255,0.12)",   icon: AlertCircle },
};

const EFFORT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
    easy:   { label: "Easy fix",      bg: "rgba(0,200,83,0.12)",  color: "#00C853" },
    medium: { label: "Medium effort", bg: "rgba(255,152,0,0.12)", color: "#FF9800" },
    hard:   { label: "Complex fix",   bg: "rgba(255,61,61,0.12)", color: "#FF3D3D" },
};

const CATEGORY_TABS = [
    { key: "all",         label: "All" },
    { key: "Content",     label: "Content" },
    { key: "Technical",   label: "Technical" },
    { key: "Links",       label: "Links" },
    { key: "Performance", label: "Performance" },
];

const STATUS_FILTERS = [
    { key: "all",  label: "All Tasks" },
    { key: "todo", label: "To Do" },
    { key: "done", label: "Done" },
];

const GROUP_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    error:   { label: "CRITICAL",  color: "#FF3D3D", bg: "rgba(255,61,61,0.06)" },
    warning: { label: "WARNING",   color: "#FF9800", bg: "rgba(255,152,0,0.06)" },
    notice:  { label: "NOTICE",    color: "#00B0FF", bg: "rgba(0,176,255,0.06)" },
};

// ── Score Ring (SVG circular progress) ────────────────────────────────────────

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? "#00C853" : score >= 60 ? "#FF9800" : "#FF3D3D";

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius}
                    stroke="#1E2940" strokeWidth={strokeWidth} fill="none" />
                <motion.circle cx={size / 2} cy={size / 2} r={radius}
                    stroke={color} strokeWidth={strokeWidth} fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{ strokeDasharray: circumference }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-white tabular-nums">{score}</span>
                <span className="text-[9px] font-medium" style={{ color: "#6B7A99" }}>/ 100</span>
            </div>
        </div>
    );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, color, sublabel }: {
    icon: React.ElementType; label: string; value: string; color: string; sublabel?: string;
}) {
    return (
        <div className="rounded-xl border p-4" style={{ background: "#151B27", borderColor: "#1E2940" }}>
            <div className="flex items-start justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${color}18` }}>
                    <Icon size={15} style={{ color }} />
                </div>
            </div>
            <p className="text-xl font-black text-white tabular-nums">{value}</p>
            <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#6B7A99" }}>{label}</p>
            {sublabel && <p className="text-[10px] mt-0.5" style={{ color: "#4A5568" }}>{sublabel}</p>}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function ActionCenterClient() {
    const router = useRouter();

    // Data state
    const [tasks, setTasks] = useState<Task[]>([]);
    const [domain, setDomain] = useState<string | null>(null);
    const [allDomains, setAllDomains] = useState<string[]>([]);
    const [seoScore, setSeoScore] = useState(0);
    const [projectedScore, setProjectedScore] = useState(0);
    const [currentProjected, setCurrentProjected] = useState(0);
    const [showReveal, setShowReveal] = useState(false);
    const [userPlan, setUserPlan] = useState<"free" | "starter" | "pro">("free");

    // UI state
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [saving, setSaving] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [showAllUrls, setShowAllUrls] = useState(false);

    // AI Fix state
    const [aiFixState, setAiFixState] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [aiFixText, setAiFixText] = useState<string>("");
    const [aiFixCopied, setAiFixCopied] = useState(false);
    const [aiFixTrace, setAiFixTrace] = useState(0);
    const [aiFixTab, setAiFixTab] = useState<"code" | "why" | "steps">("code");
    const [aiFixStructured, setAiFixStructured] = useState<{
        analysis: string; code: string; steps: string;
        verification: string; scoreImpact: string; suggestion: string;
    } | null>(null);
    const [aiFixModelLabel, setAiFixModelLabel] = useState<string>("");
    const [aiFixHasLiveHtml, setAiFixHasLiveHtml] = useState(false);
    const [aiFixPagesAnalyzed, setAiFixPagesAnalyzed] = useState(0);

    // Verify Fix state
    const [verifyState, setVerifyState] = useState<"idle" | "loading" | "resolved" | "not_resolved" | "partial" | "unable_to_verify" | "error">("idle");
    const [verifyDetails, setVerifyDetails] = useState<{ url: string; resolved: boolean; detail: string; status?: string }[]>([]);

    // Reset AI fix state when selected task changes
    useEffect(() => {
        setAiFixState("idle");
        setAiFixText("");
        setAiFixCopied(false);
        setAiFixTrace(0);
        setAiFixTab("code");
        setAiFixStructured(null);
        setAiFixModelLabel("");
        setAiFixHasLiveHtml(false);
        setAiFixPagesAnalyzed(0);
        setVerifyState("idle");
        setVerifyDetails([]);
    }, [selectedTask]);

    // ── Generate AI fix ──────────────────────────────────────────────────────

    const AI_TRACE_STEPS = [
        "🔍 Fetching live page HTML to study the issue…",
        "📊 Analyzing real crawl data for affected pages…",
        "🧠 Claude is studying your page structure…",
        "🧪 Generating a verified, page-specific fix…",
    ];

    const generateAiFix = async (task: Task, force = false) => {
        if (!domain) return;
        setAiFixState("loading");
        setAiFixTrace(0);
        setAiFixStructured(null);

        // Cycle through trace steps while loading
        let step = 0;
        const traceInterval = setInterval(() => {
            step = Math.min(step + 1, AI_TRACE_STEPS.length - 1);
            setAiFixTrace(step);
        }, 1500);

        try {
            const res = await fetch("/api/action-center/ai-fix", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    issueId: task.issueId,
                    domain,
                    affectedPageUrls: task.affectedPageUrls,
                    title: task.title,
                    force,
                }),
            });
            clearInterval(traceInterval);
            if (!res.ok) throw new Error("ai_unavailable");
            const data = await res.json() as {
                suggestion: string; analysis?: string; code?: string;
                steps?: string; verification?: string; scoreImpact?: string;
                cached: boolean; modelLabel?: string; hasLiveHtml?: boolean; pagesAnalyzed?: number;
            };
            setAiFixText(data.suggestion);
            setAiFixModelLabel(data.modelLabel ?? "Claude");
            setAiFixHasLiveHtml(data.hasLiveHtml ?? false);
            setAiFixPagesAnalyzed(data.pagesAnalyzed ?? 0);
            if (data.code) {
                setAiFixStructured({
                    analysis:     data.analysis ?? "",
                    code:         data.code ?? "",
                    steps:        data.steps ?? "",
                    verification: data.verification ?? "",
                    scoreImpact:  data.scoreImpact ?? "",
                    suggestion:   data.suggestion,
                });
                setAiFixTab("code");
            }
            setAiFixState("done");
        } catch {
            clearInterval(traceInterval);
            setAiFixState("error");
        }
    };

    const copyAiFix = async () => {
        const textToCopy = aiFixStructured?.code || aiFixText;
        await navigator.clipboard.writeText(textToCopy);
        setAiFixCopied(true);
        setTimeout(() => setAiFixCopied(false), 2000);
    };

    // ── Fetch tasks ──────────────────────────────────────────────────────────

    const fetchTasks = useCallback(async (targetDomain?: string) => {
        setLoading(true);
        try {
            const url = targetDomain
                ? `/api/action-center/tasks?domain=${encodeURIComponent(targetDomain)}`
                : "/api/action-center/tasks";
            const res = await fetch(url);
            if (!res.ok) throw new Error();
            const data: ApiResponse = await res.json();
            setTasks(data.tasks);
            setDomain(data.domain);
            setAllDomains(data.allDomains);
            setSeoScore(data.seoScore);
            setProjectedScore(data.projectedScore);
            setCurrentProjected(data.currentProjected ?? data.seoScore);
        } catch {
            setTasks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    // Fetch user plan from server (authoritative — not localStorage)
    useEffect(() => {
        fetch("/api/user/plan")
            .then(r => r.ok ? r.json() : { plan: "free" })
            .then((data: { plan: string }) => {
                setUserPlan((data.plan ?? "free") as "free" | "starter" | "pro");
            })
            .catch(() => {}); // default stays "free"
    }, []);

    // ── Persist task toggle ──────────────────────────────────────────────────

    const verifyFix = async (task: Task) => {
        setVerifyState("loading");
        setVerifyDetails([]);
        try {
            const res = await fetch("/api/action-center/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    issueId: task.issueId,
                    affectedPageUrls: task.affectedPageUrls.slice(0, 3),
                }),
            });
            if (!res.ok) throw new Error("Verification failed");
            const data = await res.json();
            if (data.unable_to_verify) {
                setVerifyState("unable_to_verify");
            } else if (data.resolved) {
                setVerifyState("resolved");
            } else if (data.partial) {
                setVerifyState("partial");
            } else {
                setVerifyState("not_resolved");
            }
            setVerifyDetails(data.results ?? []);
        } catch {
            setVerifyState("error");
        }
    };

    const toggleDone = async (task: Task) => {
        if (!domain) return;
        const newStatus = task.status === "done" ? "todo" : "done";
        setSaving(task.id);

        // Optimistic update — adjust currentProjected based on density-proportional estimatedPoints
        setTasks(prev => prev.map(t =>
            t.id === task.id ? { ...t, status: newStatus as "todo" | "done", progress: newStatus === "done" ? 100 : 0 } : t
        ));
        setCurrentProjected(prev => {
            const delta = task.estimatedPoints;
            return newStatus === "done"
                ? Math.min(projectedScore, prev + delta)
                : Math.max(seoScore, prev - delta);
        });

        try {
            await fetch("/api/action-center/complete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issueId: task.issueId, domain, status: newStatus }),
            });
        } catch {
            // Revert on failure
            setTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, status: task.status, progress: task.progress } : t
            ));
        } finally {
            setSaving(null);
        }
    };

    // ── Copy to clipboard ────────────────────────────────────────────────────

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ── Domain change ────────────────────────────────────────────────────────

    const handleDomainChange = (newDomain: string) => {
        setDomain(newDomain);
        setSelectedTask(null);
        fetchTasks(newDomain);
    };

    // ── Filtering ────────────────────────────────────────────────────────────

    const filtered = tasks.filter(t => {
        if (statusFilter !== "all" && t.status !== statusFilter) return false;
        if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
        return true;
    });

    // Group by severity
    const errorTasks = filtered.filter(t => t.severity === "error");
    const warningTasks = filtered.filter(t => t.severity === "warning");
    const noticeTasks = filtered.filter(t => t.severity === "notice");
    const groups: [string, Task[]][] = [
        ["error", errorTasks],
        ["warning", warningTasks],
        ["notice", noticeTasks],
    ].filter(([, g]) => (g as Task[]).length > 0) as [string, Task[]][];

    // Computed stats
    const doneTasks = tasks.filter(t => t.status === "done").length;
    const criticalRemaining = tasks.filter(t => t.severity === "error" && t.status !== "done").length;
    const quickWins = tasks.filter(t => t.effort === "easy" && t.status !== "done").length;
    const progressPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    // Live score: uses server-computed currentProjected (density-based, same formula as Site Audit)
    const liveScore = doneTasks > 0 ? currentProjected : seoScore;

    // Real remaining improvement (never exceeds projectedScore − liveScore)
    const pointsToUnlock = Math.max(0, projectedScore - liveScore);

    // Summary of fixed tasks for the ScoreRevealModal
    const fixedTaskSummaries: FixedTaskSummary[] = tasks
        .filter(t => t.status === "done")
        .map(t => ({ issueId: t.issueId, title: t.title, estimatedPoints: t.estimatedPoints, severity: t.severity }));

    const selectedTaskData = tasks.find(t => t.id === selectedTask);

    const toggleGroup = (group: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(group)) next.delete(group); else next.add(group);
            return next;
        });
    };

    // ── Loading skeleton ─────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="animate-spin" style={{ color: "#FF642D" }} />
            </div>
        );
    }

    // ── RENDER ───────────────────────────────────────────────────────────────

    return (
        <div className="space-y-5">

            {/* ═══ Header + Domain Selector ═══ */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,100,45,0.12)" }}>
                        <Zap size={18} style={{ color: "#FF642D" }} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-tight">Action Center</h1>
                        <p className="text-[12px]" style={{ color: "#6B7A99" }}>
                            {domain ? `Prioritized fixes for ${domain}` : "Prioritized fixes to boost your SEO score"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Domain selector */}
                    {allDomains.length > 1 && (
                        <div className="relative">
                            <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B7A99" }} />
                            <select
                                value={domain ?? ""}
                                onChange={(e) => handleDomainChange(e.target.value)}
                                className="appearance-none text-xs font-semibold pl-8 pr-7 py-2 rounded-lg border bg-transparent cursor-pointer focus:outline-none focus:ring-1"
                                style={{ color: "#C8D0E0", borderColor: "#1E2940", background: "#151B27" }}>
                                {allDomains.map(d => (
                                    <option key={d} value={d} style={{ background: "#151B27" }}>{d}</option>
                                ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B7A99" }} />
                        </div>
                    )}
                    {domain && (
                        <button onClick={() => router.push(`/app/audit/${domain}`)}
                            className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg border transition hover:bg-white/[0.04]"
                            style={{ color: "#FF642D", borderColor: "#1E2940" }}>
                            <ExternalLink size={12} /> View Audit
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ Command Bar: Score + KPI Cards ═══ */}
            {tasks.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Score Ring Card */}
                    <div className="col-span-2 lg:col-span-1 rounded-xl border p-4 flex flex-col items-center justify-center relative overflow-hidden"
                        style={{
                            background: "#151B27",
                            borderColor: doneTasks > 0 ? "rgba(0,200,83,0.3)" : "#1E2940",
                            boxShadow: doneTasks > 0 ? "0 0 0 1px rgba(0,200,83,0.15)" : "none",
                        }}>
                        {/* Live score ring (animated to liveScore when tasks are done) */}
                        <ScoreRing score={liveScore} size={80} />
                        <p className="text-[11px] font-medium mt-2" style={{ color: "#6B7A99" }}>
                            {doneTasks > 0 ? "Live Score" : "SEO Score"}
                        </p>
                        {doneTasks > 0 && liveScore > seoScore && (
                            <p className="text-[10px] font-bold mt-0.5" style={{ color: "#00C853" }}>
                                +{liveScore - seoScore} pts gained
                            </p>
                        )}
                        {/* See Score Boost CTA */}
                        {doneTasks > 0 && (
                            <button
                                onClick={() => setShowReveal(true)}
                                className="mt-2.5 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition hover:opacity-90"
                                style={{ background: "rgba(0,200,83,0.12)", color: "#00C853", border: "1px solid rgba(0,200,83,0.2)" }}
                            >
                                <TrendingUp size={11} />
                                See Score Boost
                            </button>
                        )}
                    </div>

                    {/* KPI Cards */}
                    <KpiCard icon={XCircle} label="Critical Issues" value={String(criticalRemaining)} color="#FF3D3D" sublabel="Needs immediate fix" />
                    <KpiCard icon={Sparkles} label="Quick Wins" value={String(quickWins)} color="#00C853" sublabel="Easy fixes available" />
                    <KpiCard icon={Target} label="Score Potential" value={`+${pointsToUnlock}`} color="#FF642D" sublabel="Points if all fixed" />

                    {/* Progress Card */}
                    <div className="rounded-xl border p-4" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                style={{ background: "rgba(123,92,245,0.1)" }}>
                                <Shield size={15} style={{ color: "#7B5CF5" }} />
                            </div>
                            <span className="text-[11px] font-bold tabular-nums" style={{ color: "#7B5CF5" }}>{progressPct}%</span>
                        </div>
                        <p className="text-xl font-black text-white tabular-nums">{doneTasks}/{tasks.length}</p>
                        <p className="text-[11px] mt-0.5 font-medium" style={{ color: "#6B7A99" }}>Tasks Complete</p>
                        <p className="text-[10px] mt-0.5" style={{ color: "#4A5568" }}>Fixed vs total issues</p>
                        <div className="h-1.5 rounded-full overflow-hidden mt-2" style={{ background: "#1E2940" }}>
                            <motion.div className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, #7B5CF5, #9B7DFF)" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }} />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Empty State ═══ */}
            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed gap-5"
                    style={{ borderColor: "#1E2940" }}>
                    <CheckCircle size={40} style={{ color: "#00C853" }} />
                    <div className="text-center max-w-md">
                        <p className="text-lg font-bold text-white mb-2">Your SEO task list starts here</p>
                        <p className="text-sm mb-6" style={{ color: "#6B7A99" }}>
                            The Action Center turns your site audit into a prioritized fix list — each task shows exactly what to fix, why it matters, and how to do it.
                        </p>
                        {/* 2-step guide */}
                        <div className="flex gap-4 text-left mb-6">
                            {[
                                { n: "①", title: "Run a Site Audit", desc: "Crawl any domain to detect SEO issues, broken links, and missing metadata." },
                                { n: "②", title: "Get your fix list", desc: "Come back here — tasks appear with severity, effort estimate, and step-by-step fix instructions." },
                            ].map(({ n, title, desc }) => (
                                <div key={n} className="flex-1 rounded-xl p-4" style={{ background: "rgba(255,100,45,0.05)", border: "1px solid rgba(255,100,45,0.1)" }}>
                                    <p className="text-lg font-black mb-1" style={{ color: "#FF642D" }}>{n}</p>
                                    <p className="text-xs font-bold text-white mb-1">{title}</p>
                                    <p className="text-[11px] leading-relaxed" style={{ color: "#6B7A99" }}>{desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs mb-4" style={{ color: "#4A5568" }}>
                            Your SEO Score improves as you complete tasks — track your progress toward 100.
                        </p>
                    </div>
                    <button onClick={() => router.push("/app/audit")}
                        className="px-6 py-2.5 rounded-lg text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                        Start Audit →
                    </button>
                </div>
            )}

            {tasks.length > 0 && (
                <>
                    {/* ═══ Filter Row: Categories + Status ═══ */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* Category tabs */}
                        <div className="flex items-center gap-1.5">
                            {CATEGORY_TABS.map(tab => {
                                const count = tab.key === "all"
                                    ? tasks.length
                                    : tasks.filter(t => t.category === tab.key).length;
                                if (tab.key !== "all" && count === 0) return null;
                                return (
                                    <button key={tab.key}
                                        onClick={() => setCategoryFilter(tab.key)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                        style={{
                                            background: categoryFilter === tab.key ? "rgba(255,100,45,0.15)" : "rgba(255,255,255,0.03)",
                                            color: categoryFilter === tab.key ? "#FF642D" : "#8B9BB4",
                                            border: `1px solid ${categoryFilter === tab.key ? "rgba(255,100,45,0.3)" : "#1E2940"}`,
                                        }}>
                                        {tab.label}{count > 0 ? ` (${count})` : ""}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Status filters */}
                        <div className="flex items-center gap-1.5">
                            {STATUS_FILTERS.map(f => (
                                <button key={f.key}
                                    onClick={() => setStatusFilter(f.key)}
                                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition"
                                    style={{
                                        background: statusFilter === f.key ? "rgba(123,92,245,0.12)" : "transparent",
                                        color: statusFilter === f.key ? "#7B5CF5" : "#4A5568",
                                        border: `1px solid ${statusFilter === f.key ? "rgba(123,92,245,0.25)" : "transparent"}`,
                                    }}>
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ═══ 2-Column: Task List + Detail Panel ═══ */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                        {/* ── Task List (left) ── */}
                        <div className={selectedTask ? "xl:col-span-2" : "xl:col-span-5"}>
                            <div className="space-y-3">
                                {groups.map(([severity, groupTasks]) => {
                                    const cfg = GROUP_CONFIG[severity];
                                    const groupPts = groupTasks.reduce((s, t) => s + t.estimatedPoints, 0);
                                    const isCollapsed = collapsedGroups.has(severity);

                                    return (
                                        <div key={severity} className="rounded-xl border overflow-hidden"
                                            style={{ background: "#151B27", borderColor: "#1E2940" }}>
                                            {/* Group header */}
                                            <button onClick={() => toggleGroup(severity)}
                                                className="w-full flex items-center justify-between px-4 py-2.5 transition hover:bg-white/[0.02]"
                                                style={{ background: cfg.bg }}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                                                    <span className="text-[10px] font-bold tracking-widest uppercase"
                                                        style={{ color: cfg.color }}>
                                                        {cfg.label} ({groupTasks.length})
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-semibold" style={{ color: "#4A5568" }}>
                                                        +{groupPts} pts
                                                    </span>
                                                    <ChevronDown size={13}
                                                        className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                                                        style={{ color: "#4A5568" }} />
                                                </div>
                                            </button>

                                            {/* Group tasks */}
                                            <AnimatePresence initial={false}>
                                                {!isCollapsed && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}>
                                                        {groupTasks.map((task) => {
                                                            const sevCfg = SEVERITY_CONFIG[task.severity];
                                                            const SevIcon = sevCfg.icon;
                                                            const effortCfg = EFFORT_CONFIG[task.effort];
                                                            const isSelected = selectedTask === task.id;
                                                            const isDone = task.status === "done";
                                                            const isSaving = saving === task.id;

                                                            return (
                                                                <div key={task.id}
                                                                    className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition border-t hover:bg-white/[0.02] ${isSelected ? "bg-white/[0.04]" : ""}`}
                                                                    style={{ borderColor: "#1E2940" }}
                                                                    onClick={() => setSelectedTask(isSelected ? null : task.id)}>
                                                                    {/* Status toggle */}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); toggleDone(task); }}
                                                                        disabled={isSaving}
                                                                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition hover:border-[#00C853]"
                                                                        style={{
                                                                            borderColor: isDone ? "#00C853" : "#2E4166",
                                                                            background: isDone ? "rgba(0,200,83,0.15)" : "transparent",
                                                                        }}>
                                                                        {isSaving ? (
                                                                            <Loader2 size={9} className="animate-spin" style={{ color: "#6B7A99" }} />
                                                                        ) : isDone ? (
                                                                            <Check size={10} style={{ color: "#00C853" }} />
                                                                        ) : null}
                                                                    </button>

                                                                    {/* Severity icon */}
                                                                    <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                                        style={{ background: sevCfg.bg }}>
                                                                        <SevIcon size={13} style={{ color: sevCfg.color }} />
                                                                    </div>

                                                                    {/* Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2">
                                                                            <p className={`text-[13px] font-semibold truncate ${isDone ? "line-through opacity-40" : "text-white"}`}>
                                                                                {task.title}
                                                                            </p>
                                                                            {task.effort === "easy" && !isDone && (
                                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                                                                    style={{ background: "rgba(0,200,83,0.12)", color: "#00C853" }}>
                                                                                    ⚡ Quick
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                                                                                style={{ background: "rgba(255,255,255,0.04)", color: "#6B7A99" }}>
                                                                                {task.category}
                                                                            </span>
                                                                            <span className="text-[10px] font-semibold" style={{ color: "#FF642D" }}>
                                                                                +{task.estimatedPoints} pts
                                                                            </span>
                                                                            <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold"
                                                                                style={{ background: effortCfg.bg, color: effortCfg.color }}>
                                                                                {effortCfg.label}
                                                                            </span>
                                                                            <span className="text-[10px]" style={{ color: "#4A5568" }}>
                                                                                {task.affectedPages} page{task.affectedPages !== 1 ? "s" : ""}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    <ChevronRight size={13}
                                                                        className={`shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`}
                                                                        style={{ color: "#2E4166" }} />
                                                                </div>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}

                                {/* No results for filter */}
                                {filtered.length === 0 && tasks.length > 0 && (
                                    <div className="flex flex-col items-center py-12 text-center">
                                        <p className="text-sm font-semibold text-white mb-1">No matching tasks</p>
                                        <p className="text-xs" style={{ color: "#6B7A99" }}>Try adjusting your filters</p>
                                    </div>
                                )}

                                {/* ── Upgrade CTA for free plan ── */}
                                {userPlan === "free" && tasks.length > 0 && (
                                    <div
                                        className="rounded-xl border p-5 flex items-center gap-4"
                                        style={{ background: "rgba(255,100,45,0.06)", borderColor: "rgba(255,100,45,0.2)" }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ background: "rgba(255,100,45,0.12)" }}
                                        >
                                            <Lock size={18} style={{ color: "#FF642D" }} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-white">
                                                You&apos;re on the free plan — crawling up to 50 pages
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: "#6B7A99" }}>
                                                Starter crawls 100 pages and Pro crawls 1,000. You may be missing critical issues on deeper pages.
                                            </p>
                                        </div>
                                        <Link
                                            href="/pricing"
                                            className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white whitespace-nowrap transition hover:opacity-90"
                                            style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}
                                        >
                                            Upgrade →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Detail Panel (right, sticky) ── */}
                        <AnimatePresence>
                            {selectedTask && selectedTaskData && (
                                <motion.div
                                    key="detail"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="xl:col-span-3 rounded-xl border overflow-hidden xl:sticky xl:top-20 xl:self-start"
                                    style={{ background: "#151B27", borderColor: "#1E2940" }}>

                                    {/* Panel header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "#1E2940" }}>
                                        <h3 className="text-sm font-bold text-white">Fix Details</h3>
                                        <button onClick={() => setSelectedTask(null)}
                                            className="p-1 rounded transition hover:bg-white/[0.06]"
                                            style={{ color: "#4A5568" }}>
                                            <X size={15} />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">

                                        {/* Title + Badges */}
                                        <div>
                                            <p className="text-base font-bold text-white mb-2.5">{selectedTaskData.title}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                                                    style={{ background: SEVERITY_CONFIG[selectedTaskData.severity].bg, color: SEVERITY_CONFIG[selectedTaskData.severity].color }}>
                                                    {SEVERITY_CONFIG[selectedTaskData.severity].label}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: EFFORT_CONFIG[selectedTaskData.effort].bg, color: EFFORT_CONFIG[selectedTaskData.effort].color }}>
                                                    {EFFORT_CONFIG[selectedTaskData.effort].label} · ~{selectedTaskData.effortMinutes}min
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(255,100,45,0.12)", color: "#FF642D" }}>
                                                    +{selectedTaskData.estimatedPoints} pts
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(123,92,245,0.12)", color: "#7B5CF5" }}>
                                                    {selectedTaskData.affectedPages} page{selectedTaskData.affectedPages !== 1 ? "s" : ""}
                                                </span>
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                    style={{ background: "rgba(255,255,255,0.04)", color: "#6B7A99" }}>
                                                    {selectedTaskData.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* WHY IT MATTERS */}
                                        <div className="rounded-lg p-4" style={{ background: "rgba(255,152,0,0.05)", border: "1px solid rgba(255,152,0,0.12)" }}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF9800" }}>
                                                Why It Matters
                                            </p>
                                            <p className="text-[13px] leading-relaxed" style={{ color: "#C8D0E0" }}>
                                                {selectedTaskData.description}
                                            </p>
                                            {selectedTaskData.ctrImpact && (
                                                <div className="flex items-start gap-2 mt-2.5 pt-2.5" style={{ borderTop: "1px solid rgba(255,152,0,0.1)" }}>
                                                    <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: "#FF9800" }} />
                                                    <p className="text-[12px]" style={{ color: "#C8D0E0" }}>
                                                        <strong style={{ color: "#FF9800" }}>CTR Impact:</strong> {selectedTaskData.ctrImpact}
                                                    </p>
                                                </div>
                                            )}
                                            {selectedTaskData.trafficGain && (
                                                <div className="flex items-start gap-2 mt-1.5">
                                                    <Sparkles size={12} className="shrink-0 mt-0.5" style={{ color: "#00C853" }} />
                                                    <p className="text-[12px]" style={{ color: "#C8D0E0" }}>
                                                        <strong style={{ color: "#00C853" }}>Traffic Gain:</strong> {selectedTaskData.trafficGain}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* FIX GUIDE */}
                                        {selectedTaskData.fixSteps.length > 0 && (
                                            <div className="rounded-lg p-4" style={{ background: "rgba(0,200,83,0.04)", border: "1px solid rgba(0,200,83,0.12)" }}>
                                                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: "#00C853" }}>
                                                    Fix Guide
                                                </p>
                                                <ol className="space-y-2">
                                                    {selectedTaskData.fixSteps.map((step, i) => (
                                                        <li key={i} className="flex gap-2.5">
                                                            <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                                                                style={{ background: "rgba(0,200,83,0.15)", color: "#00C853" }}>
                                                                {i + 1}
                                                            </span>
                                                            <p className="text-[12px] leading-relaxed pt-0.5" style={{ color: "#C8D0E0" }}>
                                                                {step}
                                                            </p>
                                                        </li>
                                                    ))}
                                                </ol>

                                                {/* Code example */}
                                                {selectedTaskData.exampleFix && (
                                                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(0,200,83,0.1)" }}>
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B7A99" }}>Example</p>
                                                            <button onClick={() => copyText(selectedTaskData.exampleFix!)}
                                                                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded transition hover:bg-white/[0.06]"
                                                                style={{ color: copied ? "#00C853" : "#6B7A99" }}>
                                                                {copied ? <Check size={10} /> : <Copy size={10} />}
                                                                {copied ? "Copied!" : "Copy"}
                                                            </button>
                                                        </div>
                                                        <pre className="text-[11px] p-3 rounded-lg overflow-x-auto font-mono whitespace-pre-wrap"
                                                            style={{ background: "#0D1424", color: "#8B9BB4", border: "1px solid #1E2940" }}>
                                                            {selectedTaskData.exampleFix}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* AFFECTED PAGES */}
                                        {selectedTaskData.affectedPageUrls.length > 0 && (
                                            <div className="rounded-lg p-4" style={{ background: "rgba(123,92,245,0.04)", border: "1px solid rgba(123,92,245,0.12)" }}>
                                                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#7B5CF5" }}>
                                                    Affected Pages
                                                </p>
                                                <div className="space-y-1">
                                                    {(showAllUrls ? selectedTaskData.affectedPageUrls : selectedTaskData.affectedPageUrls.slice(0, 3)).map((url, i) => (
                                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-[11px] py-1 px-2 rounded transition hover:bg-white/[0.04] group"
                                                            style={{ color: "#8B9BB4" }}>
                                                            <ExternalLink size={10} className="shrink-0 opacity-50 group-hover:opacity-100" />
                                                            <span className="truncate">{url.replace(/^https?:\/\/(www\.)?/, "")}</span>
                                                        </a>
                                                    ))}
                                                </div>
                                                {selectedTaskData.affectedPageUrls.length > 3 && (
                                                    <button onClick={() => setShowAllUrls(!showAllUrls)}
                                                        className="text-[10px] font-semibold mt-2 transition"
                                                        style={{ color: "#7B5CF5" }}>
                                                        {showAllUrls
                                                            ? "Show less"
                                                            : `+${selectedTaskData.affectedPageUrls.length - 3} more`}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* ESTIMATED IMPACT */}
                                        <div className="rounded-lg p-4" style={{ background: "rgba(255,100,45,0.04)", border: "1px solid rgba(255,100,45,0.12)" }}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF642D" }}>
                                                Estimated Impact
                                            </p>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-[12px]" style={{ color: "#C8D0E0" }}>
                                                        Fixing this across{" "}
                                                        <strong className="text-white">{selectedTaskData.affectedPages} page{selectedTaskData.affectedPages !== 1 ? "s" : ""}</strong>{" "}
                                                        could improve your score by{" "}
                                                        <strong style={{ color: "#FF642D" }}>+{selectedTaskData.estimatedPoints} points</strong>.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI SUGGESTED FIX */}
                                        <div className="rounded-lg p-4" style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.15)" }}>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles size={13} style={{ color: "#7C3AED" }} />
                                                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                                                        AI Suggested Fix
                                                    </p>
                                                </div>
                                                {aiFixState === "idle" && (
                                                    <button
                                                        onClick={() => generateAiFix(selectedTaskData)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
                                                        style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}
                                                    >
                                                        <Sparkles size={11} />
                                                        Generate Fix
                                                    </button>
                                                )}
                                                {aiFixState === "done" && (
                                                    <button
                                                        onClick={() => generateAiFix(selectedTaskData, true)}
                                                        className="flex items-center gap-1.5 text-[10px] font-medium transition-opacity hover:opacity-70"
                                                        style={{ color: "#8B9BB4" }}
                                                    >
                                                        ↺ Regenerate
                                                    </button>
                                                )}
                                            </div>

                                            {/* Loading — Surgical Suite trace */}
                                            {aiFixState === "loading" && (
                                                <div className="py-3 space-y-2">
                                                    {AI_TRACE_STEPS.map((step, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className="flex items-center gap-2"
                                                            initial={{ opacity: 0, x: -6 }}
                                                            animate={{ opacity: i <= aiFixTrace ? 1 : 0.25, x: 0 }}
                                                            transition={{ duration: 0.4, delay: i * 0.05 }}
                                                        >
                                                            {i < aiFixTrace ? (
                                                                <Check size={10} style={{ color: "#22C55E", flexShrink: 0 }} />
                                                            ) : i === aiFixTrace ? (
                                                                <motion.div
                                                                    className="h-2 w-2 rounded-full flex-shrink-0"
                                                                    style={{ background: "#7C3AED" }}
                                                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                                                    transition={{ duration: 0.8, repeat: Infinity }}
                                                                />
                                                            ) : (
                                                                <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: "#1E2940" }} />
                                                            )}
                                                            <span className="text-[11px]" style={{ color: i <= aiFixTrace ? "#C8D0E0" : "#4A5568" }}>
                                                                {step}
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Result — Structured Surgical Suite tabs */}
                                            {aiFixState === "done" && aiFixStructured?.code ? (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {/* Score Impact Banner */}
                                                    {aiFixStructured.scoreImpact && (() => {
                                                        const raw = aiFixStructured.scoreImpact;
                                                        const ptsMatch = raw.match(/^([+\-\d\s\w]+points?)/i);
                                                        const pts = ptsMatch ? ptsMatch[1].trim() : raw.split("—")[0].trim();
                                                        const reason = raw.includes("—") ? raw.split("—").slice(1).join("—").trim() : "";
                                                        return (
                                                            <div className="flex items-center gap-2 mb-3 rounded-lg px-3 py-2" style={{ background: "rgba(255,100,45,0.08)", border: "1px solid rgba(255,100,45,0.2)" }}>
                                                                <span className="text-[13px] font-bold shrink-0" style={{ color: "#FF642D" }}>{pts}</span>
                                                                {reason && <span className="text-[11px] leading-snug" style={{ color: "#8A9BB0" }}>— {reason}</span>}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* Tabs */}
                                                    <div className="flex gap-0.5 mb-3 rounded-lg p-0.5" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #1E2940" }}>
                                                        {([
                                                            { id: "code", label: "Code", icon: "⌥" },
                                                            { id: "why",  label: "Why It Matters", icon: "◎" },
                                                            { id: "steps", label: "Steps", icon: "☰" },
                                                        ] as const).map(({ id, label, icon }) => (
                                                            <button
                                                                key={id}
                                                                onClick={() => setAiFixTab(id)}
                                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-semibold transition-all"
                                                                style={aiFixTab === id
                                                                    ? { background: "rgba(139,92,246,0.25)", color: "#C4B5FD" }
                                                                    : { color: "#4A5568" }
                                                                }
                                                            >
                                                                <span>{icon}</span>{label}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Tab: Code */}
                                                    {aiFixTab === "code" && (
                                                        <div>
                                                            <div className="rounded-lg overflow-hidden mb-2" style={{ border: "1px solid #30363D" }}>
                                                                <div className="flex items-center justify-between px-3 py-1.5" style={{ background: "#161B22", borderBottom: "1px solid #30363D" }}>
                                                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#4A5568" }}>Code Fix</span>
                                                                    <button
                                                                        onClick={copyAiFix}
                                                                        className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-all"
                                                                        style={aiFixCopied
                                                                            ? { background: "rgba(34,197,94,0.12)", color: "#22C55E" }
                                                                            : { background: "rgba(139,92,246,0.1)", color: "#A78BFA" }
                                                                        }
                                                                    >
                                                                        {aiFixCopied ? <Check size={10} /> : <Copy size={10} />}
                                                                        {aiFixCopied ? "Copied!" : "Copy"}
                                                                    </button>
                                                                </div>
                                                                <pre className="p-3 text-[11px] leading-relaxed overflow-x-auto font-mono m-0" style={{ background: "#0D1117", color: "#E6EDF3" }}>
                                                                    <code>
                                                                        {aiFixStructured.code.split("\n").map((line, i) => {
                                                                            const isComment = line.trim().startsWith("#") || line.trim().startsWith("//") || line.trim().startsWith("<!--");
                                                                            return (
                                                                                <span key={i} style={isComment ? { color: "#6A8A6A", fontStyle: "italic" } : {}}>
                                                                                    {line}{"\n"}
                                                                                </span>
                                                                            );
                                                                        })}
                                                                    </code>
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tab: Why It Matters */}
                                                    {aiFixTab === "why" && (
                                                        <div className="space-y-3">
                                                            <div className="rounded-lg p-3" style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                                                                <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: "#6D5FA8" }}>SEO Analysis</p>
                                                                <p className="text-[12px] leading-relaxed" style={{ color: "#C8D0E0" }}>
                                                                    {aiFixStructured.analysis}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Tab: Implementation */}
                                                    {aiFixTab === "steps" && (
                                                        <div className="space-y-2">
                                                            {aiFixStructured.steps.split("\n").filter(s => s.trim()).map((step, i) => {
                                                                const cleaned = step.replace(/^\d+\.\s*/, "").trim();
                                                                const stepNum = step.match(/^(\d+)\./)?.[1];
                                                                return (
                                                                    <div key={i} className="flex items-start gap-2.5">
                                                                        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                                                                            style={{ background: "rgba(139,92,246,0.15)", color: "#A78BFA" }}>
                                                                            {stepNum ?? i + 1}
                                                                        </span>
                                                                        <p className="text-[12px] leading-relaxed" style={{ color: "#C8D0E0" }}>{cleaned}</p>
                                                                    </div>
                                                                );
                                                            })}
                                                            {aiFixStructured.verification && (
                                                                <div className="mt-3 rounded-lg overflow-hidden" style={{ border: "1px solid #1E2940" }}>
                                                                    <div className="px-3 py-1.5" style={{ background: "rgba(34,197,94,0.06)", borderBottom: "1px solid #1E2940" }}>
                                                                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "#22C55E" }}>✓ Verify the fix</p>
                                                                    </div>
                                                                    <div className="px-3 py-2" style={{ background: "rgba(0,0,0,0.3)" }}>
                                                                        <code className="text-[11px] font-mono break-all" style={{ color: "#22C55E" }}>
                                                                            {aiFixStructured.verification}
                                                                        </code>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <p className="text-[10px] mt-3" style={{ color: "#2D3748" }}>
                                                        Generated by {aiFixModelLabel || "Claude"}
                                                        {aiFixHasLiveHtml && " · Studied live HTML"}
                                                        {aiFixPagesAnalyzed > 0 && ` · Analyzed ${aiFixPagesAnalyzed} page${aiFixPagesAnalyzed > 1 ? "s" : ""}`}
                                                        {" · "}Apply fix, then click <strong style={{ color: "#818CF8" }}>Verify Fix</strong> to confirm it works
                                                    </p>
                                                </motion.div>
                                            ) : aiFixState === "done" && aiFixText ? (
                                                /* Fallback: plain text for old cached suggestions */
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <p className="text-[12px] leading-relaxed whitespace-pre-wrap mb-3" style={{ color: "#C8D0E0" }}>
                                                        {aiFixText}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px]" style={{ color: "#4A5568" }}>
                                                            {aiFixText.length} chars · generated by Claude
                                                        </span>
                                                        <button
                                                            onClick={copyAiFix}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                                                            style={aiFixCopied
                                                                ? { background: "rgba(34,197,94,0.12)", color: "#22C55E" }
                                                                : { background: "rgba(139,92,246,0.1)", color: "#A78BFA" }
                                                            }
                                                        >
                                                            {aiFixCopied ? <Check size={11} /> : <Copy size={11} />}
                                                            {aiFixCopied ? "Copied!" : "Copy Fix"}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : null}

                                            {/* Error */}
                                            {aiFixState === "error" && (
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] text-red-400">
                                                        AI unavailable — please try again.
                                                    </p>
                                                    <button
                                                        onClick={() => generateAiFix(selectedTaskData)}
                                                        className="text-[11px] px-3 py-1.5 rounded-lg transition"
                                                        style={{ background: "rgba(239,68,68,0.08)", color: "#F87171" }}
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            )}

                                            {/* Idle hint */}
                                            {aiFixState === "idle" && (
                                                <p className="text-[11px]" style={{ color: "#4A5568" }}>
                                                    Claude will study your live page HTML, analyze real crawl data, and generate a working fix using Sonnet or Opus.
                                                </p>
                                            )}
                                        </div>

                                        {/* VERIFY FIX RESULT */}
                                        {verifyState !== "idle" && (
                                            <div className="rounded-lg p-3 text-xs" style={{
                                                background: verifyState === "resolved" ? "rgba(0,200,83,0.08)"
                                                    : verifyState === "loading" ? "rgba(139,155,180,0.08)"
                                                    : verifyState === "unable_to_verify" ? "rgba(251,191,36,0.08)"
                                                    : "rgba(239,68,68,0.08)",
                                                border: `1px solid ${verifyState === "resolved" ? "#00C85333"
                                                    : verifyState === "loading" ? "#1E2940"
                                                    : verifyState === "unable_to_verify" ? "#FBBF2433"
                                                    : "#F8717133"}`,
                                            }}>
                                                {verifyState === "loading" && (
                                                    <div className="flex items-center gap-2" style={{ color: "#8B9BB4" }}>
                                                        <Loader2 size={13} className="animate-spin" />
                                                        Fetching live page and checking issue…
                                                    </div>
                                                )}
                                                {verifyState === "resolved" && (
                                                    <div>
                                                        <div className="flex items-center gap-2" style={{ color: "#00C853" }}>
                                                            <Check size={13} />
                                                            <span className="font-semibold">Issue resolved! ✓</span>
                                                        </div>
                                                        {verifyDetails.map((r, i) => (
                                                            <p key={i} style={{ color: "#66BB6A" }} className="ml-5 mt-0.5 truncate text-[11px]">
                                                                {r.detail}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {verifyState === "not_resolved" && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5" style={{ color: "#F87171" }}>
                                                            <X size={13} />
                                                            <span className="font-semibold">Issue still present</span>
                                                        </div>
                                                        {verifyDetails.map((r, i) => (
                                                            <p key={i} style={{ color: "#8B9BB4" }} className="ml-5 mt-0.5 truncate">
                                                                {r.url.replace(/^https?:\/\//, "")} — {r.detail}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {verifyState === "unable_to_verify" && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1" style={{ color: "#FBBF24" }}>
                                                            <AlertTriangle size={13} />
                                                            <span className="font-semibold">Requires full re-audit to verify</span>
                                                        </div>
                                                        <p className="ml-5 text-[11px]" style={{ color: "#8B9BB4" }}>
                                                            This issue involves multiple pages. Apply the fix, then run a new audit to confirm it worked.
                                                        </p>
                                                    </div>
                                                )}
                                                {verifyState === "partial" && (
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1.5" style={{ color: "#FBBF24" }}>
                                                            <AlertTriangle size={13} />
                                                            <span className="font-semibold">Partially resolved</span>
                                                        </div>
                                                        {verifyDetails.map((r, i) => (
                                                            <p key={i} className="ml-5 mt-0.5 truncate" style={{ color: r.resolved ? "#00C853" : "#F87171" }}>
                                                                {r.resolved ? "✓" : "✗"} {r.url.replace(/^https?:\/\//, "")} — {r.detail}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                {verifyState === "error" && (
                                                    <div className="flex items-center gap-2" style={{ color: "#F87171" }}>
                                                        <AlertCircle size={13} />
                                                        Verification failed — try again later
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ACTION BUTTONS */}
                                        <div className="flex gap-2.5 pt-1">
                                            <button onClick={() => verifyFix(selectedTaskData)}
                                                disabled={verifyState === "loading" || selectedTaskData.status === "done"}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-60"
                                                style={{
                                                    background: verifyState === "resolved"
                                                        ? "rgba(0,200,83,0.12)"
                                                        : verifyState === "unable_to_verify"
                                                            ? "rgba(251,191,36,0.1)"
                                                            : "rgba(99,102,241,0.1)",
                                                    color: verifyState === "resolved" ? "#00C853"
                                                        : verifyState === "unable_to_verify" ? "#FBBF24"
                                                        : "#818CF8",
                                                    border: `1px solid ${verifyState === "resolved" ? "#00C85333"
                                                        : verifyState === "unable_to_verify" ? "#FBBF2433"
                                                        : "#818CF833"}`,
                                                }}>
                                                {verifyState === "loading" ? (
                                                    <Loader2 size={13} className="animate-spin" />
                                                ) : verifyState === "resolved" ? (
                                                    <Check size={13} />
                                                ) : verifyState === "unable_to_verify" ? (
                                                    <AlertTriangle size={13} />
                                                ) : (
                                                    <Shield size={13} />
                                                )}
                                                {verifyState === "resolved" ? "Verified ✓"
                                                    : verifyState === "unable_to_verify" ? "Re-audit needed"
                                                    : "Verify Fix"}
                                            </button>
                                            <button onClick={() => toggleDone(selectedTaskData)}
                                                disabled={saving === selectedTaskData.id}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                                                style={{
                                                    background: selectedTaskData.status === "done"
                                                        ? "rgba(139,155,180,0.15)"
                                                        : "linear-gradient(135deg, #00C853, #00A846)",
                                                    color: selectedTaskData.status === "done" ? "#8B9BB4" : "#fff",
                                                }}>
                                                {saving === selectedTaskData.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <CheckCircle size={14} />
                                                )}
                                                {selectedTaskData.status === "done" ? "Undo — Mark as To Do" : "Mark as Fixed"}
                                            </button>
                                            <button onClick={() => router.push(selectedTaskData.actionHref)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:bg-white/[0.06]"
                                                style={{ color: "#8B9BB4", border: "1px solid #1E2940" }}>
                                                <ExternalLink size={13} /> Audit
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}

            {/* ═══ Score Reveal Modal ═══ */}
            <ScoreRevealModal
                isOpen={showReveal}
                onClose={() => setShowReveal(false)}
                oldScore={seoScore}
                newScore={liveScore}
                fixedTasks={fixedTaskSummaries}
                domain={domain ?? "your site"}
            />
        </div>
    );
}
