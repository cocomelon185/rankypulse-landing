"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { LockedOverlay } from "@/components/layout/LockedOverlay";
import { Button } from "@/components/ui/button";
import { Users, Lock, Target, Zap } from "lucide-react";

const MOCK_COMPETITORS = [
  { name: "Competitor A", score: 92 },
  { name: "You", score: 78, isYou: true },
  { name: "Competitor B", score: 75 },
  { name: "Competitor C", score: 68 },
];

const WHY_THEY_OUTRANK = [
  { title: "Stronger backlink profile", impact: "High" },
  { title: "Better meta optimization", impact: "Medium" },
  { title: "More comprehensive schema", impact: "High" },
];

const ACTIONS_TO_BEAT = [
  { label: "Build 5 quality backlinks", done: false },
  { label: "Optimize meta tags", done: true },
  { label: "Add structured data", done: false },
];

export default function CompetitorsClientPage() {
  const router = useRouter();
  return (
    <PageLayout>
      <PageHeader
        icon={<Users className="h-7 w-7" />}
        title="Competitor Gap Finder"
        subtitle="See how you stack up against competitors and identify quick wins"
      />

      {/* Side-by-side compare cards */}
      <Card extra="p-6 md:p-8 relative overflow-hidden mb-10" default={true}>
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm">
          <Lock className="h-4 w-4" />
          Pro feature
        </div>
        <h3 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
          <Users className="h-5 w-5 text-[#4318ff]" />
          You vs. competitors (preview)
        </h3>
        <div className="space-y-4">
          {MOCK_COMPETITORS.map((c) => (
            <div
              key={c.name}
              className={`flex items-center justify-between rounded-xl border-2 px-6 py-4 ${
                c.isYou
                  ? "border-[#4318ff] bg-gradient-to-r from-[#eff6ff] to-[#e0e7ff]"
                  : "border-gray-200 bg-white"
              }`}
            >
              <span className="font-semibold text-[#1B2559]">
                {c.name}
                {c.isYou && (
                  <span className="ml-3 rounded-full bg-[#4318ff] px-3 py-1 text-xs font-semibold text-white">
                    You
                  </span>
                )}
              </span>
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff]"
                    style={{ width: `${c.score}%` }}
                  />
                </div>
                <span
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                    c.score >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {c.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-[#eff6ff] to-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600">
            Add your competitors and get AI-powered gap analysis
          </p>
          <Button onClick={() => router.push("/pricing")}>Upgrade to Pro</Button>
        </div>
        <LockedOverlay onUpgrade={() => window.location.href = "/pricing"} blur />
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Why they outrank you */}
        <Card extra="p-6 md:p-8" default={true}>
          <h4 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
            <Target className="h-5 w-5 text-[#4318ff]" />
            Why they outrank you
          </h4>
          <div className="space-y-4">
            {WHY_THEY_OUTRANK.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4"
              >
                <p className="font-medium text-[#1B2559]">{item.title}</p>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.impact === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {item.impact}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions to beat them */}
        <Card extra="p-6 md:p-8" default={true}>
          <h4 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
            <Zap className="h-5 w-5 text-amber-500" />
            Actions to beat them
          </h4>
          <div className="space-y-3">
            {ACTIONS_TO_BEAT.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-4 rounded-xl p-4 ${
                  item.done ? "bg-green-50/80" : "bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${
                    item.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.done ? "✓" : i + 1}
                </span>
                <span
                  className={
                    item.done ? "font-medium text-gray-600 line-through" : "font-medium text-[#1B2559]"
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
}
