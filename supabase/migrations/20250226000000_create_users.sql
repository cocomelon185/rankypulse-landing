-- Users table for NextAuth Credentials + Google OAuth
-- Run in Supabase SQL editor or via supabase db push

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- null for OAuth-only users
  name TEXT,
  image TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  google_id TEXT UNIQUE, -- for Google OAuth linking
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS users_username_idx ON public.users(username);
CREATE INDEX IF NOT EXISTS users_google_id_idx ON public.users(google_id);

-- auth_tokens for password reset (if not exists)
CREATE TABLE IF NOT EXISTS public.auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  type TEXT NOT NULL, -- 'password_reset', 'magic_link', etc.
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auth_tokens_token_idx ON public.auth_tokens(token);
CREATE INDEX IF NOT EXISTS auth_tokens_email_type_idx ON public.auth_tokens(email, type);
