"use client";

import { useRouter } from "next/navigation";
import { Card, CircularProgress } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { LockedOverlay } from "@/components/layout/LockedOverlay";
import { Button } from "@/components/ui/button";
import { LineAreaChart } from "@/components/charts/LineAreaChart";
import { BarChart3, Lock, Search, Brain, Building2 } from "lucide-react";

const SCORE_CARDS = [
  { name: "Search Visibility", score: 78, icon: Search },
  { name: "AI Visibility", score: 65, icon: Brain },
  { name: "Brand Presence", score: 82, icon: Building2 },
];

export default function DiscoverabilityClientPage() {
  const router = useRouter();
  const goToPricing = () => router.push("/pricing");
  return (
    <PageLayout>
      <PageHeader
        icon={<BarChart3 className="h-7 w-7" />}
        title="Discoverability Dashboard"
        subtitle="Track your SEO score over time and see exactly what moves the needle"
      />

      {/* Score cards row */}
      <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SCORE_CARDS.map((sc) => {
          const Icon = sc.icon;
          return (
          <Card key={sc.name} extra="p-6 flex flex-col items-center" default={true}>
            <Icon className="mb-4 h-10 w-10 text-[#4318ff]" />
            <p className="text-sm font-medium text-gray-600">{sc.name}</p>
            <p className="text-2xl font-bold text-[#1B2559]">{sc.score}%</p>
          </Card>
          );
        })}
        <Card extra="p-6 flex flex-col items-center" default={true}>
          <BarChart3 className="mb-4 h-10 w-10 text-[#4318ff]" />
          <p className="text-sm font-medium text-gray-600">Overall</p>
          <CircularProgress percentage={85} size={80} />
        </Card>
      </div>

      {/* Preview + gate with blur overlay */}
      <Card extra="p-6 md:p-8 relative overflow-hidden" default={true}>
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm">
          <Lock className="h-4 w-4" />
          Pro feature
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h3 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
              <BarChart3 className="h-5 w-5 text-[#4318ff]" />
              Score over time
            </h3>
            <LineAreaChart
              series={[{ name: "Discoverability", data: [52, 58, 65, 72, 78, 82, 85] }]}
              categories={["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7"]}
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <CircularProgress percentage={85} title="Current score" size={140} />
            <p className="mt-6 text-center text-gray-600">
              Unlock to track your site&apos;s discoverability over time
            </p>
            <Button className="mt-6" onClick={goToPricing} size="lg">
              Upgrade to Pro
            </Button>
          </div>
        </div>
        <LockedOverlay onUpgrade={goToPricing} blur />
      </Card>

      {/* What improved / What to fix next */}
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card extra="p-6 md:p-8" default={true}>
          <h4 className="mb-4 font-semibold text-[#1B2559]">What improved</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 rounded-xl bg-green-50/80 p-3">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Meta description added
            </li>
            <li className="flex items-center gap-3 rounded-xl bg-green-50/80 p-3">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Title optimized
            </li>
          </ul>
        </Card>
        <Card extra="p-6 md:p-8" default={true}>
          <h4 className="mb-4 font-semibold text-[#1B2559]">What to fix next</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 rounded-xl bg-amber-50/80 p-3">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Add schema markup
            </li>
            <li className="flex items-center gap-3 rounded-xl bg-amber-50/80 p-3">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Improve AI visibility signals
            </li>
          </ul>
        </Card>
      </div>

      {/* AI readiness panel */}
      <Card extra="p-6 md:p-8 mt-10" default={true}>
        <h4 className="mb-6 font-semibold text-[#1B2559]">AI readiness checklist</h4>
        <div className="space-y-3">
          {["Structured data present", "Clear headings hierarchy", "Meta tags optimized", "Content signals"].map((item, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              <span className={`h-5 w-5 rounded-full ${i < 3 ? "bg-green-500" : "bg-gray-300"}`} />
              <span className={i < 3 ? "font-medium text-gray-800" : "text-gray-500"}>{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageLayout>
  );
}
