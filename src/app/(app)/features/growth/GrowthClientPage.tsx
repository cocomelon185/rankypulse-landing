"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/horizon";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { LockedOverlay } from "@/components/layout/LockedOverlay";
import { Button } from "@/components/ui/button";
import { LineAreaChart } from "@/components/charts/LineAreaChart";
import { TrendingUp, Lock, AlertCircle } from "lucide-react";

export default function GrowthClientPage() {
  const router = useRouter();
  return (
    <PageLayout>
      <PageHeader
        icon={<TrendingUp className="h-7 w-7" />}
        title="Growth Tracker"
        subtitle="Monitor rankings and discoverability trends in one place"
      />

      {/* Preview + gate with blur overlay */}
      <Card extra="p-6 md:p-8 relative overflow-hidden" default={true}>
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm">
          <Lock className="h-4 w-4" />
          Pro feature
        </div>
        <h3 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
          <TrendingUp className="h-5 w-5 text-[#4318ff]" />
          Ranking trends (preview)
        </h3>
        <LineAreaChart
          series={[
            { name: "Primary keyword", data: [12, 15, 18, 22, 19, 25, 28] },
            { name: "Secondary keyword", data: [45, 42, 48, 52, 50, 55, 58] },
          ]}
          categories={["7d ago", "6d", "5d", "4d", "3d", "2d", "Today"]}
        />
        <div className="mt-6 flex flex-col gap-4 rounded-xl bg-gradient-to-r from-[#eff6ff] to-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-gray-600">
            Unlock full ranking history and competitor comparison
          </p>
          <Button onClick={() => router.push("/pricing")}>Upgrade to Pro</Button>
        </div>
        <LockedOverlay onUpgrade={() => window.location.href = "/pricing"} blur placement="growth" />
      </Card>

      {/* Timeline cards */}
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card extra="p-6" default={true}>
          <h4 className="mb-3 font-semibold text-[#1B2559]">Weekly snapshots</h4>
          <p className="text-sm text-gray-600">
            Compare your scores week over week
          </p>
        </Card>
        <Card extra="p-6" default={true}>
          <h4 className="mb-3 font-semibold text-[#1B2559]">Keyword tracking</h4>
          <p className="text-sm text-gray-600">
            Track up to 50 keywords across search engines
          </p>
        </Card>
        <Card extra="p-6" default={true}>
          <h4 className="mb-3 font-semibold text-[#1B2559]">Insights & alerts</h4>
          <p className="text-sm text-gray-600">
            Get notified when rankings change significantly
          </p>
        </Card>
      </div>

      {/* Insights panel */}
      <Card extra="p-6 md:p-8 mt-10" default={true}>
        <h4 className="mb-6 flex items-center gap-2 font-semibold text-[#1B2559]">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Insights & alerts
        </h4>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-6">
          <p className="font-medium text-amber-800">Ranking drop detected</p>
          <p className="mt-1 text-sm text-amber-700">
            Your primary keyword dropped 3 positions. Check recent changes.
          </p>
          <Link href="/audit/results">
            <Button variant="secondary" size="sm" className="mt-4">
              View details
            </Button>
          </Link>
        </div>
      </Card>
    </PageLayout>
  );
}
