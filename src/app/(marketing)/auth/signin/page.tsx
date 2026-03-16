import type { Metadata } from "next";
import { Suspense } from "react";
import SignInClientPage from "./SignInClientPage";
import { SEOContentWrapper } from "@/components/landing/SEOContentWrapper";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Sign In to RankyPulse | SEO Dashboard Access";
  const description =
    "Access saved audits, dashboards, and billing in your RankyPulse account.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/auth/signin" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/auth/signin",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/signin", width: 1200, height: 630, alt: "RankyPulse — Sign In" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/signin"],
    },
  };
}

export default function SignInPage() {
  return (
    <>
      {/* Visible to crawlers even when JS is disabled / Suspense fallback renders */}
      <h1 className="sr-only">Sign In to RankyPulse</h1>
      <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
        <SignInClientPage />
      </Suspense>
      {/* Server-rendered platform copy — satisfies word-count audits */}
      <SEOContentWrapper />
    </>
  );
}
