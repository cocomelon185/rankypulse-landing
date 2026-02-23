import type { Metadata } from "next";
import SignUpClientPage from "./SignUpClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/auth/signup" },
    robots: { index: true, follow: true },
  };
}

export default function SignUpPage() {
  return <SignUpClientPage />;
}
