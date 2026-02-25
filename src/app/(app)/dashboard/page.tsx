import type { Metadata } from "next";
import { Suspense } from "react";
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

export default function DashboardPage() {
  /*
   * To wire real Supabase data, fetch it here (server component) and pass
   * as props to DashboardClient:
   *
   * const session = await getServerSession(authOptions);
   * if (!session) redirect('/signin');
   * const dashData = await getDashboardData(session.user.id);
   * return <DashboardClient {...dashData} />;
   */
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  );
}
