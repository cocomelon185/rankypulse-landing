import type { Metadata } from "next";
import { Suspense } from "react";
import AuditResultsClientPage from "./AuditResultsClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Audit Results | RankyPulse";
  const description =
    "View your SEO audit score, prioritized issues, and copy-ready fixes.";

  return {
    title,
    description,
    alternates: { canonical: "/audit/results" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/audit/results",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/results", width: 1200, height: 630, alt: "RankyPulse — Audit Results" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/results"],
    },
  };
}

export default function AuditResultsPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-3xl p-6"><div>Loading…</div></main>}>
      <AuditResultsClientPage />
    </Suspense>
  );
}
