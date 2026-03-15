import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyClientPage } from "./VerifyClientPage";

export const metadata: Metadata = {
  title: { absolute: "Verify Your Email | RankyPulse" },
  robots: { index: false },
  alternates: { canonical: "https://rankypulse.com/auth/verify" },
};

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyClientPage />
    </Suspense>
  );
}
