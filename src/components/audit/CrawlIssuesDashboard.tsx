"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Globe,
    AlertCircle,
    AlertTriangle,
    Info,
    TrendingDown,
} from "lucide-react";

export interface CrawlPageIssue {
    id: string;
    code: string;
    title: string;
    severity: "critical" | "high" | "medium" | "low" | string;
    category?: string;
    description?: string;
    suggestedFix?: string;
    howToFix?: string[];
}

export interface CrawlPageLog {
    url: string;
    score: number;
    issuesFound: number;
    issues?: CrawlPageIssue[];
}

const SEV_CONFIG: Record<string, { color: string; bg: string; border: string; icon: typeof AlertCircle }> = {
    critical: { color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", icon: AlertCircle },
    high: { color: "#f97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.3)", icon: AlertTriangle },
    medium: { color: "#6366f1", bg: "rgba(99,102,241,0.07)", border: "rgba(99,102,241,0.25)", icon: Info },
    low: { color: "#10b981", bg: "rgba(16,185,129,0.07)", border: "rgba(16,185,129,0.2)", icon: Info },
};

function getScoreColor(score: number): string {
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f97316";
    return "#ef4444";
}

function ScoreBadge({ score }: { score: number }) {
    const color = getScoreColor(score);
    return (
        <span
            className="flex h-6 min-w-[36px] items-center justify-center rounded-full px-2 text-[11px] font-bold tabular-nums"
            style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}
        >
            {score}
        </span>
    );
}

function IssueSeverityDots({ issues }: { issues: CrawlPageIssue[] }) {
    const counts = {
        critical: issues.filter((i) => i.severity === "critical").length,
        high: issues.filter((i) => i.severity === "high").length,
        medium: issues.filter((i) => i.severity === "medium").length,
        low: issues.filter((i) => i.severity === "low").length,
    };

    return (
        <div className="flex items-center gap-1.5">
            {counts.critical > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#ef4444]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" /> {counts.critical}
                </span>
            )}
            {counts.high > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#f97316]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" /> {counts.high}
                </span>
            )}
            {counts.medium > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#6366f1]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#6366f1]" /> {counts.medium}
                </span>
            )}
            {counts.critical === 0 && counts.high === 0 && counts.medium === 0 && issues.length > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#10b981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" /> {issues.length}
                </span>
            )}
        </div>
    );
}

