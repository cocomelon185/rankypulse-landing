import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { IntegrationsClient } from "@/components/app-pages/IntegrationsClient";
export const metadata = { title: "Integrations — RankyPulse", robots: { index: false } };
export default async function IntegrationsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/integrations");
    return <IntegrationsClient />;
}
