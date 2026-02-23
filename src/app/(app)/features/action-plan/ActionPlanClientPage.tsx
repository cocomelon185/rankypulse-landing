"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ListChecks, Check, Zap, Filter, Download } from "lucide-react";

const TASKS = [
  { id: 1, label: "Add meta description", priority: "high", difficulty: "easy", done: true, scoreGain: 8 },
  { id: 2, label: "Optimize title length (55 chars)", priority: "high", difficulty: "easy", done: true, scoreGain: 6 },
  { id: 3, label: "Add Open Graph image", priority: "medium", difficulty: "medium", done: false, scoreGain: 5 },
  { id: 4, label: "Implement schema markup", priority: "high", difficulty: "medium", done: false, scoreGain: 8 },
  { id: 5, label: "Fix duplicate H1 tags", priority: "medium", difficulty: "easy", done: false, scoreGain: 4 },
];

type FilterType = "All" | "Quick wins" | "High priority" | "In progress";

export default function ActionPlanClientPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const filteredTasks = TASKS.filter((task) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Quick wins") return task.difficulty === "easy";
    if (activeFilter === "High priority") return task.priority === "high";
    if (activeFilter === "In progress") return !task.done;
    return true;
  });
  const doneCount = TASKS.filter((t) => t.done).length;
  const totalCount = TASKS.length;
  const completionPercent = Math.round((doneCount / totalCount) * 100);
  const quickWins = TASKS.filter((t) => t.difficulty === "easy" && !t.done).length;
  const scoreGainDone = TASKS.filter((t) => t.done).reduce((s, t) => s + (t.scoreGain ?? 0), 0);
  const scoreGainTotal = TASKS.reduce((s, t) => s + (t.scoreGain ?? 0), 0);

  return (
    <PageLayout>
      <PageHeader
        icon={<ListChecks className="h-7 w-7" />}
        title="Action Plan"
        subtitle="Prioritized checklist of SEO improvements for your site"
        cta={
          <Button
            variant="secondary"
            size="md"
            onClick={() => toast.info("Export coming soon. Your action plan will be downloadable as PDF.")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      {/* Top summary strip */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card-surface flex items-center gap-4 rounded-2xl p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff]/10 to-[#7551ff]/10">
            <Check className="h-7 w-7 text-[#4318ff]" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Completion</p>
            <p className="text-2xl font-bold text-[#1B2559]">{completionPercent}%</p>
          </div>
          <div className="ml-auto h-12 w-12">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
        </div>
        <div className="card-surface flex items-center gap-4 rounded-2xl p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
            <Zap className="h-7 w-7 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Quick wins left</p>
            <p className="text-2xl font-bold text-[#1B2559]">{quickWins}</p>
          </div>
        </div>
        <div className="card-surface flex items-center gap-4 rounded-2xl p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
            <ListChecks className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total tasks</p>
            <p className="text-2xl font-bold text-[#1B2559]">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* Projected score gain from completion */}
      <div className="mb-8 rounded-2xl border-2 border-[#4318ff]/20 bg-gradient-to-r from-[#eff6ff]/80 to-white p-6">
        <h3 className="mb-2 font-semibold text-[#1B2559]">Estimated score gain from action plan</h3>
        <p className="text-sm text-gray-600">
          Completing all tasks: <strong className="text-green-600">+{scoreGainTotal} pts</strong>{" "}
          · Completed so far: <strong>+{scoreGainDone} pts</strong>
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] transition-all"
            style={{ width: `${(scoreGainDone / scoreGainTotal) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters as pill tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["All", "Quick wins", "High priority", "In progress"] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeFilter === filter
                ? "bg-[#4318ff] text-white shadow-md"
                : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
            }`}
          >
            {filter === "Quick wins" && <Zap className="h-4 w-4" />}
            {filter === "In progress" && <Filter className="h-4 w-4" />}
            {filter}
          </button>
        ))}
      </div>

      {/* Task checklist */}
      <Card extra="p-6 md:p-8" default={true}>
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex flex-col gap-4 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                task.done
                  ? "border-green-200/60 bg-green-50/30"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    task.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {task.done ? <Check className="h-4 w-4" /> : task.id}
                </span>
                <div>
                  <p
                    className={`font-medium text-[#1B2559] ${
                      task.done ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.label}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {task.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              {!task.done && (
                <Link href="/audit/results">
                  <Button variant="secondary" size="sm">
                    Fix now
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
}
