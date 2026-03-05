import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { ActionCenterClient } from "@/components/app-pages/ActionCenterClient";
export const metadata = { title: "Action Center — RankyPulse", robots: { index: false } };
export default async function ActionCenterPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/action-center");
    return <ActionCenterClient />;
}
