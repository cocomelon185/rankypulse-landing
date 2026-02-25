import { Suspense } from "react";
import { VerifyClientPage } from "./VerifyClientPage";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyClientPage />
    </Suspense>
  );
}
