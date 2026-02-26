import { NextResponse } from "next/server";
import { isGoogleAuthConfigured } from "@/lib/auth";

/**
 * Returns which OAuth providers are configured (for UI conditional rendering).
 * Used to hide/disable Google sign-in when env vars are not set.
 */
export async function GET() {
  return NextResponse.json({
    google: isGoogleAuthConfigured,
  });
}
