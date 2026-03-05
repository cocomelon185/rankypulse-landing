import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { CompetitorsClient } from "@/components/app-pages/CompetitorsClient";
export const metadata = { title: "Competitors — RankyPulse", robots: { index: false } };
export default async function CompetitorsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/competitors");
    return <CompetitorsClient />;
}
