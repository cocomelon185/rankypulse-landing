import type { Metadata } from "next";
import SignUpClientPage from "./SignUpClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Create Account | RankyPulse";
  const description =
    "Create your RankyPulse account to save audits, track scores, and access your dashboard.";

  return {
    title,
    description,
    alternates: { canonical: "/auth/signup" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/auth/signup",
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

export default function SignUpPage() {
  return <SignUpClientPage />;
}
