"use client";

import { useBilling } from "./useBilling";

/**
 * Thin hook for Pro gating. Uses existing billing store.
 * @returns { isPro: boolean } - true if plan is starter or pro
 */
export function usePlan(): { isPro: boolean } {
  const { plan } = useBilling();
  return {
    isPro: plan === "starter" || plan === "pro",
  };
}
