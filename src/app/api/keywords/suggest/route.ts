import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { buildHybridKeywordSuggestions } from "@/lib/keyword-suggestions/hybrid-engine";

export const dynamic = "force-dynamic";

async function handle(req: Request, body?: Record<string, unknown>) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const domain = String(body?.domain ?? url.searchParams.get("domain") ?? "");
  const topic = String(body?.topic ?? url.searchParams.get("topic") ?? "");
  const countryCode = String(body?.countryCode ?? url.searchParams.get("countryCode") ?? "US").toUpperCase();
  const languageCode = String(body?.languageCode ?? url.searchParams.get("languageCode") ?? "en").toLowerCase();

  try {
    const payload = await buildHybridKeywordSuggestions({
      domain,
      topic,
      countryCode,
      languageCode,
    });
    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to suggest keyword seeds.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return handle(req, body);
}
