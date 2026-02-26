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

## Email (forgot password, forgot username)

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend.com API key | `re_xxx` |
| `RESEND_FROM` | Sender email (optional) | `RankyPulse <noreply@rankypulse.com>` |

Without `RESEND_API_KEY`, forgot-password and forgot-username APIs return success but do not send emails (dev mode).

## Vercel production checklist
1. `NEXTAUTH_URL` must exactly match your deployment URL (e.g. `https://rankypulse.com`)
2. `NEXTAUTH_SECRET` set to a strong random value
3. If using Google OAuth: redirect URI must include your production domain
4. Ensure there are no conflicting rewrites that cause redirect loops

## Local verification checklist (Google OAuth)

```bash
curl -s http://localhost:3000/api/auth/providers
```

Expected:
- With Google env vars set: `{"google":true}`
- Without Google env vars: `{"google":false}`

## Database setup

Run the migration in Supabase SQL editor (or via Supabase CLI):

```bash
supabase db push
```

Migration file:
- `supabase/migrations/20250226000000_create_users.sql`

## Seed users

```bash
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run db:seed
```

Creates:
- Admin: `admin@rankypulse.com` / `admin` / `Admin123!`
- Guest: `guest@rankypulse.com` / `guest_<random>` / `GuestPass123!`
