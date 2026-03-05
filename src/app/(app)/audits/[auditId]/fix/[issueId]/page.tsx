"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, AlertTriangle, Info, ExternalLink } from "lucide-react";

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

/** General guidance for common SEO issue types */
function getFixGuidance(issueId: string): string[] {
  const guides: Record<string, string[]> = {
    missing_title: [
      "Add a unique <title> tag to every page (50–60 characters)",
      "Include the primary keyword near the beginning",
      "Avoid duplicate titles across pages",
    ],
    missing_meta_description: [
      "Add a <meta name='description'> tag (150–160 characters)",
      "Include a clear value proposition and a call to action",
      "Each page should have a unique description",
    ],
    missing_h1: [
      "Add exactly one <h1> tag per page",
      "The H1 should describe the main topic of the page",
      "Include your primary target keyword naturally",
    ],
    slow_lcp: [
      "Optimize and compress images (use WebP format)",
      "Preload the Largest Contentful Paint element",
      "Remove render-blocking resources from the critical path",
      "Enable browser caching and use a CDN",
    ],
    broken_links: [
      "Identify broken links using your audit results",
      "Fix or remove links that return 4xx / 5xx responses",
      "Set up 301 redirects for permanently moved pages",
    ],
    missing_alt_text: [
      "Add descriptive alt text to every <img> element",
      "Be concise — describe what is in the image",
      "Avoid 'image of' or 'photo of' prefixes",
    ],
    no_canonical: [
      "Add <link rel='canonical'> to every page",
      "Point it to the preferred URL for that content",
      "Ensure consistent use of www vs non-www and trailing slashes",
    ],
  };
  return (
    guides[issueId] ?? [
      "Review the issue details and consult your CMS documentation",
      "Make the required changes in your page templates or CMS settings",
      "Re-audit the page after making changes to confirm the fix",
    ]
  );
}

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

  const guidance = getFixGuidance(issueId);
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
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Breadcrumb */}
        <button
          onClick={() => router.push(`/audits/${auditId}/issues`)}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition"
        >
          <ChevronLeft className="h-4 w-4" />
          All Issues
        </button>

        {/* Issue header */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="flex items-start gap-3 mb-4">
            <Icon className="h-5 w-5 mt-0.5 shrink-0" style={{ color }} />
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color }}
              >
                {SEV_LABEL[issue.severity] ?? issue.severity}
              </span>
              <h1 className="text-xl font-bold text-white mt-1">{issue.title}</h1>
            </div>
          </div>

          <p className="text-sm text-gray-300 leading-relaxed">{issue.description}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
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

        {/* Fix guidance */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold text-white mb-4">How to Fix</h2>
          <ol className="space-y-3">
            {guidance.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Mark as fixed + navigation */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {!markedFixed ? (
            <button
              onClick={() => {
                setMarkedFixed(true);
                // Navigate to next issue after marking fixed
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
