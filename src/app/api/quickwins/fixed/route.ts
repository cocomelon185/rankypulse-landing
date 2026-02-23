import { NextResponse } from "next/server";

/**
 * Optional endpoint to persist "marked as fixed" for Quick Wins.
 * Client-side state (localStorage) is the source of truth.
 * This can be wired to a DB later.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const site = (body?.site ?? "").trim();
    const issueId = (body?.issueId ?? "").trim();

    if (!site || !issueId) {
      return NextResponse.json(
        { ok: false, error: "site and issueId are required" },
        { status: 400 }
      );
    }

    // TODO: Store in database when persistence is needed

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}
