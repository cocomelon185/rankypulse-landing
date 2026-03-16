import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { BacklinksClient } from "@/components/app-pages/BacklinksClient";
export const metadata = { title: "Backlinks — RankyPulse", robots: { index: true } };
export default async function BacklinksPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/backlinks");
    return <BacklinksClient />;
}
