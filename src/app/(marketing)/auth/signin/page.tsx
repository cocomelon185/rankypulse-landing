import type { Metadata } from "next";
import SignInClientPage from "./SignInClientPage";

export async function generateMetadata(): Promise<Metadata> {
  return {
    alternates: { canonical: "/auth/signin" },
    robots: { index: true, follow: true },
  };
}

export default function SignInPage() {
  return <SignInClientPage />;
}
