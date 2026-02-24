This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Google Analytics (GA4)

**Config**: For local dev, set `NEXT_PUBLIC_GA_ID` in `.env.local`. For production (Vercel), configure it in [Vercel Project Settings → Environment Variables](https://vercel.com/docs/projects/environment-variables). Scripts are injected via `layout.tsx` (next/script). SPA route changes are tracked by `AnalyticsClient`.

### Conversion Events

| Event | Params | Trigger |
|-------|--------|---------|
| `auth_click` | `method`, `intent` ("login" \| "sign_up") | User clicks sign-in/sign-up button (optional intent tracking) |
| `sign_up` | `method` (e.g. "google") | Successful signup (session established / callback success) |
| `login` | `method` (e.g. "google") | Successful login (session established / callback success) |
| `run_audit` | `url_host` | User submits valid URL to start audit (Hero "Scan My Site Now" or /audit "Start audit") |
| `view_results` | `url_host`, `score` | Audit results page renders with data |
| `upgrade_click` | `plan`, `placement` | User clicks upgrade CTA (pricing, locked overlay, modal, etc.) |

### Verification Checklist

1. **Script present in HTML** (use `rg` with cache-busting to avoid cached responses):
   ```bash
   # Local
   curl -s "http://localhost:3000/?_=$(date +%s)" | rg -o googletagmanager
   # Production
   curl -s "https://rankypulse.com/?_=$(date +%s)" | rg -o googletagmanager
   ```
   Expect output: `googletagmanager`
2. **GA Realtime**: In GA4 Realtime report, visit pages and confirm pageviews appear
3. **DebugView**: Add `?debug_mode=true` query param or use [GA Debugger Chrome extension](https://chrome.google.com/webstore/detail/google-analytics-debugger) and confirm events fire in GA4 DebugView

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Runbook: Reset Caches & Verify Endpoints

If the dev server has Turbopack cache corruption or ENOENT build-manifest/app-paths-manifest errors:

```bash
# 1. Kill any process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# 2. Delete dev caches
rm -rf .next .turbo node_modules/.cache .swc

# 3. Restart dev server (Turbopack disabled to avoid corruption)
npm run dev
```

Verify endpoints:

```bash
curl -I http://localhost:3000/              # Expect 200
curl -I http://localhost:3000/contact       # Expect 200
curl -i http://localhost:3000/api/contact   # Expect 200 { "ok": true }
curl -i -X POST http://localhost:3000/api/contact \
  -H 'content-type: application/json' \
  -d '{"name":"Test","email":"test@example.com","subject":"Hi","message":"Hello there!! This is a longer message."}'
# Expect 200 { "success": true }
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
