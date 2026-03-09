# QA Quick Start

Get the RankyPulse QA system running in 5 minutes.

## One-Command Setup

```bash
cd landing/
node scripts/setup-qa.mjs
```

This will:
- Install all QA npm packages
- Add npm scripts to `package.json`
- Verify TypeScript configuration

## Run Phase 1: Route Discovery

```bash
# Local (dev server must be running: npm run dev)
npm run qa:discover-routes

# Staging
BASE_URL=https://staging.rankypulse.com npm run qa:discover-routes

# Production
npm run qa:discover-routes:prod
```

**Output**: `qa/artifacts/routes-discovered.json`

## Check Results

```bash
# View discovered routes
cat qa/artifacts/routes-discovered.json | jq '.routes[0:3]'

# Count total routes
cat qa/artifacts/routes-discovered.json | jq '.totalRoutes'

# Check for broken links
cat qa/artifacts/routes-discovered.json | jq '.brokenRoutes'
```

## Available Commands

```bash
npm run qa:types                    # TypeScript check
npm run qa:discover-routes          # Phase 1: Route discovery
npm run qa:discover-routes:prod     # Phase 1: Production routes
npm run qa:smoke                    # Phase 3: Smoke tests (when ready)
npm run qa:full                     # Phase 3: Full E2E tests (when ready)
npm run qa                          # Full QA suite (types + routes + smoke)
```

## What's Next

1. ✅ **Phase 1** (now): Route discovery — `npm run qa:discover-routes`
2. ⏳ **Phase 2** (next): SEO & technical crawl
3. ⏳ **Phase 3** (later): Browser automation (Playwright)
4. ⏳ **Phase 4**: API health & schema validation
5. ⏳ **Phase 5**: Lighthouse performance audits
6. ⏳ **Phase 6**: Visual regression testing
7. ⏳ **Phase 7**: GitHub Actions CI/CD

## Documentation

- **Full guide**: `qa/README.md`
- **Phase 1 details**: `qa/PHASE_1_SUMMARY.md`
- **Full plan**: `/Users/amjad.mohammad/.claude/plans/indexed-swimming-widget.md`

## Troubleshooting

**Packages failed to install?**
```bash
npm install --save-dev playwright @playwright/test axios fast-xml-parser
```

**Routes show 404?**
- Ensure dev server running: `npm run dev`
- Ensure `BASE_URL` is correct: `http://localhost:3000`

**TypeScript errors?**
```bash
npm run qa:types  # See all errors
```

**Routes didn't discover?**
- Check `qa/artifacts/routes-discovered.json` exists
- Verify network: `curl http://localhost:3000/`

---

**Ready?** Run `npm run qa:discover-routes` now! 🚀
