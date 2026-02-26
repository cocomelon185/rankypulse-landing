#!/usr/bin/env node
/**
 * Seed admin and guest accounts for local/testing.
 *
 * Usage: node scripts/seed-users.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Creates:
 * - admin@rankypulse.com / admin / Admin123! (admin role)
 * - guest_<random> / guest@rankypulse.com / GuestPass123! (user role)
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const suffix = Math.random().toString(36).slice(2, 8);

async function run() {
  console.log("Seeding users...");

  const adminHash = await bcrypt.hash("Admin123!", 12);
  const guestHash = await bcrypt.hash("GuestPass123!", 12);

  const admin = {
    email: "admin@rankypulse.com",
    username: "admin",
    password_hash: adminHash,
    role: "admin",
  };

  const guest = {
    email: "guest@rankypulse.com",
    username: `guest_${suffix}`,
    password_hash: guestHash,
    role: "user",
  };

  const { data: existingAdmin } = await supabase
    .from("users")
    .select("id")
    .eq("email", admin.email)
    .maybeSingle();

  if (existingAdmin) {
    await supabase
      .from("users")
      .update({
        password_hash: adminHash,
        username: "admin",
        role: "admin",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingAdmin.id);
    console.log("Updated existing admin account.");
  } else {
    const { error: err1 } = await supabase.from("users").insert(admin);
    if (err1) console.error("Admin insert:", err1);
  }

  const { data: existingGuest } = await supabase
    .from("users")
    .select("id")
    .eq("email", guest.email)
    .maybeSingle();

  if (existingGuest) {
    await supabase
      .from("users")
      .update({
        password_hash: guestHash,
        username: `guest_${suffix}`,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingGuest.id);
    console.log(`Updated existing guest account. Username: guest_${suffix}`);
  } else {
    const { error: err2 } = await supabase.from("users").insert(guest);
    if (err2) console.error("Guest insert:", err2);
  }

  console.log(`
Seed complete. Use these credentials:

  ADMIN (full access):
    Email:    admin@rankypulse.com
    Username: admin
    Password: Admin123!

  GUEST (standard user):
    Email:    guest@rankypulse.com
    Username: guest_${suffix}
    Password: GuestPass123!
`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
