import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AuditDomainClient } from "@/components/app-pages/AuditDomainClient";

// Next.js 15: params is a Promise — must be awaited before accessing properties
export async function generateMetadata({ params }: { params: Promise<{ domain: string }> }): Promise<Metadata> {
    const { domain } = await params;
    return {
        title: `Audit: ${decodeURIComponent(domain)} — RankyPulse`,
        robots: { index: false, follow: false },
    };
}

export default async function AuditDomainPage({ params }: { params: Promise<{ domain: string }> }) {
    const { domain } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect(`/auth/signin?callbackUrl=/app/audit/${domain}`);
    return <AuditDomainClient domain={decodeURIComponent(domain)} />;
}
