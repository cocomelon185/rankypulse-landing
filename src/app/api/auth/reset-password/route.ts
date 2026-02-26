import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { findUserByEmail, updatePassword } from "@/lib/db-users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = body.token;
    const password = body.password;

    if (!token || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Invalid request. Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const { data: tokenRow, error: fetchError } = await supabaseAdmin
      .from("auth_tokens")
      .select("id, email, type, expires_at, used_at")
      .eq("token", token)
      .eq("type", "password_reset")
      .maybeSingle();

    if (fetchError) {
      console.error("[reset-password] DB error:", fetchError);
      return NextResponse.json(
        { error: "Something went wrong" },
        { status: 500 }
      );
    }

    if (!tokenRow) {
      return NextResponse.json(
        { error: "Invalid or expired reset link" },
        { status: 400 }
      );
    }

    if (tokenRow.used_at) {
      return NextResponse.json(
        { error: "This reset link has already been used" },
        { status: 400 }
      );
    }

    if (new Date(tokenRow.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired" },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(tokenRow.email);
    if (!user) {
      return NextResponse.json(
        { error: "No account found for this email" },
        { status: 400 }
      );
    }

    await updatePassword(user.id, password);

    await supabaseAdmin
      .from("auth_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", tokenRow.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
