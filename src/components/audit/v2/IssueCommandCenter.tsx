"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Check,
    Copy,
    TrendingUp,
    AlertCircle,
    AlertTriangle,
    Info,
    Layers,
} from "lucide-react";
import type { AuditIssueData } from "@/lib/audit-data";
import { fireFixConfetti } from "@/lib/confetti";
import { toast } from "sonner";

type Severity = "all" | "critical" | "high" | "medium" | "low";

const SEVERITY_CONFIG = {
    critical: {
        label: "CRITICAL",
        color: "#ef4444",
        bg: "rgba(239,68,68,0.08)",
        border: "rgba(239,68,68,0.35)",
        glow: "0 0 0 2px rgba(239,68,68,0.4), 0 0 16px rgba(239,68,68,0.25)",
        badge: "bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30",
        leftBorder: "#ef4444",
        icon: AlertCircle,
        ring: "rgba(239,68,68,0.5)",
    },
    high: {
        label: "HIGH",
        color: "#f97316",
        bg: "rgba(249,115,22,0.06)",
        border: "rgba(249,115,22,0.3)",
        glow: "0 0 0 2px rgba(249,115,22,0.35), 0 0 14px rgba(249,115,22,0.2)",
        badge: "bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/30",
        leftBorder: "#f97316",
        icon: AlertTriangle,
        ring: "rgba(249,115,22,0.5)",
    },
    medium: {
        label: "MEDIUM",
        color: "#6366f1",
        bg: "rgba(99,102,241,0.05)",
        border: "rgba(99,102,241,0.25)",
        glow: "0 0 0 2px rgba(99,102,241,0.3)",
        badge: "bg-[#6366f1]/10 text-[#6366f1] border border-[#6366f1]/30",
        leftBorder: "#6366f1",
        icon: Info,
        ring: "rgba(99,102,241,0.4)",
    },
    low: {
        label: "LOW",
        color: "#10b981",
        bg: "rgba(16,185,129,0.05)",
        border: "rgba(16,185,129,0.2)",
        glow: "0 0 0 2px rgba(16,185,129,0.25)",
        badge: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30",
        leftBorder: "#10b981",
        icon: Info,
        ring: "rgba(16,185,129,0.3)",
    },
    opportunity: {
        label: "OPP",
        color: "#10b981",
        bg: "rgba(16,185,129,0.05)",
        border: "rgba(16,185,129,0.2)",
        glow: "",
        badge: "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30",
        leftBorder: "#10b981",
        icon: Info,
        ring: "rgba(16,185,129,0.3)",
    },
};

// Max traffic impact for normalization (used to draw relative bar widths)
const MAX_TRAFFIC = 600;

interface DiagnosticRowProps {
    issue: AuditIssueData;
    isExpanded: boolean;
    onToggle: () => void;
    onMarkFixed: (id: string) => void;
}

