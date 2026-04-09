import { createClient } from "@supabase/supabase-js";

// Server-side only — never import in client bundles
// Env vars are required at runtime but may be absent during Next.js build phase
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Lazy singleton — created on first use, not at module load time
let _supabaseAdmin: ReturnType<typeof getSupabaseAdmin> | null = null;

export const supabaseAdmin = new Proxy({} as ReturnType<typeof getSupabaseAdmin>, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = getSupabaseAdmin();
    }
    const value = (_supabaseAdmin as any)[prop];
    return typeof value === "function" ? value.bind(_supabaseAdmin) : value;
  },
});
