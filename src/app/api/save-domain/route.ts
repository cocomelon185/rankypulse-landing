import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const domain = typeof body.domain === "string" ? body.domain.trim().toLowerCase() : "";

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("saved_domains")
      .upsert(
        {
          domain,
          user_id: session.user.id,
          last_scanned_at: null,
          last_score: null,
        },
        { onConflict: "domain,user_id" }
      );

    if (error) {
      console.error("[api/save-domain] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/save-domain]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
