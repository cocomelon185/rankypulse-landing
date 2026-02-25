"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { useAuditStore } from "@/lib/use-audit";

export type FixGateResult = "allowed" | "redirect_to_signin" | "quota_exceeded";

/**
 * Hook to gate "Fix it now" / "How to fix" / "Open Fix Guide" actions.
 * - Anonymous → redirect to signin with callbackUrl
 * - Logged in Free + server quota exceeded → return "quota_exceeded" (show upgrade modal)
 * - Else → return "allowed", run action (server records fix event)
 */
export function useFixGate() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const domain = useAuditStore((s) => s.data.domain);

  const handleFixAction = useCallback(
    async (issueId: string, action: () => void): Promise<FixGateResult> => {
      if (!isAuthenticated) {
        const callbackUrl = `/report/${domain}?action=fix&issueId=${encodeURIComponent(issueId)}`;
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return "redirect_to_signin";
      }

      try {
        const res = await fetch("/api/usage/fix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ domain, issueId }),
        });
        const data = await res.json() as { allowed?: boolean; reason?: string };

        if (!data.allowed) {
          if (data.reason === "unauthenticated") {
            const callbackUrl = `/report/${domain}?action=fix&issueId=${encodeURIComponent(issueId)}`;
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
            return "redirect_to_signin";
          }
          return "quota_exceeded";
        }
      } catch {
        // Fail open on network error — let action proceed
      }

      action();
      return "allowed";
    },
    [isAuthenticated, router, domain]
  );

  const checkFixAccess = useCallback((): FixGateResult => {
    if (!isAuthenticated) return "redirect_to_signin";
    return "allowed";
  }, [isAuthenticated]);

  return {
    handleFixAction,
    checkFixAccess,
    isAuthenticated,
  };
}
