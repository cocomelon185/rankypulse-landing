"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { track } from "@/lib/analytics";

/**
 * Auth callback page. Fires GA sign_up/login only when user lands here after
 * successful authentication (session established). OAuth provider should
 * redirect to /auth/callback?success=1&intent=login|sign_up&method=google
 */
function AuthCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;
    const success = searchParams.get("success");
    const intent = searchParams.get("intent");
    const method = searchParams.get("method") ?? "google";
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    if (success === "1" && (intent === "login" || intent === "sign_up")) {
      track(intent, { method });
    }
    router.replace(callbackUrl);
  }, [searchParams, router]);

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackClient />
    </Suspense>
  );
}
