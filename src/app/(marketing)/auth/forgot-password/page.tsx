import type { Metadata } from "next";
import ForgotPasswordClientPage from "./ForgotPasswordClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Reset Password | RankyPulse";
  const description =
    "Reset your RankyPulse password to regain access to saved audits, dashboards, and billing.";

  return {
    title,
    description,
    alternates: { canonical: "/auth/forgot-password" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/auth/forgot-password",
      siteName: "RankyPulse",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClientPage />;
}
