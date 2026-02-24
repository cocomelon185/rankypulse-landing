import type { Metadata } from "next";
import { Suspense } from "react";
import ConversionDashboardClient from "./AnalyticsClient";
import { Skeleton } from "@/components/ui/skeleton";
import { PageLayout } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Conversion Dashboard | RankyPulse",
  description: "Internal conversion analytics and funnel metrics.",
  robots: { index: false, follow: false },
};

export default function AnalyticsPage() {
  return (
    <PageLayout>
      <Suspense
        fallback={
          <>
            <Skeleton className="mb-8 h-24 w-full rounded-2xl" />
            <Skeleton className="mb-6 h-32 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </>
        }
      >
        <ConversionDashboardClient />
      </Suspense>
    </PageLayout>
  );
}
