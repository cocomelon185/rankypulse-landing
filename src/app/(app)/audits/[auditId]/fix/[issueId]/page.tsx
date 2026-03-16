"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Zap,
  UserCheck,
  Clock,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { getIssueContent } from "@/lib/quickwins/issueCatalog";

interface AuditIssue {
  id: string;
  severity: "error" | "warning" | "notice";
  title: string;
  description: string;
  urlsAffected: number;
}

interface AuditData {
  domain: string;
  issues: AuditIssue[];
}

const SEV_ICON: Record<string, React.ElementType> = {
  error: AlertCircle,
  warning: AlertTriangle,
  notice: Info,
};

const SEV_COLOR: Record<string, string> = {
  error: "#ef4444",
  warning: "#f97316",
  notice: "#3b82f6",
};

const SEV_LABEL: Record<string, string> = {
  error: "Error",
  warning: "Warning",
  notice: "Notice",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "bg-emerald-500/15 text-emerald-400",
  Medium: "bg-amber-500/15 text-amber-400",
  Hard: "bg-red-500/15 text-red-400",
};

export default function AuditFixPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params?.auditId as string;
  const issueId = params?.issueId as string;

  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [markedFixed, setMarkedFixed] = useState(false);

  useEffect(() => {
    if (!auditId) return;
    fetch(`/api/audits/${auditId}/data`)
      .then((res) => res.json())
      .then((json: AuditData) => setData(json))
      .catch(() => {/* silent */})
      .finally(() => setLoading(false));
  }, [auditId]);

  const issue = data?.issues.find((i) => i.id === issueId) ?? null;
  const issueIndex = data?.issues.findIndex((i) => i.id === issueId) ?? -1;
  const prevIssue = issueIndex > 0 ? data?.issues[issueIndex - 1] : null;
  const nextIssue = issueIndex >= 0 && data ? data.issues[issueIndex + 1] : null;

  // Rich catalog content — falls back to GENERIC_FALLBACK for unknown issue IDs
  const catalog = getIssueContent(issueId);

  const Icon = issue ? (SEV_ICON[issue.severity] ?? Info) : Info;
  const color = issue ? (SEV_COLOR[issue.severity] ?? "#6B7A99") : "#6B7A99";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f14" }}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f14" }}>
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">Issue not found</p>
          <button
            onClick={() => router.push(`/audits/${auditId}/issues`)}
            className="mt-4 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition"
          >
            Back to Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6" style={{ background: "#0d0f14" }}>
      <div className="mx-auto max-w-3xl space-y-5">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push(`/audits/${auditId}/issues`)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
          All Issues
        </button>

        {/* ── Issue header ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="flex items-start gap-3 mb-3">
            <Icon className="h-5 w-5 mt-0.5 shrink-0" style={{ color }} />
            <div className="flex-1 min-w-0">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                {SEV_LABEL[issue.severity] ?? issue.severity}
              </span>
              <h1 className="text-xl font-bold text-white mt-1">{issue.title}</h1>
            </div>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Difficulty */}
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFFICULTY_COLOR[catalog.difficulty]}`}>
              {catalog.difficulty}
            </span>

            {/* Effort */}
            <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              {catalog.effortMinutes < 60
                ? `~${catalog.effortMinutes} min`
                : `~${Math.round(catalog.effortMinutes / 60)} hr`}
            </span>

            {/* Estimated impact */}
            {catalog.estimatedImpact && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-xs font-semibold text-indigo-400">
                <TrendingUp className="h-3 w-3" />
                {catalog.estimatedImpact}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">{issue.description}</p>

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>{issue.urlsAffected} {issue.urlsAffected === 1 ? "page" : "pages"} affected</span>
            {data?.domain && (
              <a
                href={`https://${data.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition"
              >
                {data.domain}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* ── Why this matters ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-indigo-400" />
            Why this matters
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">{catalog.whyItMatters}</p>
        </div>

        {/* ── Before / After code examples ─────────────────────────────── */}
        {(catalog.exampleBefore || catalog.exampleAfter) && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 space-y-4">
            <h2 className="text-sm font-semibold text-white">Example</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {catalog.exampleBefore && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="text-xs font-medium text-red-400">Before (broken)</span>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-[#0a0c10] border border-red-500/20 p-3 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {catalog.exampleBefore}
                  </pre>
                </div>
              )}
              {catalog.exampleAfter && (
                <div>
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-emerald-400">After (fixed)</span>
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-[#0a0c10] border border-emerald-500/20 p-3 text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {catalog.exampleAfter}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── How to fix ───────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">How to Fix</h2>
          <ol className="space-y-3">
            {catalog.manualSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          {/* Template snippet */}
          {catalog.templateSnippet && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1.5">Copyable template:</p>
              <pre className="overflow-x-auto rounded-lg bg-[#0a0c10] border border-white/[0.06] p-3 text-xs text-indigo-300 whitespace-pre-wrap">
                {catalog.templateSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* ── How to verify ────────────────────────────────────────────── */}
        {catalog.validationSteps.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              How to verify the fix
            </h2>
            <ol className="space-y-3">
              {catalog.validationSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500/60" />
                  <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── AI Fix / Find Expert CTA ─────────────────────────────────── */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {catalog.canAutoFix ? (
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-0.5 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-400" />
                AI Fix available
              </p>
              <p className="text-xs text-gray-400">{catalog.aiFixPreview}</p>
            </div>
          ) : (
            <div className="flex-1">
              <p className="text-sm font-semibold text-white mb-0.5 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-400" />
                Developer or expert needed
              </p>
              <p className="text-xs text-gray-400">
                This fix requires server configuration or code changes — it can&apos;t be done automatically.
              </p>
            </div>
          )}

          {catalog.canAutoFix ? (
            <button className="shrink-0 flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition">
              <Zap className="h-4 w-4" />
              AI Fix →
            </button>
          ) : (
            <a
              href="https://www.upwork.com/search/profiles/?q=seo+developer"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5 transition"
            >
              <UserCheck className="h-4 w-4" />
              Find an Expert →
            </a>
          )}
        </div>

        {/* ── Mark as fixed + navigation ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!markedFixed ? (
            <button
              onClick={() => {
                setMarkedFixed(true);
                if (nextIssue) {
                  setTimeout(() => router.push(`/audits/${auditId}/fix/${nextIssue.id}`), 600);
                } else {
                  setTimeout(() => router.push(`/audits/${auditId}/overview`), 600);
                }
              }}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 transition"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Fixed
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Fixed! Moving to next issue…
            </div>
          )}

          <div className="flex gap-2 ml-auto">
            {prevIssue && (
              <button
                onClick={() => router.push(`/audits/${auditId}/fix/${prevIssue.id}`)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
            )}
            {nextIssue && (
              <button
                onClick={() => router.push(`/audits/${auditId}/fix/${nextIssue.id}`)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {!nextIssue && (
              <button
                onClick={() => router.push(`/audits/${auditId}/overview`)}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition"
              >
                Back to Overview
              </button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {data && data.issues.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            Issue {issueIndex + 1} of {data.issues.length}
          </div>
        )}
      </div>
    </div>
  );
}
