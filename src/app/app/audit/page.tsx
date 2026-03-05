import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuditIndexClient } from "@/components/app-pages/AuditIndexClient";

export const metadata: Metadata = {
    title: "Site Audit — RankyPulse",
    robots: { index: false, follow: false },
};

export default async function AuditIndexPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/app/audit");
    return <AuditIndexClient />;
}
