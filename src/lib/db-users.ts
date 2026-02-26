/**
 * User lookup/creation for NextAuth — uses Supabase
 */
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "user";

export interface DbUser {
  id: string;
  email: string;
  username: string;
  password_hash: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  google_id: string | null;
}

export async function findUserByEmail(email: string): Promise<DbUser | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbUser;
}

export async function findUserByUsername(username: string): Promise<DbUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbUser;
}

export async function findUserByEmailOrUsername(
  identifier: string
): Promise<DbUser | null> {
  const trimmed = identifier.trim();
  if (trimmed.includes("@")) {
    return findUserByEmail(trimmed);
  }
  return findUserByUsername(trimmed);
}

export async function findUserByGoogleId(googleId: string): Promise<DbUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("google_id", googleId)
    .maybeSingle();
  if (error || !data) return null;
  return data as DbUser;
}

export async function verifyPassword(
  plain: string,
  hash: string | null
): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function createOrUpdateGoogleUser(params: {
  googleId: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<DbUser> {
  const existing = await findUserByGoogleId(params.googleId);
  if (existing) return existing;

  const email = params.email.trim().toLowerCase();
  const byEmail = await findUserByEmail(email);
  if (byEmail) {
    // Link existing account to Google
    const { data, error } = await supabaseAdmin
      .from("users")
      .update({
        google_id: params.googleId,
        name: params.name ?? byEmail.name,
        image: params.image ?? byEmail.image,
        updated_at: new Date().toISOString(),
      })
      .eq("id", byEmail.id)
      .select()
      .single();
    if (error) throw new Error("Failed to link Google account");
    return data as DbUser;
  }

  const base = email.split("@")[0].replace(/[^a-z0-9]/gi, "") || "user";
  const username = base + "_" + crypto.randomUUID().slice(0, 6);
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email,
      username,
      password_hash: null,
      name: params.name,
      image: params.image,
      role: "user",
      google_id: params.googleId,
    })
    .select()
    .single();
  if (error) throw new Error("Failed to create user");
  return data as DbUser;
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword);
  const { error } = await supabaseAdmin
    .from("users")
    .update({
      password_hash: hash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw new Error("Failed to update password");
}
