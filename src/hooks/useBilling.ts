"use client";

import { useState, useEffect } from "react";
import { getBillingState, setPlan, getAuditCap, type PlanSlug } from "@/lib/billing-store";

export function useBilling() {
  const [state, setState] = useState(getBillingState);

  useEffect(() => {
    const handler = () => setState(getBillingState());
    window.addEventListener("rankypulse-plan-updated", handler);
    return () => window.removeEventListener("rankypulse-plan-updated", handler);
  }, []);

  const upgradePlan = (plan: PlanSlug) => {
    setPlan(plan);
    setState(getBillingState());
  };

  return { ...state, upgradePlan, getAuditCap };
}
