# QA Checklist (Manual validation)

Run before release:

```bash
cd landing
npm run lint     # ESLint
npm run build    # Next.js production build
npm run test     # Playwright smoke tests (start app first: npm run build && npm run start, or CI)
```

## Checklist

### Landing (/)
- [ ] Hero CTAs work: "Start Free Audit" → /audit, "View Sample Report" → /audit?sample=1
- [ ] Sections have consistent spacing, no layout shift
- [ ] Mobile layout looks clean
- [ ] Footer links valid: Pricing, About, Run Audit, Sign in

### App routes
- [ ] /dashboard: Stat cards render, quick start checklist works
- [ ] /audit: Credits badge shows, example chips fill input, sample report link works
- [ ] /audit/results: Tabs switch, copy buttons show toast, sticky CTA does not overlap
- [ ] /features/*: LockedOverlay displays, upgrade CTA goes to /pricing

### Auth
- [ ] /auth/signin: Forgot password → /auth/forgot-password, Need help → mailto
- [ ] /auth/signup: Sign in link, Need help mailto
- [ ] /auth/forgot-password: Form, sign in link, need help mailto

### Pricing
- [ ] USD/INR toggle works on page + modal
- [ ] Starter: ₹999, Pro: ₹1,699 (monthly)
- [ ] "Buy Starter" / "Buy Pro" show Razorpay modal when env not set

### Console
- [ ] No React key warnings, hydration errors
- [ ] Charts render without crash
