# Sitemap & Robots Verification Notes

## Verification commands

### Local (with dev server)
```bash
# Start dev server
NEXT_DISABLE_TURBOPACK=1 npm run dev

# Or use production build:
npm run build && npm run start
```

```bash
# Sitemap: expect 200 and content-type application/xml
curl -I http://localhost:3000/sitemap.xml

# Sitemap content
curl -sS http://localhost:3000/sitemap.xml | head

# Robots: expect 200
curl -I http://localhost:3000/robots.txt

# Verify audit URLs in sitemap
curl -sS http://localhost:3000/sitemap.xml | rg -n 'audit/wordpress-seo-audit'
```

### Production
```bash
# Sitemap
curl -I https://rankypulse.com/sitemap.xml

# Robots
curl -I https://rankypulse.com/robots.txt

# Verify audit URLs
curl -sS https://rankypulse.com/sitemap.xml | rg -n 'audit/wordpress-seo-audit'
```

## Implementation summary

- **sitemap.ts**: `src/app/sitemap.ts` – exports default `sitemap()` with absolute URLs
- **robots.ts**: `src/app/robots.ts` – exports default `robots()` with User-agent, Allow, Sitemap
- **No middleware** – nothing blocks `/sitemap.xml` or `/robots.txt`
- **vercel.json** – rewrites do not match sitemap or robots
- **next.config.js** – no redirects/rewrites
