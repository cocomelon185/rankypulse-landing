import type { Metadata } from "next";
import { Suspense } from "react";
import AuditResultsClientPage from "./AuditResultsClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/audit/results" },
    robots: { index: true, follow: true },
  };
}

export default function AuditResultsPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-6"><div>Loading…</div></main>}>
      <AuditResultsClientPage />
    </Suspense>
  );
}
