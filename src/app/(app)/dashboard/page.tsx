import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — RankyPulse",
  description: "Track your SEO scores, view audit history, and manage your sites.",
  robots: { index: false, follow: false },
};

/** Skeleton shown while the dashboard suspends (e.g. during server-side data fetch) */
function DashboardSkeleton() {
  return (
    <div className="min-h-screen px-6 pt-24" style={{ background: "#0d0f14" }}>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-20 animate-pulse rounded-2xl bg-white/3" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/3" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/3" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-72 animate-pulse rounded-2xl bg-white/3" />
          <div className="h-72 animate-pulse rounded-2xl bg-white/3" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/3" />
      </div>
    </div>
  );
}

async function DashboardContent({ domain }: { domain: string }) {
  try {
    // Fetch dashboard metrics from API
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard/metrics?domain=${encodeURIComponent(domain)}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Failed to fetch dashboard metrics:", res.statusText);
      throw new Error("Failed to fetch metrics");
    }

    const dashboardData = await res.json();

    return <DashboardClient {...dashboardData} />;
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0f14" }}>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white mb-2">Unable to load dashboard</h2>
          <p style={{ color: "#6B7A99" }}>Please try refreshing the page</p>
        </div>
      </div>
    );
  }
}

export default async function DashboardPage() {
  // Auth check (AppShell will redirect, but doing it here too for safety)
  const session = await getServerSession();
  if (!session) {
    redirect("/auth/signin");
  }

  // For now, use a default domain. In the future, this could come from:
  // 1. User's selected domain in their profile
  // 2. Query parameter: /dashboard?domain=example.com
  // 3. User's first project from database
  const domain = "rankypulse.com";

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent domain={domain} />
    </Suspense>
  );
}
