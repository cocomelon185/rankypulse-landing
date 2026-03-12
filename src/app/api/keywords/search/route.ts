import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildKeywordSearchResponse } from "@/lib/dataforseo/keyword-research-service";
import { getDataProviderErrorPayload } from "@/lib/data-provider";
import { DataForSeoRequestError } from "@/lib/dataforseo";

export const dynamic = "force-dynamic";

function normalizeDomain(value: string): string {
  return value
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .toLowerCase()
    .trim();
}

async function handleRequest(req: Request, body?: Record<string, unknown>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const domain = normalizeDomain(String(body?.domain ?? url.searchParams.get("domain") ?? ""));
  const seedKeyword = String(body?.seedKeyword ?? body?.seed ?? url.searchParams.get("seedKeyword") ?? url.searchParams.get("seed") ?? "").trim();
  const countryCode = String(body?.countryCode ?? body?.country ?? url.searchParams.get("countryCode") ?? url.searchParams.get("country") ?? "US").toUpperCase();
  const mode = String(body?.mode ?? url.searchParams.get("mode") ?? "preview") as "preview" | "expanded";
  const limit = Number(body?.limit ?? url.searchParams.get("limit") ?? 25);
  const offset = Number(body?.offset ?? url.searchParams.get("offset") ?? 0);
  const forceRefresh = Boolean(body?.forceRefresh ?? url.searchParams.get("forceRefresh") === "true");

  if (!domain || !seedKeyword) {
    return NextResponse.json({ error: "domain and seedKeyword are required." }, { status: 400 });
  }

  try {
    const payload = await buildKeywordSearchResponse({
      userId: session.user.id,
      domain,
      seedKeyword,
      countryCode,
      mode,
      limit,
      offset,
      forceRefresh,
      isAdmin: session.user.role === "admin",
    });
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof DataForSeoRequestError) {
      return NextResponse.json(getDataProviderErrorPayload("keywords", error.availability), { status: 502 });
    }
    const message = error instanceof Error ? error.message : "Keyword search failed.";
    const status = /limit|refresh|budget/i.test(message) ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET(req: Request) {
  return handleRequest(req);
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return handleRequest(req, body);
}

