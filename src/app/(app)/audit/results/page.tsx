"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CircularProgress } from "@/components/horizon";
import { Button } from "@/components/ui/button";
import { ScoreImpactChart } from "@/components/charts/ScoreImpactChart";
import { PageLayout } from "@/components/layout/PageLayout";
import { toast } from "sonner";
import {
  BarChart3,
  FileText,
  Tag,
  AlertTriangle,
  Zap,
  Copy,
  Sparkles,
  Download,
  ChevronLeft,
} from "lucide-react";

const AUDIT_RESULT_KEY = "rankypulse_audit_result";

interface AuditData {
  url?: string;
  hostname?: string;
  scores?: { seo?: number };
  issues?: Array<{ id: string; title: string; severity: string; category: string }>;
  summary?: {
    title?: string;
    metaDescription?: string;
    canonical?: string;
  };
}

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "title-meta", label: "Title & Meta", icon: FileText },
  { id: "schema", label: "Schema", icon: Tag },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "quick-wins", label: "Quick Wins", icon: Zap },
];

const SCORE_STAGES = [
  { label: "Current", score: 62 },
  { label: "Quick Wins", score: 72 },
  { label: "Title & Meta", score: 82 },
  { label: "Schema", score: 88 },
  { label: "Potential", score: 94 },
];

const SAMPLE_ISSUES = [
  { id: 1, title: "Meta description missing", severity: "high", difficulty: "easy", eta: "5 min" },
  { id: 2, title: "Title too short (28 chars)", severity: "medium", difficulty: "easy", eta: "2 min" },
  { id: 3, title: "No Open Graph image", severity: "medium", difficulty: "medium", eta: "15 min" },
];

const SAMPLE_QUICK_WINS = [
  { label: "Add meta description", copyValue: "Your compelling meta description here (150-160 chars)" },
  { label: "Optimize title", copyValue: "Your Brand | Primary Keyword - Secondary | Tagline" },
];

const BEFORE_TITLE = "Home | My Site";
const AFTER_TITLE = "Your Brand | Primary Keyword - Secondary | Tagline";

function CopyButton({ value, label }: { value: string; label: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard!");
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#eff6ff] to-[#e0e7ff] px-4 py-2.5 text-sm font-semibold text-[#4318ff] transition-colors hover:from-[#4318ff]/20 hover:to-[#7551ff]/20"
    >
      <Copy className="h-4 w-4" />
      {label}
    </button>
  );
}

const HAS_AUDIT_KEY = "rankypulse_has_audit";

