import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CompetitorIntelligenceClient } from "@/components/app-pages/CompetitorIntelligenceClient";

export const metadata = { title: "Competitor Intelligence — RankyPulse", robots: { index: false } };

export default async function CompetitorIntelligencePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/competitor-intelligence");
    return <CompetitorIntelligenceClient />;
}
