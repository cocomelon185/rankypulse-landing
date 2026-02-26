import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, findUserByUsername, hashPassword } from "@/lib/db-users";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null;
    const username = typeof body.username === "string"
      ? body.username.trim().replace(/\s+/g, "_").toLowerCase()
      : null;
    const password = typeof body.password === "string" ? body.password : null;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }
    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }
    if (!/^[a-z0-9_]+$/i.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const { error } = await supabaseAdmin.from("users").insert({
      email,
      username,
      password_hash: passwordHash,
      role: "user",
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Email or username already taken" },
          { status: 400 }
        );
      }
      console.error("[signup]", error);
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
