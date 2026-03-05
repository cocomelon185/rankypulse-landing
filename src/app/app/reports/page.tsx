import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ReportsClient } from "@/components/app-pages/ReportsClient";
export const metadata = { title: "Reports — RankyPulse", robots: { index: false } };
export default async function ReportsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/reports");
    return <ReportsClient />;
}