export default function AuditResultsPage() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const urlParam = searchParams.get("url");
  const isSample = searchParams.get("sample") === "1";
  const [activeTab, setActiveTab] = useState(
    ["overview", "title-meta", "schema", "issues", "quick-wins"].includes(tabFromUrl || "")
      ? tabFromUrl!
      : "overview"
  );
  const [auditData, setAuditData] = useState<AuditData | null>(null);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t && ["overview", "title-meta", "schema", "issues", "quick-wins"].includes(t)) {
      setActiveTab(t);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(HAS_AUDIT_KEY, "1");
      window.dispatchEvent(new CustomEvent("rankypulse-has-audit"));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && urlParam && !isSample) {
      try {
        const stored = sessionStorage.getItem(AUDIT_RESULT_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as AuditData;
          setAuditData(parsed);
        }
      } catch {
        setAuditData(null);
      }
    }
  }, [urlParam, isSample]);

  const isRealAudit = !!auditData && !isSample;
  const currentScore = isRealAudit && auditData.scores?.seo != null
    ? auditData.scores.seo
    : SCORE_STAGES[0].score;
  const potentialScore = Math.min(
    100,
    currentScore +
      (isRealAudit && auditData.issues
        ? auditData.issues.filter((i) => i.severity === "high").length * 12 +
          auditData.issues.filter((i) => i.severity === "medium").length * 5
        : SCORE_STAGES[SCORE_STAGES.length - 1].score - SCORE_STAGES[0].score)
  );
  const top5Impact = Math.round(potentialScore - currentScore);
  const displayHost = isRealAudit && auditData.hostname
    ? auditData.hostname
    : "example.com";
  const issues = isRealAudit && auditData.issues?.length
    ? auditData.issues.map((i, idx) => ({
        id: idx + 1,
        title: i.title,
        severity: i.severity as "high" | "medium" | "low",
        difficulty: "easy" as const,
        eta: "5 min",
      }))
    : SAMPLE_ISSUES;

  return (
    <PageLayout className="pb-32">
      <Link
        href="https://rankypulse.com/audit"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-[#4318ff]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to audit
      </Link>

      {/* Top header: Score ring + potential + CTA */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="rounded-2xl border-2 border-gray-200/80 bg-white p-6 shadow-lg">
              <CircularProgress percentage={currentScore} size={120} />
              <p className="mt-2 text-center text-sm font-semibold text-gray-600">Current</p>
            </div>
            <div className="rounded-2xl border-2 border-green-200/80 bg-green-50/30 p-6 shadow-lg">
              <CircularProgress percentage={potentialScore} size={120} />
              <p className="mt-2 text-center text-sm font-semibold text-green-600">Potential</p>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2559] md:text-3xl">{displayHost}</h1>
            <p className="mt-1 text-gray-600">{isRealAudit ? "Audit report" : "Sample report"}</p>
            <p className="mt-4 text-lg font-semibold text-green-600">+{top5Impact} pts after fixes</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => toast.info("AI fixes will generate custom recommendations based on your audit. Coming soon.")}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate AI Fixes
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => toast.info("Export as PDF or CSV coming soon.")}
          >
            <Download className="mr-2 h-5 w-5" />
            Export
          </Button>
        </div>
      </div>

      {/* Impact Simulator */}
      <Card extra="p-6 md:p-8 mb-10" default={true}>
        <h3 className="mb-6 text-xl font-bold text-[#1B2559]">
          Projected Score Lift
        </h3>
        <p className="mb-6 text-gray-600">
          Forecast: current score → after quick wins → after high-priority fixes
        </p>
        <ScoreImpactChart
          stages={[
            { label: "Current", score: currentScore },
            { label: "Potential", score: potentialScore },
          ]}
        />
        <div className="mt-6 rounded-xl bg-gradient-to-r from-[#eff6ff] to-[#e0e7ff] p-4">
          <p className="font-semibold text-[#1B2559]">Top 5 fixes → +{top5Impact} points</p>
        </div>
      </Card>

      {/* Pill tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
              activeTab === id
                ? "bg-gradient-to-r from-[#4318ff] to-[#7551ff] text-white shadow-lg"
                : "bg-white text-gray-600 shadow-sm hover:bg-gray-50"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {(activeTab === "overview" || activeTab === "quick-wins") && (
        <div className="space-y-6">
          <Card extra="p-6 md:p-8" default={true}>
            <h4 className="mb-6 font-semibold text-[#1B2559]">
              {activeTab === "quick-wins" ? "Copy-ready fixes" : "Issues found"}
            </h4>
            {activeTab === "quick-wins" ? (
              <div className="space-y-6">
                {SAMPLE_QUICK_WINS.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border-2 border-gray-200 bg-gray-50/50 p-6"
                  >
                    <p className="mb-4 font-semibold text-[#1B2559]">{item.label}</p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <code className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-gray-700">
                        {item.copyValue}
                      </code>
                      <CopyButton value={item.copyValue} label="Copy" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="space-y-4">
                {issues.map((issue) => (
                  <li
                    key={issue.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        issue.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="flex-1 font-medium text-[#1B2559]">{issue.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}

      {(activeTab === "title-meta" || activeTab === "schema") && (
        <Card extra="p-6 md:p-8" default={true}>
          <h4 className="mb-6 font-semibold text-[#1B2559]">
            {activeTab === "title-meta" ? "Title & Meta Preview" : "Schema Markup"}
          </h4>
          {activeTab === "title-meta" && (
            <div className="mb-8 space-y-6">
              <div className="rounded-xl border-2 border-dashed border-red-200/80 bg-red-50/30 p-6">
                <p className="mb-2 text-sm font-semibold text-red-600">Before</p>
                <code className="text-lg font-medium">{BEFORE_TITLE}</code>
              </div>
              <div className="rounded-xl border-2 border-dashed border-green-200/80 bg-green-50/30 p-6">
                <p className="mb-2 text-sm font-semibold text-green-600">After</p>
                <code className="text-lg font-medium">{AFTER_TITLE}</code>
              </div>
            </div>
          )}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
              <p className="mb-3 text-sm font-medium text-gray-600">Suggested meta title</p>
              <code className="block rounded-xl bg-white px-4 py-3 text-sm">
                Your Brand | Primary Keyword - Secondary | Tagline
              </code>
              <div className="mt-4">
                <CopyButton value="Your Brand | Primary Keyword - Secondary | Tagline" label="Copy" />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-6">
              <p className="mb-3 text-sm font-medium text-gray-600">Suggested meta description</p>
              <code className="block rounded-xl bg-white px-4 py-3 text-sm">
                Compelling 150-160 character description that includes your primary keyword.
              </code>
              <div className="mt-4">
                <CopyButton value="Compelling 150-160 character description that includes your primary keyword." label="Copy" />
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "issues" && (
        <Card extra="p-6 md:p-8" default={true}>
          <h4 className="mb-6 font-semibold text-[#1B2559]">All issues</h4>
          <ul className="space-y-4">
            {issues.map((issue) => (
              <li
                key={issue.id}
                className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        issue.severity === "high"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {issue.difficulty}
                    </span>
                    <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#4318ff]">
                      ~{issue.eta}
                    </span>
                  </div>
                  <p className="mt-3 font-semibold text-[#1B2559]">{issue.title}</p>
                </div>
                <Link href="/audit/results">
                  <Button variant="secondary" size="sm">
                    Fix
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Sticky bottom action bar - pb-28 ensures content above is not overlapped */}
      <div className="sticky bottom-0 z-20 mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#4318ff] to-[#7551ff] p-6 text-white shadow-2xl lg:mb-4">
        <div>
          <h3 className="text-lg font-bold">Ready to fix your SEO?</h3>
          <p className="text-white/90">Start with the highest-impact changes first</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="https://rankypulse.com/auth/signup">
            <Button
              variant="secondary"
              className="bg-white text-[#4318ff] hover:bg-gray-100"
            >
              Upgrade for more audits
            </Button>
          </Link>
          <Link href="https://rankypulse.com/audit">
            <Button
              variant="secondary"
              className="border-2 border-white/50 bg-transparent text-white hover:bg-white/10"
            >
              Run another audit
            </Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
