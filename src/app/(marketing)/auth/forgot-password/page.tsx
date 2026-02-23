import type { Metadata } from "next";
import ForgotPasswordClientPage from "./ForgotPasswordClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/auth/forgot-password" },
    robots: { index: true, follow: true },
  };
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClientPage />;
}
