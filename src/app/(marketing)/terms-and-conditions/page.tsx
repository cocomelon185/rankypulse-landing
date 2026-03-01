import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "https://rankypulse.com/terms" },
};

export default function TermsAndConditionsRedirect() {
  redirect("/terms");
}
