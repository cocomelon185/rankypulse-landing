import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { KeywordsClient } from "@/components/app-pages/KeywordsClient";
export const metadata = { title: "Keyword Research — RankyPulse", robots: { index: true } };
export default async function KeywordsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/keywords");
    return <KeywordsClient />;
}
