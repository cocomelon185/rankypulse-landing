import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuditDomainClient } from "@/components/app-pages/AuditDomainClient";

export async function generateMetadata({ params }: { params: { domain: string } }): Promise<Metadata> {
    return {
        title: `Audit: ${decodeURIComponent(params.domain)} — RankyPulse`,
        robots: { index: false, follow: false },
    };
}

export default async function AuditDomainPage({ params }: { params: { domain: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect(`/auth/signin?callbackUrl=/app/audit/${params.domain}`);
    return <AuditDomainClient domain={decodeURIComponent(params.domain)} />;
}
