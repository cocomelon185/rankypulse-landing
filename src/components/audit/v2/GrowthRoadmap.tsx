"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SprintSuccessModal } from "./SprintSuccessModal";
import {
  Calendar,
  CheckCircle2,
  Zap,
  Target,
  FileText,
  Link as LinkIcon,
  Clock,
  ArrowUpRight,
  Settings,
} from "lucide-react";
import { useAuditStore } from "@/lib/use-audit";
import type { RoadmapTask } from "@/lib/use-audit";

// ── Static seed tasks (shown when user hasn't added any via the roadmap button) ─
const SEED_TASKS: RoadmapTask[] = [
  {
    id: "seed-t1",
    type: "LINK",
    title: "Fix 2 Orphan Pages",
    description:
      "Internal Links scan found 2 pages with zero inbound links. Link from /blog/what-is-seo to /seo-audit-tool.",
    impact: "HIGH",
    effort: "10 min",
    status: "TODO",
    addedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-t2",
    type: "CONTENT",
    title: 'Update "SaaS Audit" Post',
    description:
      'Keyword research shows high volume for "SaaS SEO audit". Add 300 words and H2 headers using our AI brief.',
    impact: "HIGH",
    effort: "45 min",
    status: "TODO",
    addedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-t3",
    type: "TECHNICAL",
    title: "Resolve Viewport Issues",
    description:
      "33 pages are not mobile-friendly. Add the missing meta-viewport tag to your global header component.",
    impact: "HIGH",
    effort: "5 min",
    status: "TODO",
    addedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-t4",
    type: "LINK",
    title: "Diversify Anchor Text",
    description:
      'Your "Exact Match" ratio is 28%. Replace 5 generic "click here" links with descriptive anchor text.',
    impact: "MED",
    effort: "20 min",
    status: "TODO",
    addedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
  },
  {
    id: "seed-t5",
    type: "CONTENT",
    title: 'New Content: "Internal Linking Guide"',
    description:
      'Gap analysis shows competitors rank for "Internal Linking Strategy". Use the generator to draft this post.',
    impact: "MED",
    effort: "90 min",
    status: "TODO",
    addedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
];

// ── Type icon map ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  CONTENT: {
    icon: FileText,
    label: "Content",
    classes: "bg-blue-500/10 text-blue-400",
  },
  LINK: {
    icon: LinkIcon,
    label: "Link",
    classes: "bg-purple-500/10 text-purple-400",
  },
  TECHNICAL: {
    icon: Settings,
    label: "Technical",
    classes: "bg-orange-500/10 text-orange-400",
  },
};

/** Derives a "Day X" label from addedAt timestamp relative to the earliest task */
function getDayLabel(addedAt: number, earliest: number): number {
  const diffMs = addedAt - earliest;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  // Spread dynamically-added tasks across the 30-day sprint window
  return Math.max(1, Math.min(30, diffDays + 1));
}

