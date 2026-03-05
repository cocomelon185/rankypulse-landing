import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SettingsClient } from "@/components/app-pages/SettingsClient";
export const metadata = { title: "Settings — RankyPulse", robots: { index: false } };
export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/settings");
    return <SettingsClient />;
}
