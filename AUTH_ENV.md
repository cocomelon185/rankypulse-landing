# Auth & Environment Variables

## Core Auth (required)

| Variable | Description | Example (local) | Example (Vercel) |
|----------|-------------|-----------------|------------------|
| `NEXTAUTH_URL` | Full URL of your app (MUST match deployment URL) | `http://localhost:3000` | `https://rankypulse.com` |
| `NEXTAUTH_SECRET` | Random string for JWT signing (min 32 chars) | `your-dev-secret-here-32chars` | Generate: `openssl rand -base64 32` |

## Supabase

| Variable | Description | Example (local) | Example (Vercel) |
|----------|-------------|-----------------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJ...` | Same |

## Google OAuth (optional — enables Google sign-in)

When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set, the sign-in and sign-up pages show the "Continue with Google" option.
When they are not set, the Google option is hidden (no warning text).

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-xxx` |

### Google Cloud Console — Authorized redirect URIs

| Environment | URI |
|-------------|-----|
| **Production (Vercel)** | `https://rankypulse.com/api/auth/callback/google` |
| **Local development** | `http://localhost:3000/api/auth/callback/google` |

## Vercel production checklist
1. `NEXTAUTH_URL` must exactly match your deployment URL (e.g. `https://rankypulse.com`)
2. `NEXTAUTH_SECRET` set to a strong random value
3. If using Google OAuth: redirect URI must include your production domain

## Local verification checklist (Google OAuth)

curl -s http://localhost:3000/api/auth/providers
