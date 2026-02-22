"use client";

import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useBilling } from "@/hooks/useBilling";
import { CreditCard, Zap, ChevronRight } from "lucide-react";

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export default function BillingPage() {
  const { plan, nextResetDate, upgradePlan } = useBilling();

  return (
    <PageLayout>
      <PageHeader
        icon={<CreditCard className="h-7 w-7" />}
        title="Billing"
        subtitle="Manage your plan and billing"
      />

      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-2xl border-2 border-gray-200/80 bg-white p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Current plan</span>
            <span className="rounded-full bg-gradient-to-r from-[#4318ff]/20 to-[#7551ff]/20 px-4 py-1.5 text-sm font-semibold text-[#4318ff]">
              {PLAN_LABELS[plan] || plan}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Next reset: <strong>{new Date(nextResetDate).toLocaleDateString()}</strong>
          </p>
          {plan === "free" && (
            <Link href="/pricing" className="mt-4 block">
              <Button size="lg" className="w-full">
                <Zap className="mr-2 h-5 w-5" />
                Upgrade to Starter or Pro
              </Button>
            </Link>
          )}
        </div>

        <Link
          href="/pricing"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
        >
          <span className="font-medium text-[#1B2559]">View all plans</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>
      </div>
    </PageLayout>
  );
}
