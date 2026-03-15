import type { Metadata } from "next";
import { Suspense } from "react";
import AuditResultsClientPage from "@/app/(app)/audit/results/AuditResultsClientPage";

export const metadata: Metadata = {
  title: { absolute: "Audit Results | RankyPulse" },
  description: "Review your comprehensive SEO audit results with detailed issue analysis and actionable recommendations to improve your site's search performance.",
  alternates: { canonical: "/audit/results" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Audit Results | RankyPulse",
    description: "Get your SEO audit score, see critical issues ranked by impact, and implement verified fixes to boost organic traffic.",
    url: "/audit/results",
    siteName: "RankyPulse",
    type: "website",
    images: [{ url: "/og/results", width: 1200, height: 630, alt: "RankyPulse — Audit Results" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Audit Results",
    description: "Your SEO audit is complete. Discover prioritized issues and ready-to-implement fixes for better rankings.",
    images: ["/og/results"],
  },
};

export default function AuditResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-6">
          <div>Loading…</div>
        </main>
      }
    >
      <AuditResultsClientPage />
    </Suspense>
  );
}
