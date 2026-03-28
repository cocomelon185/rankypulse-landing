"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import {
  ListChecks,
  Check,
  Zap,
  Filter,
  Download,
  TrendingUp,
  Clock,
  AlertCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  UserCheck,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { getIssueContent } from "@/lib/quickwins/issueCatalog";

// ── Types ──────────────────────────────────────────────────────────────────────

interface RawApiIssue {
  id: string;
  severity: "error" | "warning" | "notice";
  title: string;
  description: string;
  urlsAffected: number;
  affectedUrls?: string[];
}

interface ActionTask {
  issueId: string;
  label: string;
  category: string;
  priority: "high" | "medium" | "low";
  difficulty: "Easy" | "Medium" | "Hard";
  effortMinutes: number;
  scoreGain: number;
  urlsAffected: number;
  whyItMatters: string;
  estimatedImpact: string;
  canAutoFix: boolean;
  done: boolean;
  affectedUrls: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SCORE_GAIN: Record<string, number> = { error: 8, warning: 4, notice: 2 };

function sevToPriority(sev: string): "high" | "medium" | "low" {
  if (sev === "error") return "high";
  if (sev === "warning") return "medium";
  return "low";
}

function buildTasks(
  issues: RawApiIssue[],
  doneSet: Set<string>
): ActionTask[] {
  return issues.map((issue) => {
    const catalog = getIssueContent(issue.id, issue.title);
    return {
      issueId: issue.id,
      label: catalog.title !== "Unknown Issue" ? catalog.title : issue.title,
      category: catalog.category,
      priority: sevToPriority(issue.severity),
      difficulty: catalog.difficulty,
      effortMinutes: catalog.effortMinutes,
      scoreGain: SCORE_GAIN[issue.severity] ?? 2,
      urlsAffected: issue.urlsAffected,
      whyItMatters: catalog.whyItMatters,
      estimatedImpact: catalog.estimatedImpact,
      canAutoFix: catalog.canAutoFix,
      done: doneSet.has(issue.id),
      affectedUrls: issue.affectedUrls ?? [],
    };
  });
}

function storageKey(domain: string | null) {
  return `rp_action_done_${domain ?? "unknown"}`;
}

function loadDone(domain: string | null): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(domain));
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveDone(domain: string | null, doneSet: Set<string>) {
  try {
    localStorage.setItem(storageKey(domain), JSON.stringify([...doneSet]));
  } catch { /* silent */ }
}

// ── Badge colours ──────────────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

const DIFFICULTY_STYLES: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-red-100 text-red-700",
};

const SEV_ICON: Record<string, React.ElementType> = {
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};

type FilterType = "All" | "Quick wins" | "High priority" | "In progress";

// ── Component ──────────────────────────────────────────────────────────────────

