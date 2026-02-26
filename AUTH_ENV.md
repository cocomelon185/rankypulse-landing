# Auth Environment Variables

## Required for local + Vercel

| Variable | Description | Example (local) | Example (Vercel) |
|----------|-------------|-----------------|------------------|
| `NEXTAUTH_URL` | Full URL of your app (MUST match deployment URL) | `http://localhost:3000` | `https://projectrankypulse.com` |
| `NEXTAUTH_SECRET` | Random string for JWT signing (min 32 chars) | `your-dev-secret-here-32chars` | Generate: `openssl rand -base64 32` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) | `eyJ...` | Same |

## Google OAuth (required for Google sign-in)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-xxx` |

**Google OAuth setup:**
1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `https://<your-domain>/api/auth/callback/google`
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://projectrankypulse.com/api/auth/callback/google`

## Email (forgot password, forgot username)

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend.com API key | `re_xxx` |
| `RESEND_FROM` | Sender email (optional) | `RankyPulse <noreply@rankypulse.com>` |

Without `RESEND_API_KEY`, forgot-password and forgot-username APIs return success but do not send emails (dev mode).

## Vercel production checklist

1. **NEXTAUTH_URL** must exactly match your deployment URL (e.g. `https://projectrankypulse.com`)
2. **NEXTAUTH_SECRET** set to a strong random value
3. Google OAuth redirect URI must include your production domain
4. No conflicting rewrites: the previous `vercel.json` had rewrites to `rankypulse.com` which could cause 508 INFINITE_LOOP — removed for single-domain deployment
5. Cookies: `useSecureCookies: true` in production (automatic when `NODE_ENV=production`)

## Database setup

Run the migration in Supabase SQL editor:
```bash
# Or via Supabase CLI
supabase db push
```

Migration file: `supabase/migrations/20250226000000_create_users.sql`

## Seed users

```bash
cd landing
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run db:seed
```

Creates:
- **Admin:** admin@rankypulse.com / admin / Admin123!
- **Guest:** guest@rankypulse.com / guest_&lt;random&gt; / GuestPass123!
