import type { Metadata } from "next";
import { Suspense } from "react";
import SignInClientPage from "./SignInClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Sign In | RankyPulse";
  const description =
    "Access saved audits, dashboards, and billing in your RankyPulse account.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/auth/signin" },
    robots: { index: false, follow: false },
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
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
      <SignInClientPage />
    </Suspense>
  );
}
