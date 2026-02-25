import { Suspense } from "react";
import { ResetPasswordClientPage } from "./ResetPasswordClientPage";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordClientPage />
    </Suspense>
  );
}
