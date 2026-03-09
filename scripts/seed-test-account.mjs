#!/usr/bin/env node
/**
 * Seed test account for QA automation and manual testing.
 *
 * Usage: node scripts/seed-test-account.mjs
 *
 * Reads env vars from .env.local automatically — no manual export required.
 *
 * Creates / updates:
 * - test-friends@rankypulse.com / TestRankyPulse2024!
 * - Plan: Starter (50 keyword limit, $9/month equivalent)
 * - Expires: 90 days from now
 * - Used for both QA automation and sharing with friends
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Load .env.local so the script works with just `node scripts/seed-test-account.mjs`
// without having to manually export env vars in the shell.
// ---------------------------------------------------------------------------
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
  console.log("✅ Loaded environment from .env.local\n");
} catch {
  console.log("ℹ️  No .env.local found — using system environment variables\n");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  console.error("   Add them to .env.local or export them in your shell.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("🌱 Seeding test account...\n");
  console.log(`   Supabase: ${supabaseUrl}\n`);

  const email = "test-friends@rankypulse.com";
  const password = "TestRankyPulse2024!";
  const plan = "starter"; // 50 keywords, $9/month equivalent
  const username = "test_qa_" + Math.random().toString(36).slice(2, 8);

  // Calculate expiry: 90 days from now
  const planStartedAt = new Date().toISOString();
  const planExpiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  // Hash password with bcrypt
  console.log("🔐 Hashing password...");
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if account exists
  const { data: existingUser, error: selectError } = await supabase
    .from("users")
    .select("id, email, plan, plan_expires_at")
    .eq("email", email)
    .maybeSingle();

  if (selectError && selectError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("❌ Database error:", selectError.message);
    process.exit(1);
  }

  if (existingUser) {
    console.log(`📝 Account exists (ID: ${existingUser.id})`);
    console.log(`   Current plan: ${existingUser.plan}`);
    console.log(`   Expires: ${existingUser.plan_expires_at}`);
    console.log(`\n🔄 Updating password, plan, and expiry...\n`);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        plan,
        plan_started_at: planStartedAt,
        plan_expires_at: planExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingUser.id);

    if (updateError) {
      console.error("❌ Update failed:", updateError.message);
      process.exit(1);
    }

    console.log("✅ Updated successfully!\n");
  } else {
    console.log("➕ Account does not exist. Creating...\n");

    const { error: insertError } = await supabase.from("users").insert({
      email,
      username,
      password_hash: passwordHash,
      plan,
      plan_started_at: planStartedAt,
      plan_expires_at: planExpiresAt,
      role: "user",
      name: "Test Account (QA)",
    });

    if (insertError) {
      console.error("❌ Insert failed:", insertError.message);
      process.exit(1);
    }

    console.log("✅ Created successfully!\n");
  }

  // Display credentials
  const sep = "=".repeat(60);
  console.log(sep);
  console.log("TEST ACCOUNT READY");
  console.log(sep);
  console.log(`
Email:    ${email}
Password: ${password}
Plan:     Starter (50 tracked keywords)
Expires:  ${new Date(planExpiresAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

Usage:
  - Sign in to https://rankypulse.com/auth/signin
  - Share credentials with friends for testing
  - Use in Playwright tests: load credentials from environment
`);
  console.log(sep);
}

run().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
