import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RankTrackingClient } from "@/components/app-pages/RankTrackingClient";
export const metadata = {
    title: "SERP Rank Tracking & Position Monitor — RankyPulse",
    description: "Track your Google search rankings daily, monitor SERP position changes, and get alerts when rankings drop.",
    alternates: { canonical: "https://rankypulse.com/app/rank-tracking" },
};
export default async function RankTrackingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/rank-tracking");
    return <RankTrackingClient />;
}
