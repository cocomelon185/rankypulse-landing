"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, AlertTriangle, Info, FileText, Wrench, ChevronLeft, Globe } from "lucide-react";

interface AuditIssue {
  id: string;
  severity: "error" | "warning" | "notice";
  title: string;
  description: string;
  urlsAffected: number;
}

interface AuditOverviewData {
  healthScore: number;
  errors: number;
  warnings: number;
  notices: number;
  domain: string;
  crawledAt: string | null;
  totalPages: number;
  status: string;
  issues: AuditIssue[];
}

export default function AuditOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params?.auditId as string;

  const [data, setData] = useState<AuditOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) return;
    fetch(`/api/audits/${auditId}/data`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Audit not found" : "Failed to load");
        return res.json();
      })
      .then((json: AuditOverviewData) => setData(json))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [auditId]);

  const scoreColor =
    (data?.healthScore ?? 0) >= 80
      ? "#10b981"
      : (data?.healthScore ?? 0) >= 60
      ? "#f97316"
      : "#ef4444";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f14" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
          <p className="text-sm text-gray-400">Loading audit results…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f14" }}>
        <div className="text-center">
          <p className="text-lg font-semibold text-white mb-2">{error ?? "Audit not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6" style={{ background: "#0d0f14" }}>
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-gray-300">{data.domain}</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Audit Overview</h1>
          {data.crawledAt && (
            <p className="text-xs text-gray-500">
              Crawled {new Date(data.crawledAt).toLocaleDateString("en", { dateStyle: "medium" })} ·{" "}
              {data.totalPages} pages
            </p>
          )}
        </div>

        {/* Score + E/W/N cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Health Score */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">SEO Score</span>
            <span className="text-5xl font-bold tabular-nums" style={{ color: scoreColor }}>
              {data.healthScore}
            </span>
            <span className="text-xs text-gray-500 mt-1">/ 100</span>
          </div>

          {/* Errors */}
          <button
            onClick={() => router.push(`/audits/${auditId}/issues?severity=errors`)}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-5 hover:bg-[#ef4444]/10 transition cursor-pointer"
          >
            <AlertCircle className="h-5 w-5 text-[#ef4444] mb-2" />
            <span className="text-3xl font-bold tabular-nums text-[#ef4444]">{data.errors}</span>
            <span className="text-xs font-medium text-gray-400 mt-1">Errors</span>
          </button>

          {/* Warnings */}
          <button
            onClick={() => router.push(`/audits/${auditId}/issues?severity=warnings`)}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#f97316]/20 bg-[#f97316]/5 p-5 hover:bg-[#f97316]/10 transition cursor-pointer"
          >
            <AlertTriangle className="h-5 w-5 text-[#f97316] mb-2" />
            <span className="text-3xl font-bold tabular-nums text-[#f97316]">{data.warnings}</span>
            <span className="text-xs font-medium text-gray-400 mt-1">Warnings</span>
          </button>

          {/* Notices */}
          <button
            onClick={() => router.push(`/audits/${auditId}/issues?severity=notices`)}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#3b82f6]/20 bg-[#3b82f6]/5 p-5 hover:bg-[#3b82f6]/10 transition cursor-pointer"
          >
            <Info className="h-5 w-5 text-[#3b82f6] mb-2" />
            <span className="text-3xl font-bold tabular-nums text-[#3b82f6]">{data.notices}</span>
            <span className="text-xs font-medium text-gray-400 mt-1">Notices</span>
          </button>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => router.push(`/audits/${auditId}/issues`)}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 hover:bg-white/[0.06] transition text-left"
          >
            <AlertCircle className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">All Issues</p>
              <p className="text-xs text-gray-400">{data.errors + data.warnings + data.notices} found</p>
            </div>
          </button>

          <button
            onClick={() => router.push(`/audits/${auditId}/pages`)}
            className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-5 py-4 hover:bg-white/[0.06] transition text-left"
          >
            <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">Crawled Pages</p>
              <p className="text-xs text-gray-400">{data.totalPages} pages</p>
            </div>
          </button>

          {data.issues.length > 0 && (
            <button
              onClick={() => router.push(`/audits/${auditId}/fix/${data.issues[0].id}`)}
              className="flex items-center gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-5 py-4 hover:bg-indigo-500/10 transition text-left"
            >
              <Wrench className="h-5 w-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">Start Fixing</p>
                <p className="text-xs text-gray-400">Fix the top issue first</p>
              </div>
            </button>
          )}
        </div>

        {/* Top issues list */}
        {data.issues.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-white">Top Issues</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {data.issues.slice(0, 10).map((issue) => {
                const color =
                  issue.severity === "error"
                    ? "#ef4444"
                    : issue.severity === "warning"
                    ? "#f97316"
                    : "#3b82f6";
                const Icon =
                  issue.severity === "error"
                    ? AlertCircle
                    : issue.severity === "warning"
                    ? AlertTriangle
                    : Info;
                return (
                  <button
                    key={issue.id}
                    onClick={() => router.push(`/audits/${auditId}/fix/${issue.id}`)}
                    className="w-full flex items-start gap-3 px-5 py-4 hover:bg-white/[0.03] transition text-left"
                  >
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{issue.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{issue.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">{issue.urlsAffected} pages</span>
                  </button>
                );
              })}
            </div>
            {data.issues.length > 10 && (
              <div className="px-5 py-3 border-t border-white/[0.06]">
                <button
                  onClick={() => router.push(`/audits/${auditId}/issues`)}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  View all {data.issues.length} issues →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
