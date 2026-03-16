import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { KeywordsClient } from "@/components/app-pages/KeywordsClient";
export const metadata = {
    title: "Keyword Research & Tracking Dashboard — RankyPulse",
    description: "Discover high-value keywords, track rankings, and monitor search volume trends with RankyPulse keyword research tools.",
    alternates: { canonical: "https://rankypulse.com/app/keywords" },
};
export default async function KeywordsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/keywords");
    return <KeywordsClient />;
}
