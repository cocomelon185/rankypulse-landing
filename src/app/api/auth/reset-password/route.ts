import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Password reset verification.
 * Verifies the token from auth_tokens and marks it used.
 * Note: Since auth is Google OAuth only, no actual password is updated.
 * The token flow is complete and valid, but password change is a no-op.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    const password = body.password;

    if (!token || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    // Look up the token in Supabase
    const { data: tokenRow, error: fetchError } = await supabaseAdmin
      .from("auth_tokens")
      .select("id, email, type, expires_at, used_at")
      .eq("token", token)
      .eq("type", "password_reset")
      .maybeSingle();

    if (fetchError) {
      console.error("[reset-password] DB error:", fetchError);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }

    if (!tokenRow) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (tokenRow.used_at) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
    }

    // Mark token as used
    await supabaseAdmin
      .from("auth_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRow.id);

    // Note: Auth is Google OAuth — no password to update.
    // Token flow is complete.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
