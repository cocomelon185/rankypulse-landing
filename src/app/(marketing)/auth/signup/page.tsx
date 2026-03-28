import type { Metadata } from "next";
import { Suspense } from "react";
import SignUpClientPage from "./SignUpClientPage";
import { SEOContentWrapper } from "@/components/landing/SEOContentWrapper";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Sign Up for RankyPulse — Free SEO Audits";
  const description =
    "Create your RankyPulse account to save audits, track scores, and access your dashboard.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/auth/signup" },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: "/auth/signup",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/signup", width: 1200, height: 630, alt: "RankyPulse — Sign Up" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/signup"],
    },
  };
}

export default function SignUpPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
        <SignUpClientPage />
      </Suspense>
      <SEOContentWrapper />
    </>
  );
}
