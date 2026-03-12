import { createHash } from "node:crypto";
import { supabaseAdmin } from "../supabase";
import { getDailyBudgetState } from "./cost-control";

export type UsageLogInput = {
  endpoint: string;
  userId?: string | null;
  cacheHit: boolean;
  requestFingerprint: string;
  requestUnits?: number;
  estimatedCost?: number;
  statusCode?: number | null;
  durationMs?: number | null;
  metadata?: Record<string, unknown>;
};

export function buildRequestFingerprint(parts: Array<string | number | boolean | null | undefined>): string {
  return createHash("sha256")
    .update(parts.map((part) => String(part ?? "")).join("|"))
    .digest("hex");
}

export async function logDataForSeoUsage(input: UsageLogInput): Promise<void> {
  const estimatedCost = Number((input.estimatedCost ?? 0).toFixed(6));
  await supabaseAdmin.from("api_usage_logs").insert({
    provider: "dataforseo",
    endpoint: input.endpoint,
    user_id: input.userId ?? null,
    cache_hit: input.cacheHit,
    request_fingerprint: input.requestFingerprint,
    request_units: input.requestUnits ?? 1,
    estimated_cost: estimatedCost,
    status_code: input.statusCode ?? null,
    duration_ms: input.durationMs ?? null,
    metadata: input.metadata ?? {},
  });

  await getDailyBudgetState();
}
