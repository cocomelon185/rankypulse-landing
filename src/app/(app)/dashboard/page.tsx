import type { Metadata } from "next";
import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — RankyPulse",
  description: "Track your SEO scores, view audit history, and manage your sites.",
  robots: { index: false, follow: false },
};

/** Skeleton shown while the dashboard suspends */
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

async function DashboardContent({ userId, domain }: { userId: string; domain: string }) {
  try {
    // Call Supabase directly — no same-server fetch auth issues
    const dashboardData = await getDashboardData(userId, domain);
    return <DashboardClient {...dashboardData} />;
  } catch (error) {
    console.error("Dashboard data error:", error);
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent userId={userId} domain="" />
    </Suspense>
  );
}
