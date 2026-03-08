/**
 * Client-side billing/plan store.
 * Uses localStorage when DB is not wired. Persists plan and next reset date.
 *
 * Quotas per spec:
 * - Free: unlimited audits, 3 fixes/month
 * - Starter: 25 audits/month, unlimited fixes
 * - Pro: unlimited audits, unlimited fixes
 */

const STORAGE_KEY = "rankypulse_plan";
const PLAN_AUDIT_CAPS: Record<string, number> = {
  free: Number.POSITIVE_INFINITY,    // unlimited
  starter: 25,                       // 25 audits/month
  pro: Number.POSITIVE_INFINITY,     // unlimited
};
const PLAN_FIX_CAPS: Record<string, number> = {
  free: 3,
  starter: Number.POSITIVE_INFINITY,
  pro: Number.POSITIVE_INFINITY,
};

export type PlanSlug = "free" | "starter" | "pro";

export interface BillingState {
  plan: PlanSlug;
  nextResetDate: string; // ISO date
  auditsUsed?: number;
  fixesUsed?: number;
}

const DEFAULT_STATE: BillingState = {
  plan: "free",
  nextResetDate: getNextMonthStart(),
  auditsUsed: 0,
  fixesUsed: 0,
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
    let state: BillingState = {
      ...DEFAULT_STATE,
      ...parsed,
      plan: (parsed.plan || "free") as PlanSlug,
      nextResetDate: parsed.nextResetDate || getNextMonthStart(),
    };
    const today = new Date().toISOString().slice(0, 10);
    if (state.nextResetDate && today >= state.nextResetDate) {
      state = {
        ...state,
        nextResetDate: getNextMonthStart(),
        auditsUsed: 0,
        fixesUsed: 0,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    return state;
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
  return PLAN_AUDIT_CAPS[getBillingState().plan] ?? Number.POSITIVE_INFINITY;
}

export function getFixCap(): number {
  return PLAN_FIX_CAPS[getBillingState().plan] ?? 3;
}

export function incrementFixesUsed(): void {
  if (typeof window === "undefined") return;
  const current = getBillingState();
  const updated: BillingState = {
    ...current,
    fixesUsed: (current.fixesUsed ?? 0) + 1,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("rankypulse-plan-updated", { detail: updated }));
}

export function canUseFix(): boolean {
  const current = getBillingState();
  const cap = getFixCap();
  const used = current.fixesUsed ?? 0;
  return used < cap;
}

export function getFixesRemaining(): number {
  const current = getBillingState();
  const cap = getFixCap();
  const used = current.fixesUsed ?? 0;
  return Math.max(0, cap - used);
}

export function canRunAudit(): boolean {
  const state = getBillingState();
  const cap = getAuditCap();
  const used = state.auditsUsed ?? 0;
  return used < cap;
}

export function getAuditsRemaining(): number {
  const state = getBillingState();
  const cap = getAuditCap();
  const used = state.auditsUsed ?? 0;
  return Math.max(0, cap - used);
}

export function incrementAuditsUsed(): void {
  if (typeof window === "undefined") return;
  const current = getBillingState();
  const cap = getAuditCap();
  if (cap === Number.POSITIVE_INFINITY) return;
  const updated: BillingState = {
    ...current,
    auditsUsed: (current.auditsUsed ?? 0) + 1,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("rankypulse-plan-updated", { detail: updated }));
}
