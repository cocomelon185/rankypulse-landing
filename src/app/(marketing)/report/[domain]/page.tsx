import type { Metadata } from "next";
import { Suspense } from "react";
import { AuditDomainClient } from "./AuditDomainClient";

type Props = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  return {
    // Uses root layout title template → "stripe.com — SEO Audit | RankyPulse"
    title: `${domain} — SEO Audit`,
    description: `Free SEO audit for ${domain}. See what's broken, how much traffic it's costing you, and how to fix each issue in minutes.`,
    robots: { index: false, follow: false },
  };
}

export default async function AuditDomainPage({ params }: Props) {
  const { domain } = await params;
  return (
    <Suspense fallback={null}>
      <AuditDomainClient domain={domain} />
    </Suspense>
  );
}
