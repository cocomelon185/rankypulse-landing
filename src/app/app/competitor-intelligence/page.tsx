import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CompetitorIntelligenceClient } from "@/components/app-pages/CompetitorIntelligenceClient";

export const metadata = {
    title: "Competitor Analysis Tool | RankyPulse",
    description: "Track competitors, analyze their SEO strategies, and discover opportunities with RankyPulse's comprehensive competitor analysis tool.",
    robots: { index: true, follow: true },
    alternates: { canonical: "https://rankypulse.com/app/competitor-intelligence" },
};

export default async function CompetitorIntelligencePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/competitor-intelligence");
    return <CompetitorIntelligenceClient />;
}
