"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Filter, CheckCircle, Clock, Play, ChevronRight, AlertTriangle,
    XCircle, AlertCircle, ExternalLink, Check, X, Loader2,
} from "lucide-react";

interface Task {
    id: string;
    title: string;
    description: string;
    severity: "error" | "warning" | "notice";
    effort: "easy" | "medium" | "hard";
    estimatedPoints: number;
    affectedPages: number;
    actionHref: string;
    status: "todo" | "in_progress" | "done";
    progress: number;
}

const STATUS_CONFIG = {
    todo:        { label: "To Do",       color: "#8B9BB4", bg: "rgba(139,155,180,0.12)" },
    in_progress: { label: "In Progress", color: "#FF9800", bg: "rgba(255,152,0,0.12)" },
    done:        { label: "Done",        color: "#00C853", bg: "rgba(0,200,83,0.12)" },
};

const SEVERITY_CONFIG = {
    error:   { color: "#FF3D3D", bg: "rgba(255,61,61,0.12)",   icon: XCircle },
    warning: { color: "#FF9800", bg: "rgba(255,152,0,0.12)",   icon: AlertTriangle },
    notice:  { color: "#00B0FF", bg: "rgba(0,176,255,0.12)",   icon: AlertCircle },
};

const EFFORT_LABELS = { easy: "Easy fix", medium: "Medium effort", hard: "Complex fix" };