function DiagnosticRow({ issue, isExpanded, onToggle, onMarkFixed }: DiagnosticRowProps) {
    const [fixing, setFixing] = useState(false);
    const [copied, setCopied] = useState(false);

    const cfg =
        SEVERITY_CONFIG[issue.priority as keyof typeof SEVERITY_CONFIG] ??
        SEVERITY_CONFIG.low;

    const barWidth = Math.min(100, Math.round((issue.trafficImpact.max / MAX_TRAFFIC) * 100));

    const solutionPreview = issue.howToFix[0] ?? "Review and apply the fix steps below.";
    const shortProblem =
        issue.description.length > 80
            ? issue.description.slice(0, 78) + "…"
            : issue.description;

    function handleMarkFixed(e: React.MouseEvent<HTMLButtonElement>) {
        setFixing(true);
        fireFixConfetti(e.currentTarget);
        setTimeout(() => {
            onMarkFixed(issue.id);
            setFixing(false);
        }, 400);
    }

    function handleCopy() {
        const text = issue.howToFix.map((s, i) => `${i + 1}. ${s}`).join("\n");
        navigator.clipboard.writeText(text).then(
            () => { setCopied(true); toast.success("Fix steps copied!", { duration: 2000 }); setTimeout(() => setCopied(false), 2000); },
            () => toast.error("Could not copy")
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-xl border transition-all duration-200"
            style={{
                borderColor: isExpanded ? cfg.border : "rgba(255,255,255,0.07)",
                background: isExpanded ? cfg.bg : "transparent",
                borderLeftColor: cfg.leftBorder,
                borderLeftWidth: 3,
                boxShadow: isExpanded ? cfg.glow : "none",
            }}
        >
            {/* ─── Collapsed row ─────────────────────────────────────── */}
            <button
                type="button"
                onClick={onToggle}
                className="grid w-full items-center gap-3 px-4 py-3 text-left sm:grid-cols-[160px_1fr_1fr_80px_28px]"
            >
                {/* Col 1: Error code */}
                <div className="flex items-center gap-2">
                    <span
                        className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${cfg.badge}`}
                    >
                        {issue.category?.slice(0, 14) ?? "SEO"}
                    </span>
                </div>

                {/* Col 2: Problem */}
                <p className="text-left text-xs leading-snug text-[var(--text-secondary)] line-clamp-2">
                    {shortProblem}
                </p>

                {/* Col 3: Solution preview */}
                <p className="hidden text-left text-xs leading-snug text-[var(--text-muted)] line-clamp-2 sm:block">
                    → {solutionPreview}
                </p>

                {/* Col 4: Traffic impact bar */}
                <div className="hidden flex-col gap-1 sm:flex">
                    <span className="text-[9px] font-medium text-[var(--text-muted)]">
                        +{issue.trafficImpact.min}–{issue.trafficImpact.max}/mo
                    </span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${barWidth}%`,
                                background: `linear-gradient(90deg, ${cfg.leftBorder}cc, ${cfg.leftBorder})`,
                            }}
                        />
                    </div>
                </div>

                {/* Col 5: Chevron */}
                <ChevronDown
                    className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform duration-200"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {/* ─── Expanded fix panel ─────────────────────────────────── */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div
                            className="border-t px-4 pb-5 pt-4"
                            style={{ borderColor: cfg.border }}
                        >
                            {/* Full description */}
                            <p className="mb-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                                {issue.description}
                            </p>

                            {/* Fix steps */}
                            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                How to Fix — Step by Step
                            </p>
                            <ol className="space-y-2.5">
                                {issue.howToFix.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                                        <span
                                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                                            style={{
                                                background: cfg.bg,
                                                color: cfg.color,
                                                border: `1px solid ${cfg.border}`,
                                            }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="leading-snug">{step}</span>
                                    </li>
                                ))}
                            </ol>

                            {/* Affected pages */}
                            {issue.affectedPages && issue.affectedPages.length > 0 && (
                                <div className="mt-4">
                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                        Affected Pages ({issue.affectedPages.length})
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {issue.affectedPages.map((page) => (
                                            <span
                                                key={page}
                                                className="rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[11px] text-[var(--text-secondary)]"
                                            >
                                                {page}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="mt-5 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleMarkFixed}
                                    disabled={fixing}
                                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                                    style={{ background: cfg.color }}
                                >
                                    <Check className="h-3.5 w-3.5" />
                                    {fixing ? "Marking…" : "Mark as Fixed"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white/10"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    {copied ? "Copied!" : "Copy fix steps"}
                                </button>
                                {issue.learnMoreUrl && (
                                    <a
                                        href={issue.learnMoreUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white/10"
                                    >
                                        Learn more ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Glowing severity pill ──────────────────────────────────────────────────
function SeverityPill({
    severity,
    count,
    active,
    onClick,
}: {
    severity: Severity;
    count: number;
    active: boolean;
    onClick: () => void;
}) {
    if (severity === "all") {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`relative flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200 ${active
                        ? "bg-white/10 text-[var(--text-primary)] shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                    }`}
            >
                <Layers className="h-3.5 w-3.5" />
                All ({count})
            </button>
        );
    }

    const cfg = SEVERITY_CONFIG[severity as keyof typeof SEVERITY_CONFIG];
    const Icon = cfg.icon;

    return (
        <button
            type="button"
            onClick={onClick}
            className="relative flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-200"
            style={{
                background: active ? cfg.bg : "transparent",
                color: active ? cfg.color : "var(--text-muted)",
                border: active ? `1px solid ${cfg.border}` : "1px solid transparent",
                boxShadow: active && count > 0 ? cfg.glow : "none",
            }}
        >
            {/* Animated pulse ring for critical/high when active */}
            {active && count > 0 && (severity === "critical" || severity === "high") && (
                <span
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ background: cfg.color }}
                />
            )}
            <Icon className="relative h-3.5 w-3.5" />
            <span className="relative">{cfg.label}</span>
            <span
                className="relative flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
                style={{ background: count > 0 ? cfg.color : "rgba(255,255,255,0.1)", color: count > 0 ? "#fff" : "var(--text-muted)" }}
            >
                {count}
            </span>
        </button>
    );
}

// ─── Main Component ─────────────────────────────────────────────────────────
interface IssueCommandCenterProps {
    issues: AuditIssueData[];
    onMarkFixed: (id: string) => void;
}

export function IssueCommandCenter({ issues, onMarkFixed }: IssueCommandCenterProps) {
    const [filter, setFilter] = useState<Severity>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const counts = useMemo(() => ({
        all: issues.length,
        critical: issues.filter((i) => i.priority === "critical").length,
        high: issues.filter((i) => i.priority === "high").length,
        medium: issues.filter((i) => i.priority === "medium").length,
        low: issues.filter((i) => i.priority === "low" || i.priority === "opportunity").length,
    }), [issues]);

    const sorted = useMemo(() => {
        const ORDER = { critical: 0, high: 1, medium: 2, low: 3, opportunity: 4 };
        const filtered =
            filter === "all"
                ? issues
                : filter === "low"
                    ? issues.filter((i) => i.priority === "low" || i.priority === "opportunity")
                    : issues.filter((i) => i.priority === filter);
        return [...filtered].sort(
            (a, b) => (ORDER[a.priority] ?? 5) - (ORDER[b.priority] ?? 5)
        );
    }, [issues, filter]);

    function handleToggle(id: string) {
        setExpandedId((prev) => (prev === id ? null : id));
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-1 rounded-2xl border border-white/[0.06] bg-[var(--bg-elevated,#16192a)] overflow-hidden"
        >
            {/* ── Header ── */}
            <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                        Diagnostic View
                    </h3>
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                        {issues.length} issues · click any row for the exact fix
                    </p>
                </div>
                {/* Severity filter ribbon */}
                <div className="flex flex-wrap gap-1.5">
                    {(["all", "critical", "high", "medium", "low"] as Severity[]).map((s) => (
                        <SeverityPill
                            key={s}
                            severity={s}
                            count={counts[s]}
                            active={filter === s}
                            onClick={() => {
                                setFilter(s);
                                setExpandedId(null);
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Column headers (desktop) ── */}
            <div className="hidden grid-cols-[160px_1fr_1fr_80px_28px] gap-3 border-b border-white/[0.04] px-4 py-2 sm:grid">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Error Code</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">The Problem</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">The Solution</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Impact</span>
                <span />
            </div>

            {/* ── Issue rows ── */}
            <div className="space-y-1 p-2">
                <AnimatePresence mode="popLayout">
                    {sorted.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-12 text-center"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-success)]/10">
                                <Check className="h-6 w-6 text-[var(--accent-success)]" />
                            </div>
                            <p className="text-sm font-medium text-[var(--accent-success)]">All clear!</p>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                No {filter === "all" ? "" : filter} issues found
                            </p>
                        </motion.div>
                    ) : (
                        sorted.map((issue) => (
                            <DiagnosticRow
                                key={issue.id}
                                issue={issue}
                                isExpanded={expandedId === issue.id}
                                onToggle={() => handleToggle(issue.id)}
                                onMarkFixed={onMarkFixed}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* ── Footer summary bar ── */}
            <div className="flex items-center justify-between border-t border-white/[0.04] px-5 py-3">
                <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                    {counts.critical > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                            {counts.critical} critical
                        </span>
                    )}
                    {counts.high > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
                            {counts.high} high
                        </span>
                    )}
                    {counts.medium > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" />
                            {counts.medium} medium
                        </span>
                    )}
                </div>
                <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                    <TrendingUp className="h-3 w-3" />
                    Fix all → unlock more organic traffic
                </span>
            </div>
        </motion.div>
    );
}
