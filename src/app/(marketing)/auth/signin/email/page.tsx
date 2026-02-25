import { Suspense } from "react";
import { SignInEmailClientPage } from "./SignInEmailClientPage";

export default function SignInEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f14]" />}>
      <SignInEmailClientPage />
    </Suspense>
  );
}