export function ActionCenterClient() {
    const router = useRouter();
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedTask, setSelectedTask] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [domain, setDomain] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/action-center/tasks")
            .then(r => r.ok ? r.json() : { tasks: [], domain: null })
            .then(data => {
                setTasks(data.tasks ?? []);
                setDomain(data.domain ?? null);
            })
            .catch(() => setTasks([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = statusFilter === "all" ? tasks : tasks.filter(t => t.status === statusFilter);
    const doneTasks = tasks.filter(t => t.status === "done").length;
    const projectedGain = tasks
        .filter(t => t.status === "done")
        .reduce((sum, t) => sum + t.estimatedPoints, 0);
    const totalPossible = tasks.reduce((sum, t) => sum + t.estimatedPoints, 0);
    const progressPct = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

    const selectedTaskData = tasks.find(t => t.id === selectedTask);

    const markDone = (taskId: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "done" as const, progress: 100 } : t));
    };

    // ── Loading skeleton ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 size={28} className="animate-spin" style={{ color: "#FF642D" }} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                        <Zap size={22} style={{ color: "#FF642D" }} /> Action Center
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#6B7A99" }}>
                        {domain
                            ? `Prioritized fixes for ${domain}`
                            : "Prioritized fixes to boost your SEO score"}
                    </p>
                </div>
                {domain && (
                    <button
                        onClick={() => router.push(`/app/audit/${domain}`)}
                        className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg border transition hover:bg-white/[0.04]"
                        style={{ color: "#FF642D", borderColor: "#1E2940" }}>
                        <ExternalLink size={12} /> View Audit
                    </button>
                )}
            </div>

            {/* Progress Banner */}
            {tasks.length > 0 && (
                <div className="rounded-xl border px-5 py-4 flex flex-wrap items-center gap-5 relative overflow-hidden"
                    style={{ background: "linear-gradient(135deg, rgba(21,27,39,0.95), rgba(13,20,36,0.98))", borderColor: "#1E2940" }}>
                    <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,100,45,0.3), transparent)" }} />
                    <div className="flex items-center gap-4 flex-1">
                        <div>
                            <p className="text-lg font-black text-white">{doneTasks} / {tasks.length} tasks done</p>
                            <p className="text-[12px] mt-0.5" style={{ color: "#6B7A99" }}>
                                SEO score improvement unlocked:{" "}
                                <span className="font-bold" style={{ color: "#00C853" }}>+{projectedGain} pts</span>
                                {totalPossible > 0 && (
                                    <span style={{ color: "#4A5568" }}> of +{totalPossible} possible</span>
                                )}
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
            )}

            {/* Empty state */}
            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 rounded-xl border-2 border-dashed"
                    style={{ borderColor: "#1E2940" }}>
                    <CheckCircle size={40} className="mb-4" style={{ color: "#00C853" }} />
                    <p className="text-lg font-bold text-white mb-2">No tasks yet</p>
                    <p className="text-sm mb-5" style={{ color: "#6B7A99" }}>
                        Run a site audit to generate actionable SEO tasks
                    </p>
                    <button
                        onClick={() => router.push("/app/audit")}
                        className="px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                        style={{ background: "linear-gradient(135deg, #FF642D, #E8541F)" }}>
                        Start Audit →
                    </button>
                </div>
            )}

            {tasks.length > 0 && (
                <>
                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <Filter size={13} style={{ color: "#4A5568" }} />
                        {[
                            { key: "all",         label: "All Tasks" },
                            { key: "todo",        label: "To Do" },
                            { key: "in_progress", label: "In Progress" },
                            { key: "done",        label: "Done" },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                style={{
                                    background: statusFilter === f.key ? "rgba(255,100,45,0.15)" : "rgba(255,255,255,0.04)",
                                    color: statusFilter === f.key ? "#FF642D" : "#8B9BB4",
                                    border: `1px solid ${statusFilter === f.key ? "rgba(255,100,45,0.3)" : "#1E2940"}`,
                                }}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* 2-col: Task list + Detail drawer */}
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                        {/* Task list */}
                        <div className={selectedTask ? "xl:col-span-2" : "xl:col-span-5"}>
                            <div className="rounded-xl border overflow-hidden" style={{ background: "#151B27", borderColor: "#1E2940" }}>
                                {filtered.map((task) => {
                                    const statusCfg = STATUS_CONFIG[task.status];
                                    const sevCfg = SEVERITY_CONFIG[task.severity];
                                    const SevIcon = sevCfg.icon;
                                    const isSelected = selectedTask === task.id;

                                    return (
                                        <div
                                            key={task.id}
                                            className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition border-b hover:bg-white/[0.02] ${isSelected ? "bg-white/[0.03]" : ""}`}
                                            style={{ borderColor: "#1E2940" }}
                                            onClick={() => setSelectedTask(isSelected ? null : task.id)}>
                                            {/* Status bubble */}
                                            <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                                                style={{ borderColor: task.status === "done" ? "#00C853" : "#1E2940", background: task.status === "done" ? "rgba(0,200,83,0.1)" : "transparent" }}>
                                                {task.status === "done" && <Check size={11} style={{ color: "#00C853" }} />}
                                            </div>

                                            {/* Severity icon */}
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
                                                    <span className="text-[10px]" style={{ color: "#4A5568" }}>
                                                        +{task.estimatedPoints} pts
                                                    </span>
                                                    <span className="text-[10px]" style={{ color: "#4A5568" }}>
                                                        {task.affectedPages} page{task.affectedPages !== 1 ? "s" : ""}
                                                    </span>
                                                    <span className="text-[10px]" style={{ color: "#4A5568" }}>
                                                        {EFFORT_LABELS[task.effort]}
                                                    </span>
                                                </div>
                                            </div>

                                            <ChevronRight size={14} style={{ color: "#4A5568" }}
                                                className={`transition-transform shrink-0 ${isSelected ? "rotate-180" : ""}`} />
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
                                    style={{ background: "#151B27", borderColor: "#1E2940" }}>
                                    {/* Drawer header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#1E2940" }}>
                                        <h3 className="text-sm font-bold text-white">Fix Details</h3>
                                        <button onClick={() => setSelectedTask(null)}
                                            className="p-1 rounded transition hover:bg-white/[0.06]"
                                            style={{ color: "#4A5568" }}>
                                            <X size={15} />
                                        </button>
                                    </div>

                                    <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                        {/* Title + badges */}
                                        <div>
                                            <p className="text-base font-bold text-white mb-2">{selectedTaskData.title}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: "rgba(255,100,45,0.12)", color: "#FF642D" }}>
                                                    +{selectedTaskData.estimatedPoints} pts potential
                                                </span>
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: "rgba(139,155,180,0.12)", color: "#8B9BB4" }}>
                                                    {EFFORT_LABELS[selectedTaskData.effort]}
                                                </span>
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: SEVERITY_CONFIG[selectedTaskData.severity].bg, color: SEVERITY_CONFIG[selectedTaskData.severity].color }}>
                                                    {selectedTaskData.severity}
                                                </span>
                                                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ background: "rgba(123,92,245,0.12)", color: "#7B5CF5" }}>
                                                    {selectedTaskData.affectedPages} pages affected
                                                </span>
                                            </div>
                                        </div>

                                        {/* Why it matters */}
                                        <div className="rounded-lg p-4" style={{ background: "rgba(255,152,0,0.06)", border: "1px solid rgba(255,152,0,0.15)" }}>
                                            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF9800" }}>Why It Matters</p>
                                            <p className="text-[13px]" style={{ color: "#C8D0E0" }}>
                                                {selectedTaskData.description || "Fixing this issue will improve your site's search visibility and rankings."}
                                            </p>
                                        </div>

                                        {/* Score impact */}
                                        <div className="rounded-lg p-4" style={{ background: "rgba(255,100,45,0.06)", border: "1px solid rgba(255,100,45,0.15)" }}>
                                            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "#FF642D" }}>Estimated Impact</p>
                                            <p className="text-[13px]" style={{ color: "#C8D0E0" }}>
                                                Fixing this issue across <strong className="text-white">{selectedTaskData.affectedPages} page{selectedTaskData.affectedPages !== 1 ? "s" : ""}</strong>{" "}
                                                could improve your SEO score by up to{" "}
                                                <strong className="text-white">+{selectedTaskData.estimatedPoints} points</strong>.
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => markDone(selectedTaskData.id)}
                                                disabled={selectedTaskData.status === "done"}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
                                                style={{ background: "linear-gradient(135deg, #00C853, #00A846)" }}>
                                                <CheckCircle size={14} />
                                                {selectedTaskData.status === "done" ? "Completed ✓" : "Mark as Fixed"}
                                            </button>
                                            <button
                                                onClick={() => router.push(selectedTaskData.actionHref)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition hover:bg-white/[0.06]"
                                                style={{ color: "#8B9BB4", border: "1px solid #1E2940" }}>
                                                <Play size={13} /> View Issue
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
}
