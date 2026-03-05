"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Globe, AlertCircle } from "lucide-react";

interface AuditPage {
  url: string;
  score: number | null;
  issueCount: number;
}

interface PagesData {
  domain: string;
  status: string;
  pages: AuditPage[];
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-500">—</span>;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f97316" : "#ef4444";
  return (
    <span className="text-xs font-bold tabular-nums" style={{ color }}>
      {score}
    </span>
  );
}

export default function AuditPagesPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params?.auditId as string;

  const [data, setData] = useState<PagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auditId) return;
    fetch(`/api/audits/${auditId}/pages`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Audit not found" : "Failed to load");
        return res.json();
      })
      .then((json: PagesData) => setData(json))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [auditId]);

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
        <div>
          <h1 className="text-xl font-bold text-white">Crawled Pages</h1>
          {data?.domain && (
            <div className="flex items-center gap-1.5 mt-1">
              <Globe className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-xs text-gray-400">{data.domain}</span>
            </div>
          )}
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
        ) : !data || data.pages.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-12 text-center">
            <p className="text-sm text-gray-400">No pages have been crawled for this audit yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-5 py-3 border-b border-white/[0.06]">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">URL</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">Issues</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 text-right w-14">Score</span>
            </div>

            {/* Table rows */}
            <div className="divide-y divide-white/[0.04]">
              {data.pages.map((page, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-white/[0.02] transition">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {page.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                  <div className="flex items-center gap-1 justify-end">
                    {page.issueCount > 0 && (
                      <AlertCircle className="h-3.5 w-3.5 text-[#ef4444]" />
                    )}
                    <span className="text-xs text-gray-400 tabular-nums">{page.issueCount}</span>
                  </div>
                  <div className="w-14 text-right">
                    <ScoreBadge score={page.score} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-white/[0.06]">
              <p className="text-xs text-gray-500">{data.pages.length} pages · sorted by score (worst first)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
