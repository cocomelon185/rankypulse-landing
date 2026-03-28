import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: { canonical: "https://rankypulse.com/terms" },
};

export default function TermsAndConditionsRedirect() {
  permanentRedirect("/terms");
}
