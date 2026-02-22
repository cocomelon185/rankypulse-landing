/**
 * Client-side billing/plan store.
 * Uses localStorage when DB is not wired. Persists plan and next reset date.
 */

const STORAGE_KEY = "rankypulse_plan";
const PLAN_AUDIT_CAPS: Record<string, number> = {
  free: 3,
  starter: 20,
  pro: 75,
};

export type PlanSlug = "free" | "starter" | "pro";

export interface BillingState {
  plan: PlanSlug;
  nextResetDate: string; // ISO date
  auditsUsed?: number;
}

const DEFAULT_STATE: BillingState = {
  plan: "free",
  nextResetDate: getNextMonthStart(),
  auditsUsed: 0,
};

function getNextMonthStart(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function getBillingState(): BillingState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as BillingState;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      plan: parsed.plan || "free",
      nextResetDate: parsed.nextResetDate || getNextMonthStart(),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function setPlan(plan: PlanSlug): void {
  if (typeof window === "undefined") return;
  const state = getBillingState();
  const updated: BillingState = {
    ...state,
    plan,
    nextResetDate: getNextMonthStart(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("rankypulse-plan-updated", { detail: updated }));
}

export function getAuditCap(): number {
  return PLAN_AUDIT_CAPS[getBillingState().plan] ?? 3;
}
