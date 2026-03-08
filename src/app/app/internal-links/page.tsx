import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { InternalLinksClient } from "@/components/app-pages/InternalLinksClient";

export const metadata = { title: "Internal Links — RankyPulse", robots: { index: false } };

export default async function InternalLinksPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/internal-links");
    return <InternalLinksClient />;
}
