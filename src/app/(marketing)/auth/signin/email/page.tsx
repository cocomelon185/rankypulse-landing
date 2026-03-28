import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInEmailClientPage } from "./SignInEmailClientPage";

export const metadata: Metadata = {
  title: { absolute: "Sign In with Email | RankyPulse" },
  robots: { index: false },
  alternates: { canonical: "https://rankypulse.com/auth/signin/email" },
};

export default function SignInEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
      <SignInEmailClientPage />
    </Suspense>
  );
}
