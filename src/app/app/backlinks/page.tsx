import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { BacklinksClient } from "@/components/app-pages/BacklinksClient";
export const metadata = {
    title: "Backlink Analysis & Monitor — RankyPulse",
    description: "Analyze your backlink profile, find toxic links, and discover new link-building opportunities with RankyPulse.",
    alternates: { canonical: "https://rankypulse.com/app/backlinks" },
};
export default async function BacklinksPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/backlinks");
    return <BacklinksClient />;
}
