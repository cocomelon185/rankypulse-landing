import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeKeywordDifficulty } from "@/lib/dataforseo/keyword-research-service";
import { getDailyBudgetState, getKeywordQuota } from "@/lib/dataforseo/cost-control";
import { getDataProviderErrorPayload } from "@/lib/data-provider";
import { DataForSeoRequestError } from "@/lib/dataforseo";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    keywords?: string[];
    countryCode?: string;
    country?: string;
    languageCode?: string;
    language?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const keywords = [...new Set((body.keywords ?? []).map((keyword) => String(keyword).trim()).filter(Boolean))];
  if (!keywords.length) {
    return NextResponse.json({ error: "At least one keyword is required." }, { status: 400 });
  }

  const countryCode = String(body.countryCode ?? body.country ?? "US").toUpperCase();
  const languageCode = String(body.languageCode ?? body.language ?? "en").toLowerCase();

  try {
    const quota = await getKeywordQuota(session.user.id);
    const budget = await getDailyBudgetState();
    const maxAllowed = budget.mode === "cache_only"
      ? 0
      : Math.min(quota.maxAnalyzedKeywordsPerSearch, keywords.length);

    if (maxAllowed <= 0) {
      return NextResponse.json({ error: "Advanced difficulty analysis is temporarily unavailable." }, { status: 429 });
    }

    const metrics = await analyzeKeywordDifficulty({
      userId: session.user.id,
      keywords,
      countryCode,
      languageCode,
      maxAllowed,
    });

    const rows = keywords.map((keyword) => {
      const row = metrics.get(keyword.toLowerCase().trim());
      return {
        keyword,
        difficultyScore: row?.difficulty ?? null,
        difficultyLabel: row?.difficultyLabel ?? "Difficulty unavailable",
        difficultyStatus: row?.difficultyStatus ?? "unavailable",
        serpFeaturesCount: row?.serpFeaturesCount ?? 0,
        searchResultsCount: row?.searchResultsCount ?? null,
      };
    });

    return NextResponse.json({
      rows,
      budget,
      analyzed: rows.filter((row) => row.difficultyStatus === "available").length,
    });
  } catch (error) {
    if (error instanceof DataForSeoRequestError) {
      return NextResponse.json(getDataProviderErrorPayload("rankings", error.availability), { status: 502 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Difficulty analysis failed." }, { status: 500 });
  }
}

