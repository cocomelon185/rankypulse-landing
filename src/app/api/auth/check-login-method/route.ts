import { NextRequest, NextResponse } from "next/server";
import { findUserByEmailOrUsername } from "@/lib/db-users";

/**
 * GET /api/auth/check-login-method?identifier=...
 * Returns what sign-in methods are available for an email or username.
 * Used by the sign-in page to show a helpful error when a Google-only user
 * tries to sign in with a password.
 */
export async function GET(req: NextRequest) {
  const identifier = req.nextUrl.searchParams.get("identifier");

  if (!identifier || identifier.trim().length < 3) {
    return NextResponse.json({ exists: false });
  }

  const user = await findUserByEmailOrUsername(identifier.trim());

  if (!user) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({
    exists: true,
    hasPassword: !!user.password_hash,
    hasGoogle: !!user.google_id,
  });
}
