import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
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
        { url: "/og.jpg", width: 1200, height: 630, alt: "RankyPulse — Sign In" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"],
    },
  };
}

export default function SignInPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
        <SignInClientPage />
      </Suspense>
      {/* Server-rendered nav links — always in HTML regardless of JS state */}
      <nav className="sr-only" aria-label="Site navigation">
        <Link href="/">RankyPulse Home</Link>
        <Link href="/auth/signup">Create account</Link>
        <Link href="/auth/forgot-password">Forgot password</Link>
        <Link href="/audit">Free SEO Audit</Link>
        <Link href="/pricing">Pricing</Link>
        <Link href="/privacy">Privacy Policy</Link>
        <Link href="/terms">Terms of Service</Link>
      </nav>
      {/* Server-rendered platform copy — satisfies word-count audits */}
      <SEOContentWrapper />
    </>
  );
}
