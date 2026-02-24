# Verification Notes

## 1. Analytics + Conversion Events

### Local Verification
- **Development**: Open browser console. Events appear as `[analytics] <eventName> { props }`.
- **PostHog** (local only): Set `NEXT_PUBLIC_POSTHOG_KEY` in `.env.local`. Add PostHog snippet to layout/head for initialization. Events will appear in PostHog dashboard.
- **Google Analytics** (local only): Set `NEXT_PUBLIC_GA_ID` in `.env.local`. Load gtag script. Events will appear in GA4 DebugView.
- **Production**: Configure `NEXT_PUBLIC_GA_ID` and `NEXT_PUBLIC_POSTHOG_KEY` in Vercel Project Settings → Environment Variables. `.env.local` is not used in production.

### Event Names
- `landing_hero_submit` – hero form submit (props: url_domain, source)
- `nav_cta_click` – main CTA click (props: target)
- `pricing_view` – pricing page view
- `pricing_cta_click` – plan CTA (props: plan)
- `audit_started` – audit form submit (props: url_domain)
- `audit_results_viewed` – results loaded (props: url_domain, score, issues_count)
- `email_capture_submitted` – email report sent (props: url_domain)
- `signup_view` – signup page view
- `signup_submit` – sign up button click

### Privacy
- Only `url_domain` (hostname) is stored; no full URLs or query strings.

---

## 2. Email Capture / Unlock Full Report

### Flow
1. User runs audit → sees score, top 3 issues, 1 sample fix immediately.
2. Remaining issues, Export PDF, Action plan are blurred/locked.
3. Inline card: "Email me the full report" + input + "Send Full Report".
4. On submit: calls `/api/email-report` with reportUrl, siteUrl, summary, issues.
5. Success: "Sent! Check your inbox." and unlocked state (remaining content visible).

### Verification
- Visit `/audit/results?url=https://example.com` or run audit from `/audit`.
- Confirm limited preview (score, top 3, sample fix) is visible without email.
- Submit email → check inbox for report.
- With `RESEND_API_KEY` unset, API returns 500; UI shows "Could not send. Try again."

### Accessibility
- Label: `htmlFor="unlock-email"`, `aria-describedby` for success/error.
- `aria-live="polite"` on status message.
- `role="region"` and `aria-labelledby` on card.

---

## 3. OG / Social Preview

### Verification
```bash
# Headers + OG tags
curl -sI https://rankypulse.com/ | head -20

# Or local after `npm run start`
curl -s http://localhost:3000/ | grep -E 'og:|twitter:'
```

Expected:
- `og:image` → `/og.png` (or full URL with metadataBase)
- `og:image:width` 1200, `og:image:height` 630
- `twitter:card` summary_large_image
- `twitter:image` /og.png

### Image
- `public/og.png` – 1200×630, brand colors (#4318ff, #1B2559), logo mark, "Instant SEO Audit", "Score + Fixes in Minutes".
