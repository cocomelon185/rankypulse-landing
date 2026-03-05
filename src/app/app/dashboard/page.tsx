import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppDashboardClient } from "@/components/app-pages/AppDashboardClient";

export const metadata: Metadata = {
    title: "Dashboard — RankyPulse",
    description: "Mission control for all your SEO projects.",
    robots: { index: false, follow: false },
};

export default async function AppDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect("/auth/signin?callbackUrl=/app/dashboard");
    }
    return <AppDashboardClient userName={session.user.name || "there"} />;
}
