import type { Metadata } from "next";
import SignInClientPage from "./SignInClientPage";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Sign In | RankyPulse";
  const description =
    "Access saved audits, dashboards, and billing in your RankyPulse account.";

  return {
    title,
    description,
    alternates: { canonical: "/auth/signin" },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: "/auth/signin",
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

export default function SignInPage() {
  return <SignInClientPage />;
}
