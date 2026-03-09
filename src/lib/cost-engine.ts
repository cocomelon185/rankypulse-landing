/**
 * cost-engine.ts
 * Fire-and-forget cost logger for all DataForSEO API calls.
 * Never throws — cost logging must never block the main request.
 */
import { supabaseAdmin } from "@/lib/supabase";

// Estimated USD cost per single unit of each DataForSEO operation.
// Update these when DataForSEO reprices.
export const DFS_COSTS = {
  serp_query:     0.0020, // /v3/serp/google/organic/live/regular (per keyword)
  keyword_volume: 0.0010, // /v3/keywords_data/google_ads/search_volume/live (per keyword)
  keyword_ideas:  0.0015, // /v3/keywords_data/google_ads/keywords_for_keywords/live (per result)
  backlinks:      0.0020, // /v3/backlinks/summary/live (per domain)
  competitors:    0.0050, // /v3/dataforseo_labs/google/competitors_domain/live (per domain)
} as const;

export type DfsOperation = keyof typeof DFS_COSTS;

/**
 * Log a DataForSEO API cost to the api_costs table.
 * Always fire-and-forget — awaiting is optional but safe.
 *
 * @param userId - The user who triggered the API call
 * @param operation - Which DataForSEO endpoint was called
 * @param units - Number of units consumed (keywords, domains, etc.)
 */
export function logApiCost(params: {
  userId: string;
  operation: DfsOperation;
  units?: number;
}): void {
  const { userId, operation, units = 1 } = params;
  const cost_usd = DFS_COSTS[operation] * units;

  // Intentionally not awaited — never block the caller
  supabaseAdmin
    .from("api_costs")
    .insert({ user_id: userId, service: "dataforseo", operation, units, cost_usd })
    .then(({ error }) => {
      if (error) console.warn("[cost-engine] Failed to log API cost:", error.message);
    });
}

/**
 * Get the total estimated spend for a user in the current calendar month.
 * Used by admin dashboards or cost-alert checks.
 */
export async function getMonthlySpend(userId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("api_costs")
    .select("cost_usd")
    .eq("user_id", userId)
    .gte("created_at", startOfMonth.toISOString());

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + Number(row.cost_usd), 0);
}

/**
 * Keyword caps per plan — single source of truth used by API routes and UI.
 */
export const KEYWORD_CAPS: Record<string, number> = {
  free:    10,
  starter: 50,
  pro:     500,
};

export function getKeywordCap(plan: string): number {
  return KEYWORD_CAPS[plan] ?? KEYWORD_CAPS.free;
}
