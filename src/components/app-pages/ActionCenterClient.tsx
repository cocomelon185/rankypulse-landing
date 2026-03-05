"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Filter, CheckCircle, Clock, Play, ChevronRight, AlertTriangle,
    XCircle, AlertCircle, TrendingUp, ExternalLink, Check, X,
} from "lucide-react";
import { MOCK_TASKS, MOCK_AUDIT_ISSUES, MOCK_PROJECTS } from "@/lib/mock-data";

interface Task {
    id: string;
    domain: string;
    issueId: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    impactScore: number;
    effort: string;
    category: string;
    severity: "error" | "warning" | "notice";
    progress: number;
    createdAt: string;
    updatedAt: string;
}

const STATUS_CONFIG = {
    todo: { label: "To Do", color: "#8B9BB4", bg: "rgba(139,155,180,0.12)" },
    in_progress: { label: "In Progress", color: "#FF9800", bg: "rgba(255,152,0,0.12)" },
    done: { label: "Done", color: "#00C853", bg: "rgba(0,200,83,0.12)" },
};

const SEVERITY_CONFIG = {
    error: { color: "#FF3D3D", bg: "rgba(255,61,61,0.12)", icon: XCircle },
    warning: { color: "#FF9800", bg: "rgba(255,152,0,0.12)", icon: AlertTriangle },
    notice: { color: "#00B0FF", bg: "rgba(0,176,255,0.12)", icon: AlertCircle },
};