export default function ActionPlanClientPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ActionTask[]>([]);
  const [domain, setDomain] = useState<string | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Fetch real audit data ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const storedDomain =
        (typeof window !== "undefined" &&
          (localStorage.getItem("rankypulse_audit_domain") ??
            localStorage.getItem("rankypulse_last_url") ??
            "")) ||
        "";
      const cleanDomain = storedDomain
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0]
        .toLowerCase()
        .trim();
      const domainQuery = cleanDomain ? `?domain=${encodeURIComponent(cleanDomain)}` : "";
      const res = await fetch(`/api/audits/data${domainQuery}`);
      if (!res.ok) return;
      const data = await res.json();
      const resolvedDomain: string | null = data.domain ?? null;
      setDomain(resolvedDomain);
      setAuditId(data.auditId ?? null);
      const doneSet = loadDone(resolvedDomain);
      const built = buildTasks(data.issues ?? [], doneSet);
      // Sort: undone first, then by priority, then by urlsAffected
      built.sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const po: Record<string, number> = { high: 0, medium: 1, low: 2 };
        if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
        return b.urlsAffected - a.urlsAffected;
      });
      setTasks(built);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Toggle done ──────────────────────────────────────────────────────────────
  function toggleDone(issueId: string) {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.issueId === issueId ? { ...t, done: !t.done } : t
      );
      const doneSet = new Set(next.filter((t) => t.done).map((t) => t.issueId));
      saveDone(domain, doneSet);
      // Re-sort after toggle
      next.sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        const po: Record<string, number> = { high: 0, medium: 1, low: 2 };
        if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
        return b.urlsAffected - a.urlsAffected;
      });
      return next;
    });
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.done).length;
  const completionPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const quickWins = tasks.filter((t) => t.difficulty === "Easy" && !t.done).length;
  const scoreGainDone = tasks.filter((t) => t.done).reduce((s, t) => s + t.scoreGain, 0);
  const scoreGainTotal = tasks.reduce((s, t) => s + t.scoreGain, 0);

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "Quick wins") return t.difficulty === "Easy";
    if (activeFilter === "High priority") return t.priority === "high";
    if (activeFilter === "In progress") return !t.done;
    return true;
  });

  // ── Fix link builder ─────────────────────────────────────────────────────────
  function fixHref(issueId: string): string {
    if (auditId) return `/audits/${auditId}/fix/${issueId}`;
    return `/audits/issues`;
  }

  // ── Empty state (no audit data yet) ─────────────────────────────────────────
  if (!loading && tasks.length === 0) {
    return (
      <PageLayout>
        <PageHeader
          icon={<ListChecks className="h-7 w-7" />}
          title="Action Plan"
          subtitle="Prioritized checklist of SEO improvements for your site"
        />
        <Card extra="p-12 text-center" default>
          <ListChecks className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg font-semibold text-[#1B2559] mb-2">No audit data yet</p>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Run a full site audit to generate your personalised action plan. We&apos;ll
            prioritize every fix by traffic impact.
          </p>
          <Button variant="primary" size="md" onClick={() => router.push("/audits/full")}>
            Run Site Audit
          </Button>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        icon={<ListChecks className="h-7 w-7" />}
        title="Action Plan"
        subtitle={
          domain
            ? `Prioritized fixes for ${domain} — sorted by SEO impact`
            : "Prioritized checklist of SEO improvements for your site"
        }
        cta={
          <Button
            variant="secondary"
            size="md"
            onClick={() => toast.info("PDF export coming soon!")}
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        }
      />

      {/* ── Loading skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* ── Summary strip ──────────────────────────────────────────────── */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            {/* Completion */}
            <div className="card-surface flex items-center gap-4 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#4318ff]/10 to-[#7551ff]/10">
                <Check className="h-7 w-7 text-[#4318ff]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-[#1B2559]">{completionPercent}%</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] transition-all duration-500"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Quick wins */}
            <div className="card-surface flex items-center gap-4 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                <Zap className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Quick wins left</p>
                <p className="text-2xl font-bold text-[#1B2559]">{quickWins}</p>
                <p className="text-xs text-gray-400 mt-0.5">Easy fixes, big impact</p>
              </div>
            </div>

            {/* Total tasks */}
            <div className="card-surface flex items-center gap-4 rounded-2xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100">
                <ListChecks className="h-7 w-7 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total issues</p>
                <p className="text-2xl font-bold text-[#1B2559]">{totalCount}</p>
                <p className="text-xs text-gray-400 mt-0.5">{doneCount} resolved</p>
              </div>
            </div>
          </div>

          {/* ── Score gain banner ───────────────────────────────────────────── */}
          {scoreGainTotal > 0 && (
            <div className="mb-8 rounded-2xl border-2 border-[#4318ff]/20 bg-gradient-to-r from-[#eff6ff]/80 to-white p-6">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h3 className="mb-1 font-semibold text-[#1B2559] flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#4318ff]" />
                    Estimated SEO score gain
                  </h3>
                  <p className="text-sm text-gray-600">
                    Fix all issues:{" "}
                    <strong className="text-green-600">+{scoreGainTotal} pts</strong>
                    {" · "}Fixed so far:{" "}
                    <strong className="text-[#4318ff]">+{scoreGainDone} pts</strong>
                  </p>
                </div>
                {domain && (
                  <button
                    onClick={fetchData}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#4318ff] transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Refresh
                  </button>
                )}
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] transition-all duration-500"
                  style={{
                    width: `${scoreGainTotal > 0 ? (scoreGainDone / scoreGainTotal) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Filter pills ────────────────────────────────────────────────── */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(["All", "Quick wins", "High priority", "In progress"] as const).map(
              (filter) => {
                const count =
                  filter === "All"
                    ? totalCount
                    : filter === "Quick wins"
                    ? tasks.filter((t) => t.difficulty === "Easy").length
                    : filter === "High priority"
                    ? tasks.filter((t) => t.priority === "high").length
                    : tasks.filter((t) => !t.done).length;

                return (
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
                    {filter === "Quick wins" && <Zap className="h-3.5 w-3.5" />}
                    {filter === "High priority" && <AlertCircle className="h-3.5 w-3.5" />}
                    {filter === "In progress" && <Filter className="h-3.5 w-3.5" />}
                    {filter}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs ${
                        activeFilter === filter
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* ── Task list ───────────────────────────────────────────────────── */}
          <Card extra="p-0 overflow-hidden" default>
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center">
                <Check className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
                <p className="font-semibold text-[#1B2559]">All clear!</p>
                <p className="text-sm text-gray-500 mt-1">
                  No issues match this filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task, idx) => {
                  const Icon = SEV_ICON[task.priority] ?? Info;
                  const isExpanded = expandedId === task.issueId;

                  return (
                    <div key={task.issueId}>
                      {/* ── Task row ──────────────────────────────────────── */}
                      <div
                        className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between transition-colors ${
                          task.done
                            ? "bg-green-50/40"
                            : "bg-white hover:bg-gray-50/60"
                        }`}
                      >
                        {/* Left: number + label + badges */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {/* Done toggle */}
                          <button
                            onClick={() => toggleDone(task.issueId)}
                            aria-label={task.done ? "Mark undone" : "Mark done"}
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                              task.done
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                            }`}
                          >
                            {task.done ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-xs">{idx + 1}</span>
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            {/* Issue title + category */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <Icon
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  task.priority === "high"
                                    ? "text-red-500"
                                    : task.priority === "medium"
                                    ? "text-amber-500"
                                    : "text-blue-400"
                                }`}
                              />
                              <p
                                className={`font-semibold text-sm text-[#1B2559] ${
                                  task.done ? "line-through text-gray-400" : ""
                                }`}
                              >
                                {task.label}
                              </p>
                              <span className="text-xs text-gray-400 hidden sm:inline">
                                · {task.category}
                              </span>
                            </div>

                            {/* Badges row */}
                            <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}>
                                {task.priority}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${DIFFICULTY_STYLES[task.difficulty]}`}>
                                {task.difficulty}
                              </span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                {task.effortMinutes < 60
                                  ? `~${task.effortMinutes}m`
                                  : `~${Math.round(task.effortMinutes / 60)}h`}
                              </span>
                              {task.estimatedImpact && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                                  <TrendingUp className="h-3 w-3" />
                                  {task.estimatedImpact}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">
                                {task.urlsAffected} {task.urlsAffected === 1 ? "page" : "pages"}
                              </span>
                            </div>

                            {/* Why it matters — collapsed/expanded */}
                            {!task.done && (
                              <p
                                className={`mt-1.5 text-xs text-gray-500 leading-relaxed ${
                                  isExpanded ? "" : "line-clamp-1"
                                }`}
                              >
                                {task.whyItMatters}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: action buttons */}
                        {!task.done && (
                          <div className="flex items-center gap-2 shrink-0 ml-10 sm:ml-0">
                            {/* Expand/collapse details */}
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : task.issueId)
                              }
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                              aria-label={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>

                            {/* Fix now button */}
                            <Link href={fixHref(task.issueId)}>
                              <Button variant="secondary" size="sm">
                                Fix now
                              </Button>
                            </Link>
                          </div>
                        )}

                        {task.done && (
                          <span className="shrink-0 text-xs text-emerald-600 font-medium flex items-center gap-1 ml-10 sm:ml-0">
                            <Check className="h-3 w-3" />
                            Fixed
                          </span>
                        )}
                      </div>

                      {/* ── Expanded detail panel ─────────────────────────── */}
                      {isExpanded && !task.done && (
                        <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-4 ml-10">
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {task.whyItMatters}
                          </p>

                          {/* Affected URLs */}
                          {task.affectedUrls.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                                Affected pages
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {task.affectedUrls.slice(0, 6).map((url) => {
                                  const path =
                                    url.replace(/^https?:\/\/[^/]+/, "") || "/";
                                  return (
                                    <span
                                      key={url}
                                      className="rounded bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-500 truncate max-w-[280px] font-mono"
                                    >
                                      {path}
                                    </span>
                                  );
                                })}
                                {task.affectedUrls.length > 6 && (
                                  <span className="text-xs text-gray-400 self-center">
                                    +{task.affectedUrls.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* CTA row */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <Link href={fixHref(task.issueId)}>
                              {task.canAutoFix ? (
                                <button className="flex items-center gap-1.5 rounded-lg bg-[#4318ff] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3311dd] transition">
                                  <Zap className="h-3.5 w-3.5" />
                                  View Full Fix Guide
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </button>
                              ) : (
                                <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition">
                                  <UserCheck className="h-3.5 w-3.5" />
                                  View Fix Guide
                                  <ExternalLink className="h-3 w-3 opacity-60" />
                                </button>
                              )}
                            </Link>

                            {!task.canAutoFix && (
                              <a
                                href="https://www.upwork.com/search/profiles/?q=seo+developer"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 transition"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Find an expert
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}

                            <button
                              onClick={() => toggleDone(task.issueId)}
                              className="ml-auto flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Mark as Fixed
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* ── Footer: reset button ────────────────────────────────────────── */}
          {doneCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setTasks((prev) =>
                    prev.map((t) => ({ ...t, done: false })).sort((a, b) => {
                      const po: Record<string, number> = { high: 0, medium: 1, low: 2 };
                      if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
                      return b.urlsAffected - a.urlsAffected;
                    })
                  );
                  saveDone(domain, new Set());
                }}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1.5 transition"
              >
                <RotateCcw className="h-3 w-3" />
                Reset all to undone
              </button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
