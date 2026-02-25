import type { Metadata } from "next";
import { AuditDomainClient } from "./AuditDomainClient";

type Props = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  return {
    title: `${domain} SEO Audit — RankyPulse`,
    description: `Free SEO audit for ${domain}. See what's broken, how much traffic it's costing you, and how to fix each issue in minutes.`,
    // Don't index individual audit result pages — they're personalized/dynamic
    robots: { index: false, follow: false },
  };
}

export default async function AuditDomainPage({ params }: Props) {
  const { domain } = await params;
  return <AuditDomainClient domain={domain} />;
}