export function ActionCenterClient() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS as Task[]);

    const filtered = statusFilter === "all" ? tasks : tasks.filter(t => t.status === statusFilter);
    const doneTasks = tasks.filter(t => t.status === "done").length;
    const progressPct = Math.round((doneTasks / tasks.length) * 100);
    const projectedGain = Math.round(doneTasks * 4.5);

    const selectedTaskData = tasks.find(t => t.id === selectedTask);
    const selectedIssue = selectedTaskData
        ? MOCK_AUDIT_ISSUES.find(i => i.id === selectedTaskData.issueId)
        : null;

    const markDone = (taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "done" as const, progress: 100 } : t));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <Zap size={22} style={{ color: "#FF642D" }} /> Action Center
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>
                        Prioritized fixes to boost your SEO score
                    </p>
                </div>
            </div>

            {/* Progress Banner */}
            <div className="rounded-xl border px-5 py-4 flex flex-wrap items-center gap-5 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(21,27,39,0.95), rgba(13,20,36,0.98))", borderColor: "#1E2940" }}>
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,100,45,0.3), transparent)" }} />
                <div className="flex items-center gap-4 flex-1">
                    <div>
                        <p className="text-lg font-black text-white">{doneTasks} / {tasks.length} tasks done</p>
                        <p className="text-[12px] mt-0.5" style={{ color: "#6B7A99" }}>
                            Projected SEO score improvement: <span className="font-bold" style={{ color: "#00C853" }}>+{projectedGain} pts</span>
                        </p>
                    </div>
                    <div className="flex-1 min-w-[120px]">
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1E2940" }}>
                            <motion.div className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, #FF642D, #E8541F)" }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct}%` }}
                                transition={{ duration: 1, ease: "easeOut" }} />
                        </div>
                        <p className="text-[11px] mt-1" style={{ color: "#6B7A99" }}>{progressPct}% complete</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
                <Filter size={13} style={{ color: "#4A5568" }} />
                {[
                    { key: "all", label: "All Tasks" },
                    { key: "todo", label: "To Do" },
                    { key: "in_progress", label: "In Progress" },
                    { key: "done", label: "Done" },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setStatusFilter(f.key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        style={{
                            background: statusFilter === f.key ? "rgba(255,100,45,0.15)" : "rgba(255,255,255,0.04)",
                            color: statusFilter === f.key ? "#FF642D" : "#8B9BB4",
                            border: `1px solid ${statusFilter === f.key ? "rgba(255,100,45,0.3)" : "#1E2940"}`,
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* 2-col: Task list + Detail drawer */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                {/* Task backlog */}
                <div className={selectedTask ? "xl:col-span-2" : "xl:col-span-5"}>
                    <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                        {filtered.map((task, i) => {
                            const statusCfg = STATUS_CONFIG[task.status];
                            const sevCfg = SEVERITY_CONFIG[task.severity];
                            const SevIcon = sevCfg.icon;
                            const isSelected = selectedTask === task.id;

                            return (
                                <div
                                    key={task.id}
                                    className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition border-b hover:bg-white/[0.02] ${isSelected ? "bg-white/[0.03]" : ""}`}
                                    style={{ borderColor: "#1E2940" }}
                                    onClick={() => setSelectedTask(isSelected ? null : task.id)}
                                >
                                    {/* Status bubble */}
                                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                                        style={{ borderColor: task.status === "done" ? "#00C853" : "#1E2940", background: task.status === "done" ? "rgba(0,200,83,0.1)" : "transparent" }}>
                                        {task.status === "done" && <Check size={11} style={{ color: "#00C853" }} />}
                                    </div>

                                    {/* Icon */}
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: sevCfg.bg }}>
                                        <SevIcon size={15} style={{ color: sevCfg.color }} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-semibold truncate ${task.status === "done" ? "line-through opacity-50" : "text-white"}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                                style={{ background: statusCfg.bg, color: statusCfg.color }}>
                                                {statusCfg.label}
                                            </span>
                                            <span className="text-[10px]" style={{ color: "#4A5568" }}>Impact {task.impactScore}/100</span>
                                            <span className="text-[10px]" style={{ color: "#4A5568" }}>{task.effort} effort</span>
                                        </div>
                                        {task.status === "in_progress" && (
                                            <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "#1E2940", width: 120 }}>
                                                <div className="h-full rounded-full" style={{ width: `${task.progress}%`, background: "#FF9800" }} />
                                            </div>
                                        )}
                                    </div>

                                    <ChevronRight size={14} style={{ color: "#4A5568" }} className={`transition-transform shrink-0 ${isSelected ? "rotate-180" : ""}`} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Task Detail Drawer */}
                <AnimatePresence>
                    {selectedTask && selectedTaskData && (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="xl:col-span-3 rounded-xl border overflow-hidden sticky top-20"
                            style={{ background: "#151B27", borderColor: "#1E2940" }}
                        >
                            {/* Drawer header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                                <h3 className="text-sm font-bold text-white">Fix Details</h3>
                                <button onClick={() => setSelectedTask(null)} className="p-1 rounded transition hover:bg-white/[0.06]" style={{ color: "#4A5568" }}>
                                    <X size={15} />
                                </button>
                            </div>

                            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Task title + badges */}
                                <div>
                                    <p className="text-base font-bold text-white mb-2">{selectedTaskData.title}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: `Impact: ${selectedTaskData.impactScore}/100`, color: "#FF642D", bg: "rgba(255,100,45,0.12)" },
                                            { label: `Effort: ${selectedTaskData.effort}`, color: "#8B9BB4", bg: "rgba(139,155,180,0.12)" },
                                            { label: selectedTaskData.category, color: "#7B5CF5", bg: "rgba(123,92,245,0.12)" },
                                        ].map(b => (
                                            <span key={b.label} className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: b.bg, color: b.color }}>
                                                {b.label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* What's wrong */}
                                <div className="rounded-lg p-4" style={{ background: "rgba(255,61,61,0.06)", border: "1px solid rgba(255,61,61,0.15)" }}>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF3D3D" }}>What's Wrong</p>
                                    <p className="text-[13px]" style={{ color: "#C8D0E0" }}>{selectedIssue?.description || "This issue impacts your site's search visibility."}</p>
                                </div>

                                {/* Why it matters */}
                                <div className="rounded-lg p-4" style={{ background: "rgba(255,152,0,0.06)", border: "1px solid rgba(255,152,0,0.15)" }}>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF9800" }}>Why It Matters</p>
                                    <p className="text-[13px]" style={{ color: "#C8D0E0" }}>
                                        Fixing this issue could improve your SEO score by <strong className="text-white">{Math.round(selectedTaskData.impactScore * 0.15)} points</strong> and
                                        increase organic traffic by an estimated <strong className="text-white">{Math.round(selectedTaskData.impactScore * 0.8)}%</strong>.
                                    </p>
                                </div>

                                {/* Before / After Preview */}
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4A5568" }}>Before / After Preview</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-lg p-3" style={{ background: "#0D1424", border: "1px solid rgba(255,61,61,0.2)" }}>
                                            <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#FF3D3D" }}>❌ Before</p>
                                            <p className="text-[11px] font-mono" style={{ color: "#8B9BB4" }}>No meta description</p>
                                        </div>
                                        <div className="rounded-lg p-3" style={{ background: "#0D1424", border: "1px solid rgba(0,200,83,0.2)" }}>
                                            <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#00C853" }}>✅ After</p>
                                            <p className="text-[11px] font-mono" style={{ color: "#C8D0E0" }}>Unique, 155-char keyword-rich description</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Fix steps */}
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "#4A5568" }}>How to Fix</p>
                                    <div className="space-y-2">
                                        {[
                                            "Identify all pages missing meta descriptions",
                                            `Write unique descriptions for each page (140–160 characters)`,
                                            "Include primary keyword naturally in each description",
                                            "Use action-oriented language to improve CTR",
                                            "Avoid duplicate descriptions across pages",
                                        ].map((step, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <span className="w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5"
                                                    style={{ background: "rgba(255,100,45,0.15)", color: "#FF642D" }}>{i + 1}</span>
                                                <p className="text-[12px]" style={{ color: "#C8D0E0" }}>{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Affected URLs */}
                                {selectedIssue?.affectedUrls && (
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#4A5568" }}>
                                            Affected URLs ({selectedIssue.affectedCount})
                                        </p>
                                        <div className="rounded-lg overflow-hidden" style={{ background: "#0D1424", border: "1px solid #1E2940" }}>
                                            {selectedIssue.affectedUrls.map(url => (
                                                <div key={url} className="flex items-center gap-2 px-3 py-2 border-b hover:bg-white/[0.02] transition"
                                                    style={{ borderColor: "#1E2940" }}>
                                                    <ExternalLink size={11} style={{ color: "#4A5568" }} />
                                                    <p className="text-[11px] font-mono truncate flex-1" style={{ color: "#FF642D" }}>{url}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => markDone(selectedTaskData.id)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition hover:opacity-90"
                                        style={{ background: "linear-gradient(135deg, #00C853, #00A846)" }}
                                        disabled={selectedTaskData.status === "done"}
                                    >
                                        <CheckCircle size={14} />
                                        {selectedTaskData.status === "done" ? "Completed ✓" : "Mark as Fixed"}
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:bg-white/[0.06]"
                                        style={{ color: "#8B9BB4", border: "1px solid #1E2940" }}>
                                        <Play size={13} /> Verify Fix
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
