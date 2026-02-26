import type { Metadata } from "next";
import { Suspense } from "react";
import ForgotUsernameClientPage from "./ForgotUsernameClientPage";

export const metadata: Metadata = {
  title: "Forgot Username | RankyPulse",
  description: "Get a reminder of your RankyPulse username.",
  robots: { index: false },
};

export default function ForgotUsernamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
      <ForgotUsernameClientPage />
    </Suspense>
  );
}
