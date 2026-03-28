import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordClientPage } from "./ResetPasswordClientPage";

export const metadata: Metadata = {
  title: { absolute: "Create a New Password | RankyPulse" },
  robots: { index: false },
  alternates: { canonical: "https://rankypulse.com/auth/reset-password" },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClientPage />
    </Suspense>
  );
}
