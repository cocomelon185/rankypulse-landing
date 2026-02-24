# Traffic System "B" — Verification Runbook

## Quick verification

```bash
# 1. Start dev server (Turbopack disabled for stability)
NEXT_DISABLE_TURBOPACK=1 npm run dev

# 2. In another terminal, check hub
curl -I http://localhost:3000/audit

# 3. Check one slug
curl -I http://localhost:3000/audit/wordpress-seo-audit

# 4. Confirm canonical + title + meta description in HTML head
curl -sS http://localhost:3000/audit/wordpress-seo-audit | perl -0777 -ne 'print $1 if /<head[^>]*>(.*?)<\/head>/s' | rg -n 'canonical|<title>|description'

# 5. Check sitemap includes audit routes
curl -sS http://localhost:3000/sitemap.xml | rg -n 'audit'
```

## Expected results

- `curl -I /audit` → 200 OK
- `curl -I /audit/wordpress-seo-audit` → 200 OK
- Head grep → should show `<link rel="canonical"`, `<title>`, and `meta name="description"`
- Sitemap → should list `/audit`, `/audit/wordpress-seo-audit`, etc.
