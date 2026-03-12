import { supabaseAdmin } from "../supabase";

export type KeywordPlan = "free" | "starter" | "pro";
export type BudgetMode = "normal" | "degraded" | "cache_only";

export type KeywordPlanLimits = {
  searchesPerDay: number;
  maxAnalyzedKeywordsPerSearch: number;
  initialFetchSize: number;
  autoDifficultyCount: number;
};

const DEFAULT_PLAN_LIMITS: Record<KeywordPlan, KeywordPlanLimits> = {
  free: { searchesPerDay: 5, maxAnalyzedKeywordsPerSearch: 10, initialFetchSize: 10, autoDifficultyCount: 3 },
  starter: { searchesPerDay: 20, maxAnalyzedKeywordsPerSearch: 15, initialFetchSize: 20, autoDifficultyCount: 5 },
  pro: { searchesPerDay: 50, maxAnalyzedKeywordsPerSearch: 25, initialFetchSize: 25, autoDifficultyCount: 8 },
};

type DailyBudgetState = {
  spendToday: number;
  softLimitReached: boolean;
  hardLimitReached: boolean;
  budgetUsd: number;
  softThresholdUsd: number;
  hardThresholdUsd: number;
  mode: BudgetMode;
};

function parseEnvNumber(name: string, fallback: number): number {
  const parsed = Number(process.env[name] ?? "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function startOfDayIso(): string {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now.toISOString();
}

export function normalizePlan(plan: string | null | undefined): KeywordPlan {
  if (plan === "starter" || plan === "pro") return plan;
  return "free";
}

export function getKeywordPlanLimits(plan: string | null | undefined): KeywordPlanLimits {
  return DEFAULT_PLAN_LIMITS[normalizePlan(plan)];
}

export async function getUserPlan(userId: string): Promise<KeywordPlan> {
  const { data } = await supabaseAdmin
    .from("users")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();
  return normalizePlan((data as { plan?: string } | null)?.plan);
}

export async function getKeywordSearchesUsedToday(userId: string): Promise<number> {
  const { count } = await supabaseAdmin
    .from("api_usage_logs")
    .select("id", { count: "exact", head: true })
    .eq("provider", "dataforseo")
    .eq("endpoint", "keywords/search_live")
    .eq("user_id", userId)
    .eq("cache_hit", false)
    .gte("created_at", startOfDayIso());
  return count ?? 0;
}

export async function getKeywordQuota(userId: string): Promise<{
  plan: KeywordPlan;
  searchesUsedToday: number;
  searchesPerDay: number;
  searchesRemainingToday: number;
  maxAnalyzedKeywordsPerSearch: number;
  initialFetchSize: number;
  autoDifficultyCount: number;
}> {
  const plan = await getUserPlan(userId);
  const limits = getKeywordPlanLimits(plan);
  const searchesUsedToday = await getKeywordSearchesUsedToday(userId);
  return {
    plan,
    searchesUsedToday,
    searchesPerDay: limits.searchesPerDay,
    searchesRemainingToday: Math.max(0, limits.searchesPerDay - searchesUsedToday),
    maxAnalyzedKeywordsPerSearch: limits.maxAnalyzedKeywordsPerSearch,
    initialFetchSize: limits.initialFetchSize,
    autoDifficultyCount: limits.autoDifficultyCount,
  };
}

export async function assertKeywordSearchQuota(userId: string): Promise<Awaited<ReturnType<typeof getKeywordQuota>>> {
  const quota = await getKeywordQuota(userId);
  if (quota.searchesRemainingToday <= 0) {
    throw new Error(`Daily keyword research limit reached for your ${quota.plan} plan.`);
  }
  return quota;
}

export async function getDailyBudgetState(): Promise<DailyBudgetState> {
  const budgetUsd = parseEnvNumber("DATAFORSEO_DAILY_BUDGET_USD", 25);
  const softThresholdRatio = parseEnvNumber("DATAFORSEO_DAILY_BUDGET_SOFT_THRESHOLD", 0.7);
  const hardThresholdRatio = parseEnvNumber("DATAFORSEO_DAILY_BUDGET_HARD_THRESHOLD", 0.9);
  const softThresholdUsd = Number((budgetUsd * softThresholdRatio).toFixed(2));
  const hardThresholdUsd = Number((budgetUsd * hardThresholdRatio).toFixed(2));

  const today = new Date().toISOString().slice(0, 10);
  const { data: cachedState } = await supabaseAdmin
    .from("daily_api_budget_state")
    .select("spend_estimate, soft_limit_reached, hard_limit_reached")
    .eq("date", today)
    .eq("provider", "dataforseo")
    .maybeSingle();

  let spendToday = Number((cachedState as { spend_estimate?: number } | null)?.spend_estimate ?? 0);
  if (!cachedState) {
    const { data } = await supabaseAdmin
      .from("api_usage_logs")
      .select("estimated_cost")
      .eq("provider", "dataforseo")
      .gte("created_at", startOfDayIso());
    spendToday = (data ?? []).reduce((sum, row) => sum + Number((row as { estimated_cost?: number }).estimated_cost ?? 0), 0);
  }

  const mode: BudgetMode =
    spendToday >= budgetUsd ? "cache_only" : spendToday >= hardThresholdUsd ? "degraded" : "normal";

  const softLimitReached = spendToday >= softThresholdUsd;
  const hardLimitReached = spendToday >= hardThresholdUsd;

  await supabaseAdmin.from("daily_api_budget_state").upsert({
    date: today,
    provider: "dataforseo",
    spend_estimate: spendToday,
    soft_limit_reached: softLimitReached,
    hard_limit_reached: hardLimitReached,
    updated_at: new Date().toISOString(),
  }, { onConflict: "date,provider" });

  return {
    spendToday: Number(spendToday.toFixed(4)),
    softLimitReached,
    hardLimitReached,
    budgetUsd,
    softThresholdUsd,
    hardThresholdUsd,
    mode,
  };
}

export function adjustFetchSizeForBudget(input: {
  requested: number;
  defaultSize: number;
  mode: BudgetMode;
}): number {
  const base = Math.max(1, input.requested || input.defaultSize);
  if (input.mode === "cache_only") return Math.min(base, 10);
  if (input.mode === "degraded") return Math.min(base, Math.max(10, Math.floor(input.defaultSize / 2)));
  return base;
}

export function canAutoAnalyzeDifficulty(input: {
  mode: BudgetMode;
  requestedCount: number;
  planLimit: number;
}): number {
  if (input.mode === "cache_only") return 0;
  if (input.mode === "degraded") return Math.min(3, input.requestedCount, input.planLimit);
  return Math.min(input.requestedCount, input.planLimit);
}

export function canForceRefresh(input: {
  isAdmin: boolean;
  cacheAgeMinutes: number | null;
}): boolean {
  if (input.isAdmin) return true;
  const minAge = parseEnvNumber("DATAFORSEO_MIN_REFRESH_AGE_MINUTES", 60);
  if (input.cacheAgeMinutes === null) return true;
  return input.cacheAgeMinutes >= minAge;
}
