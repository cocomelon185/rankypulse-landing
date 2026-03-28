import type { Metadata } from "next";
import { Suspense } from "react";
import ForgotPasswordClientPage from "./ForgotPasswordClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Reset Password | RankyPulse";
  const description =
    "Reset your RankyPulse password to regain access to saved audits, dashboards, and billing.";

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/auth/forgot-password" },
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: "/auth/forgot-password",
      siteName: "RankyPulse",
      type: "website",
      images: [
        { url: "/og/forgot-password", width: 1200, height: 630, alt: "RankyPulse — Reset Password" },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og/forgot-password"],
    },
  };
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
      <ForgotPasswordClientPage />
    </Suspense>
  );
}
