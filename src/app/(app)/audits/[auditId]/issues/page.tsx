"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, AlertTriangle, Info, ChevronLeft, Search, RefreshCcw } from "lucide-react";

interface AuditIssue {
  id: string;
  severity: "error" | "warning" | "notice";
  title: string;
  description: string;
  urlsAffected: number;
  discovered: string;
}

interface AuditData {
  healthScore: number;
  errors: number;
  warnings: number;
  notices: number;
  domain: string;
  totalPages: number;
  issues: AuditIssue[];
}

type SeverityTab = "all" | "errors" | "warnings" | "notices";

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

export default function AuditIssuesPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const auditId = params?.auditId as string;

  // Pre-select tab from ?severity= query param
  const severityParam = searchParams?.get("severity") as SeverityTab | null;
  const [activeTab, setActiveTab] = useState<SeverityTab>(
    severityParam && ["errors", "warnings", "notices"].includes(severityParam)
      ? severityParam
      : "all"
  );
  const [search, setSearch] = useState("");

  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update tab if URL param changes
  useEffect(() => {
    if (severityParam && ["errors", "warnings", "notices"].includes(severityParam)) {
      setActiveTab(severityParam as SeverityTab);
    }
  }, [severityParam]);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    fetch(`/api/audits/${auditId}/data`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Audit not found" : "Failed to load");
        return res.json();
      })
      .then((json: AuditData) => setData(json))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!auditId) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auditId]);

  const filteredIssues = useMemo(() => {
    if (!data) return [];
    let list = data.issues;
    if (activeTab === "errors") list = list.filter((i) => i.severity === "error");
    else if (activeTab === "warnings") list = list.filter((i) => i.severity === "warning");
    else if (activeTab === "notices") list = list.filter((i) => i.severity === "notice");
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return list;
  }, [data, activeTab, search]);

  const tabs: { key: SeverityTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: data ? data.issues.length : 0 },
    { key: "errors", label: "Errors", count: data?.errors ?? 0 },
    { key: "warnings", label: "Warnings", count: data?.warnings ?? 0 },
    { key: "notices", label: "Notices", count: data?.notices ?? 0 },
  ];

  return (
    <div className="min-h-screen px-4 pt-24 pb-16 sm:px-6" style={{ background: "#0d0f14" }}>
      <div className="mx-auto max-w-5xl space-y-5">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push(`/audits/${auditId}/overview`)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
          Overview
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white">Issues</h1>
            {data?.domain && (
              <p className="text-xs text-gray-400 mt-0.5">{data.domain} · {data.totalPages} pages crawled</p>
            )}
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 transition"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                activeTab === key
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}{" "}
              <span
                className={`ml-1 tabular-nums ${
                  activeTab === key ? "text-white" : "text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues…"
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500/50 transition"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
            <p className="text-sm text-gray-400">
              {search ? "No issues match your search." : "No issues found for this filter."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            <div className="divide-y divide-white/[0.04]">
              {filteredIssues.map((issue) => {
                const Icon = SEV_ICON[issue.severity] ?? Info;
                const color = SEV_COLOR[issue.severity] ?? "#6B7A99";
                return (
                  <div key={issue.id} className="flex items-start gap-3 px-5 py-4">
                    <Icon className="h-4 w-4 mt-0.5 shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-white">{issue.title}</p>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-gray-500 tabular-nums">
                            {issue.urlsAffected} {issue.urlsAffected === 1 ? "page" : "pages"}
                          </span>
                          <button
                            onClick={() => router.push(`/audits/${auditId}/fix/${issue.id}`)}
                            className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20 transition"
                          >
                            Fix →
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{issue.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
