import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { getDailyBudgetState } from "@/lib/dataforseo/cost-control";

export const dynamic = "force-dynamic";

function startDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [todayBudget, recentLogsResult, todayLogsResult] = await Promise.all([
    getDailyBudgetState(),
    supabaseAdmin
      .from("api_usage_logs")
      .select("endpoint, user_id, estimated_cost, cache_hit, created_at")
      .eq("provider", "dataforseo")
      .gte("created_at", startDaysAgo(7))
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("api_usage_logs")
      .select("estimated_cost, cache_hit")
      .eq("provider", "dataforseo")
      .gte("created_at", startDaysAgo(1)),
  ]);

  const recentLogs = recentLogsResult.data ?? [];
  const todayLogs = todayLogsResult.data ?? [];

  const spendToday = todayLogs.reduce((sum, row) => sum + Number((row as { estimated_cost?: number }).estimated_cost ?? 0), 0);
  const spendLast7Days = recentLogs.reduce((sum, row) => sum + Number((row as { estimated_cost?: number }).estimated_cost ?? 0), 0);
  const cacheHits = recentLogs.filter((row) => Boolean((row as { cache_hit?: boolean }).cache_hit)).length;
  const cacheHitRate = recentLogs.length ? Number(((cacheHits / recentLogs.length) * 100).toFixed(1)) : 0;

  const endpointSpend = new Map<string, number>();
  const userSpend = new Map<string, number>();
  for (const row of recentLogs) {
    const endpoint = (row as { endpoint?: string }).endpoint ?? "unknown";
    const userId = (row as { user_id?: string | null }).user_id ?? "anonymous";
    const cost = Number((row as { estimated_cost?: number }).estimated_cost ?? 0);
    endpointSpend.set(endpoint, (endpointSpend.get(endpoint) ?? 0) + cost);
    userSpend.set(userId, (userSpend.get(userId) ?? 0) + cost);
  }

  return NextResponse.json({
    spendToday: Number(spendToday.toFixed(4)),
    spendLast7Days: Number(spendLast7Days.toFixed(4)),
    cacheHitRate,
    budget: todayBudget,
    topExpensiveEndpoints: [...endpointSpend.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([endpoint, cost]) => ({ endpoint, cost: Number(cost.toFixed(4)) })),
    topExpensiveUsers: [...userSpend.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 5)
      .map(([userId, cost]) => ({ userId, cost: Number(cost.toFixed(4)) })),
  });
}