function InlineIssueRow({ issue }: { issue: CrawlPageIssue }) {
    const [expanded, setExpanded] = useState(false);
    const cfg = SEV_CONFIG[issue.severity] ?? SEV_CONFIG.low;
    const Icon = cfg.icon;

    const steps: string[] = Array.isArray(issue.howToFix) && issue.howToFix.length > 0
        ? issue.howToFix
        : issue.suggestedFix
            ? issue.suggestedFix.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
            : ["Review this issue in your CMS or code.", "Apply the recommended fix and re-audit."];

    return (
        <div
            className="overflow-hidden rounded-lg transition-all duration-200"
            style={{
                background: expanded ? cfg.bg : "rgba(255,255,255,0.02)",
                borderLeft: `2px solid ${cfg.color}`,
                border: `1px solid ${expanded ? cfg.border : "rgba(255,255,255,0.05)"}`,
                borderLeftColor: cfg.color,
                borderLeftWidth: 2,
            }}
        >
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
            >
                <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: cfg.color }} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span
                            className="rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase"
                            style={{ background: cfg.bg, color: cfg.color }}
                        >
                            {issue.category ?? issue.code.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                            {issue.title}
                        </span>
                    </div>
                    {!expanded && issue.description && (
                        <p className="mt-0.5 text-[11px] text-[var(--text-muted)] line-clamp-1">{issue.description}</p>
                    )}
                </div>
                <ChevronDown
                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)] transition-transform"
                    style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-white/[0.04] px-3 pb-3 pt-2.5">
                            {issue.description && (
                                <p className="mb-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                                    {issue.description}
                                </p>
                            )}
                            <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                                How to Fix
                            </p>
                            <ol className="space-y-1.5">
                                {steps.map((step, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-[var(--text-secondary)]">
                                        <span
                                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                                            style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="leading-snug">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PageRow({ log, index }: { log: CrawlPageLog; index: number }) {
    const [expanded, setExpanded] = useState(false);
    const issues = log.issues ?? [];

    // Sort issues: critical → high → medium → low
    const ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...issues].sort((a, b) => (ORDER[a.severity] ?? 5) - (ORDER[b.severity] ?? 5));

    const shortUrl = log.url.replace(/^https?:\/\//, "").slice(0, 55) + (log.url.replace(/^https?:\/\//, "").length > 55 ? "…" : "");

    return (
        <motion.div
            key={log.url}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className="overflow-hidden rounded-xl border transition-all duration-200"
            style={{
                borderColor: expanded ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                background: expanded ? "rgba(255,255,255,0.025)" : "transparent",
            }}
        >
            {/* Page header row */}
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
                <Globe className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                <span className="flex-1 min-w-0 font-mono text-xs text-[var(--text-secondary)] truncate">
                    {shortUrl}
                </span>
                <div className="flex shrink-0 items-center gap-3">
                    <ScoreBadge score={log.score} />
                    {issues.length > 0 ? (
                        <IssueSeverityDots issues={issues} />
                    ) : (
                        <span className="text-[10px] text-[var(--text-muted)]">{log.issuesFound} issues</span>
                    )}
                    <ChevronDown
                        className="h-4 w-4 text-[var(--text-muted)] transition-transform"
                        style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    />
                </div>
            </button>

            {/* Expanded: per-issue breakdown */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-white/[0.05] px-4 pb-4 pt-3 space-y-2">
                            {sorted.length > 0 ? (
                                sorted.map((issue) => (
                                    <InlineIssueRow key={issue.id} issue={issue} />
                                ))
                            ) : (
                                <p className="text-center text-xs text-[var(--text-muted)] py-3">
                                    No detailed issue data — re-crawl to get per-issue breakdown.
                                </p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface CrawlIssuesDashboardProps {
    logs: CrawlPageLog[];
}

export function CrawlIssuesDashboard({ logs }: CrawlIssuesDashboardProps) {
    const stats = useMemo(() => {
        const totalIssues = logs.reduce((acc, l) => acc + l.issuesFound, 0);
        const worstScore = logs.length > 0 ? Math.min(...logs.map((l) => l.score)) : 0;
        const criticalCount = logs.reduce(
            (acc, l) => acc + (l.issues?.filter((i) => i.severity === "critical" || i.severity === "high").length ?? 0),
            0
        );
        return { totalIssues, worstScore, criticalCount };
    }, [logs]);

    // Sort pages: worst score first
    const sorted = useMemo(() => [...logs].sort((a, b) => a.score - b.score), [logs]);

    if (logs.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0e1120] overflow-hidden"
        >
            {/* ── Summary header ── */}
            <div className="grid grid-cols-3 border-b border-white/[0.06]">
                <div className="flex flex-col items-center border-r border-white/[0.06] px-4 py-4 text-center">
                    <span className="text-2xl font-bold tabular-nums text-white">{logs.length}</span>
                    <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">Pages crawled</span>
                </div>
                <div className="flex flex-col items-center border-r border-white/[0.06] px-4 py-4 text-center">
                    <span className="text-2xl font-bold tabular-nums"
                        style={{ color: stats.totalIssues > 0 ? "#f97316" : "#10b981" }}>
                        {stats.totalIssues}
                    </span>
                    <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">Total issues</span>
                </div>
                <div className="flex flex-col items-center px-4 py-4 text-center">
                    <span className="text-2xl font-bold tabular-nums" style={{ color: getScoreColor(stats.worstScore) }}>
                        {stats.worstScore}
                    </span>
                    <span className="mt-0.5 text-[11px] text-[var(--text-muted)]">Worst score</span>
                </div>
            </div>

            {/* ── Red alert strip if critical issues found ── */}
            {stats.criticalCount > 0 && (
                <div className="flex items-center gap-2 border-b border-[#ef4444]/20 bg-[#ef4444]/08 px-5 py-2.5">
                    <TrendingDown className="h-4 w-4 shrink-0 text-[#ef4444]" />
                    <p className="text-xs font-semibold text-[#ef4444]">
                        {stats.criticalCount} critical/high issue{stats.criticalCount !== 1 ? "s" : ""} found — fix these first to protect your rankings.
                    </p>
                </div>
            )}

            {/* ── Column headers ── */}
            <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-white/[0.04] px-4 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Page URL</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Score · Issues</span>
            </div>

            {/* ── Page rows ── */}
            <div className="space-y-1.5 p-2">
                {sorted.map((log, i) => (
                    <PageRow key={log.url} log={log} index={i} />
                ))}
            </div>

            <div className="border-t border-white/[0.04] px-5 py-3">
                <p className="text-[11px] text-[var(--text-muted)]">
                    Click any page to see its SEO issues with exact fix steps · sorted by worst score first
                </p>
            </div>
        </motion.div>
    );
}
