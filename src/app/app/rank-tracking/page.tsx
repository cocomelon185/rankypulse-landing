import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RankTrackingClient } from "@/components/app-pages/RankTrackingClient";
export const metadata = { title: "Rank Tracking — RankyPulse", robots: { index: false } };
export default async function RankTrackingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/rank-tracking");
    return <RankTrackingClient />;
}
