"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/horizon";
import { StatCard } from "@/components/layout/StatCard";
import { SectionCard } from "@/components/layout/SectionCard";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { LineAreaChart } from "@/components/charts/LineAreaChart";
import { Skeleton } from "@/components/ui/skeleton";
import QuickWinsPage from "@/components/quickwins/QuickWinsPage";
import {
  BarChart3,
  Target,
  Zap,
  FileSearch,
  Check,
  ChevronRight,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";

const QUICK_START = [
  { label: "Run your first audit", done: true },
  { label: "Fix meta title & description", done: true },
  { label: "Add schema markup", done: false },
  { label: "Track discoverability score", done: false },
];

const RECENT_AUDITS = [
  { url: "example.com", score: 78, date: "Today", status: "complete" },
  { url: "mysite.com", score: 62, date: "Yesterday", status: "complete" },
  { url: "project.io", score: 45, date: "2 days ago", status: "complete" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams?.get("view") ?? "";

  if (view === "quickwins") {
    return <QuickWinsPage />;
  }

  return <DashboardMain />;
}

function DashboardMain() {
  const quickStartDone = QUICK_START.filter((x) => x.done).length;
  const quickStartTotal = QUICK_START.length;
  const progressPercent = Math.round((quickStartDone / quickStartTotal) * 100);

  return (
    <PageLayout>
      <PageHeader
        icon={<LayoutDashboard className="h-7 w-7" />}
        title="Dashboard"
        subtitle="Overview of your SEO performance and audits"
      />

      {/* Stat cards */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          name="Audits this month"
          value="3"
          icon={<FileSearch className="h-7 w-7 text-[#4318ff]" />}
          iconBg="bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]"
        />
        <StatCard
          name="Avg. discoverability"
          value="62"
          icon={<BarChart3 className="h-7 w-7 text-[#4318ff]" />}
          iconBg="bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]"
          trend={{ value: 12, positive: true }}
        />
        <StatCard
          name="Quick wins fixed"
          value="8"
          icon={<Zap className="h-7 w-7 text-[#4318ff]" />}
          iconBg="bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]"
          sparkline={[2, 3, 5, 4, 6, 7, 8]}
        />
        <StatCard
          name="Potential score"
          value="94"
          icon={<Target className="h-7 w-7 text-[#4318ff]" />}
          iconBg="bg-gradient-to-br from-[#eff6ff] to-[#e0e7ff]"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quick Start checklist */}
        <SectionCard className="overflow-hidden p-6 lg:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-[#1B2559]">
              <Check className="h-5 w-5 text-green-500" />
              Quick Start
            </h3>
            <span className="rounded-full bg-[#4318ff]/10 px-3 py-1 text-xs font-semibold text-[#4318ff]">
              {progressPercent}%
            </span>
          </div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#4318ff] to-[#7551ff] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <ul className="space-y-3">
            {QUICK_START.map((item, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 rounded-xl p-3 ${
                  item.done ? "bg-green-50/80" : "bg-gray-50"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    item.done ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item.done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={
                    item.done ? "text-gray-600 line-through" : "font-medium text-gray-800"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
          <Link href="https://rankypulse.com/audit" className="mt-6 block">
            <Button variant="secondary" size="sm" className="w-full">
              Run new audit
            </Button>
          </Link>
        </SectionCard>

        {/* Next Best Action */}
        <SectionCard className="overflow-hidden p-6 lg:col-span-2">
          <h3 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
            <Target className="h-5 w-5 text-[#4318ff]" />
            Next Best Action
          </h3>
          <div className="rounded-2xl border border-[#4318ff]/20 bg-gradient-to-r from-[#eff6ff] to-white p-6">
            <h4 className="font-semibold text-[#1B2559]">
              Add schema markup to your homepage
            </h4>
            <p className="mt-2 text-sm text-gray-600">
              Structured data can boost your search visibility by up to 15%.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/audit/results">
                <Button size="sm">Fix now</Button>
              </Link>
              <Link href="/audit/results">
                <Button variant="ghost" size="sm">
                  Learn more
                </Button>
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Score trend */}
      <Card extra="p-6 md:p-8 mt-10" default={true}>
        <h3 className="mb-6 font-semibold text-[#1B2559]">
          Discoverability score trend
        </h3>
        <LineAreaChart
          series={[
            { name: "Score", data: [52, 55, 58, 62, 65, 68, 72] },
          ]}
          categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
        />
      </Card>

      {/* Recent audits table */}
      <Card extra="p-6 md:p-8 mt-10" default={true}>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-semibold text-[#1B2559]">Recent audits</h3>
          <Link
            href="https://rankypulse.com/audit"
            className="flex items-center gap-1 text-sm font-semibold text-[#4318ff] transition-colors hover:underline"
          >
            Run new <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-4 text-left text-sm font-semibold text-gray-600">
                  URL
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-gray-600">
                  Score
                </th>
                <th className="pb-4 text-left text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="pb-4 text-right text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {RECENT_AUDITS.map((audit) => (
                <tr key={audit.url} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                  <td className="py-4 font-medium text-[#1B2559]">
                    {audit.url}
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
                        audit.score >= 70
                          ? "bg-green-100 text-green-700"
                          : audit.score >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {audit.score}%
                    </span>
                  </td>
                  <td className="py-4 text-gray-600">{audit.date}</td>
                  <td className="py-4 text-right">
                    <Link
                      href="/audit/results"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[#4318ff] transition-colors hover:underline"
                    >
                      View <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </PageLayout>
  );
}

export default function DashboardClientPage() {
  return (
    <Suspense
      fallback={
        <PageLayout>
          <Skeleton className="mb-8 h-24 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </PageLayout>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