// ── Main component ─────────────────────────────────────────────────────────────
export function GrowthRoadmap() {
  const { roadmapTasks, addTaskToRoadmap, toggleTaskStatus } = useAuditStore();
  const [showSuccess, setShowSuccess] = useState(false);

  // Seed the store with static tasks on first visit
  useEffect(() => {
    if (roadmapTasks.length === 0) {
      SEED_TASKS.forEach((t) => addTaskToRoadmap(t));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tasks = [...roadmapTasks].sort((a, b) => a.addedAt - b.addedAt);
  const earliest = tasks[0]?.addedAt ?? Date.now();
  const completedCount = tasks.filter((t) => t.status === "DONE").length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const quickWins = tasks.filter((t) => {
    const mins = parseInt(t.effort);
    return !isNaN(mins) && mins <= 15 && t.status === "TODO";
  }).length;

  const highImpact = tasks.filter((t) => t.impact === "HIGH" && t.status === "TODO").length;

  // Toggle handler — fires success modal when the final task is completed
  const handleToggle = (task: RoadmapTask) => {
    toggleTaskStatus(task.id);
    if (task.status === "TODO") {
      const newCompleted = completedCount + 1;
      if (newCompleted === tasks.length) {
        setTimeout(() => setShowSuccess(true), 500);
      }
    }
  };

  return (
    <>
      <SprintSuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        completedCount={tasks.length}
        totalMinutes={tasks.reduce((sum, t) => sum + (parseInt(t.effort) || 0), 0)}
      />
    <div className="space-y-8 p-6 bg-[#0B0F17] min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-[#FF642D] font-bold text-sm uppercase tracking-widest mb-2">
            <Calendar size={16} />
            30-Day Growth Sprint
          </div>
          <h1 className="text-3xl font-bold text-white">Your SEO Roadmap</h1>
          <p className="text-slate-400 mt-2">
            Personalised tasks based on your Audit, Link, and Keyword data.
          </p>
        </div>

        {/* Progress card */}
        <div className="bg-[#151B27] border border-[#1E2940] p-4 rounded-xl min-w-[240px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 font-medium">Sprint Progress</span>
            <span className="text-xs font-bold text-[#FF642D]">
              {completedCount}/{tasks.length} · {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-[#1E2940] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-[#FF642D] rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#151B27] p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Quick Wins</p>
            <p className="text-xl font-bold text-white">{quickWins} Task{quickWins !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="bg-[#151B27] p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Target size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">High Impact</p>
            <p className="text-xl font-bold text-white">{highImpact} Remaining</p>
          </div>
        </div>
        <div className="bg-[#151B27] p-4 rounded-xl border border-white/5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Tasks Added</p>
            <p className="text-xl font-bold text-white">{tasks.length} Total</p>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#FF642D]/20 bg-[#FF642D]/5 px-8 py-14 text-center">
            <Zap size={28} className="text-[#FF642D] animate-pulse" />
            <p className="text-base font-semibold text-white">No tasks yet</p>
            <p className="max-w-sm text-sm text-slate-400">
              Click &ldquo;Add to Roadmap&rdquo; on any audit issue or link opportunity to build your sprint.
            </p>
          </div>
        ) : (
          tasks.map((task, index) => {
            const typeConf = TYPE_CONFIG[task.type];
            const TypeIcon = typeConf.icon;
            const dayLabel = getDayLabel(task.addedAt, earliest);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.07, duration: 0.35 }}
                onClick={() => handleToggle(task)}
                className={`cursor-pointer group relative p-5 rounded-2xl border transition-all ${
                  task.status === "DONE"
                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-60"
                    : "bg-[#151B27] border-[#1E2940] hover:border-[#FF642D]/40"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Check circle */}
                  <div className="mt-1 shrink-0">
                    {task.status === "DONE" ? (
                      <CheckCircle2 className="text-emerald-500" size={24} />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-slate-700 group-hover:border-[#FF642D] transition-colors" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold bg-[#1E2940] text-slate-400 px-2 py-0.5 rounded uppercase">
                        Day {dayLabel}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase inline-flex items-center gap-1 ${typeConf.classes}`}>
                        <TypeIcon size={10} />
                        {typeConf.label}
                      </span>
                      {task.impact === "HIGH" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-[#FF642D]/10 text-[#FF642D]">
                          High Impact
                        </span>
                      )}
                    </div>

                    <h3
                      className={`font-bold transition-all ${
                        task.status === "DONE"
                          ? "line-through text-slate-500"
                          : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{task.description}</p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase">
                        <Zap size={12} className="text-[#FF642D]" />
                        Impact: {task.impact}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500 uppercase">
                        <Clock size={12} />
                        {task.effort}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:block shrink-0">
                    <ArrowUpRight
                      size={18}
                      className="text-slate-700 group-hover:text-[#FF642D] transition-colors"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
}
