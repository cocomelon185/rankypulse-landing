-- ============================================================
-- Migration: Cost tracking + Keyword Research + Backlinks + Competitor Intelligence
-- Date: 2026-03-13
-- ============================================================

-- ── 1. API Cost Tracking ──────────────────────────────────────
-- Logs every DataForSEO (and future) API call with estimated cost.
-- Used for admin cost visibility and future per-user billing.
CREATE TABLE IF NOT EXISTS public.api_costs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         REFERENCES public.users(id) ON DELETE CASCADE,
  service     VARCHAR(50)  NOT NULL DEFAULT 'dataforseo',
  operation   VARCHAR(100) NOT NULL, -- 'serp_query' | 'keyword_volume' | 'backlinks' | 'competitors' | 'keyword_ideas'
  units       INTEGER      NOT NULL DEFAULT 1,
  cost_usd    NUMERIC(10,6) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_costs_user_created_idx ON public.api_costs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS api_costs_created_idx      ON public.api_costs(created_at DESC);
CREATE INDEX IF NOT EXISTS api_costs_operation_idx    ON public.api_costs(operation, created_at DESC);

-- ── 2. Keyword Suggestions (Keyword Research cache) ──────────
-- Caches DataForSEO keyword-for-keywords results for 7 days.
-- Avoids repeat API calls for the same seed keyword.
CREATE TABLE IF NOT EXISTS public.keyword_suggestions (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID          REFERENCES public.users(id) ON DELETE CASCADE,
  domain        TEXT          NOT NULL,
  seed_keyword  TEXT          NOT NULL,
  keyword       TEXT          NOT NULL,
  volume        INTEGER,
  cpc           NUMERIC(8,4),
  competition   NUMERIC(4,3), -- 0.0 to 1.0
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain, seed_keyword, keyword)
);

CREATE INDEX IF NOT EXISTS kw_suggestions_user_domain_idx ON public.keyword_suggestions(user_id, domain);
CREATE INDEX IF NOT EXISTS kw_suggestions_seed_idx        ON public.keyword_suggestions(user_id, seed_keyword, created_at DESC);

-- ── 3. Backlink Snapshots ─────────────────────────────────────
-- Stores daily domain backlink summaries from DataForSEO.
-- One snapshot per domain per day (upserted).
CREATE TABLE IF NOT EXISTS public.backlink_snapshots (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID          REFERENCES public.users(id) ON DELETE CASCADE,
  domain             TEXT          NOT NULL,
  total_backlinks    INTEGER,
  referring_domains  INTEGER,
  trust_score        NUMERIC(4,1),
  spam_score         NUMERIC(4,1),
  gov_count          INTEGER       DEFAULT 0,
  edu_count          INTEGER       DEFAULT 0,
  dofollow_count     INTEGER       DEFAULT 0,
  nofollow_count     INTEGER       DEFAULT 0,
  snapshot_date      DATE          NOT NULL DEFAULT CURRENT_DATE,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain, snapshot_date)
);

CREATE INDEX IF NOT EXISTS backlinks_user_domain_idx ON public.backlink_snapshots(user_id, domain, snapshot_date DESC);

-- ── 4. Competitor Snapshots ───────────────────────────────────
-- Stores top competitors per domain, refreshed on demand (cached 24h).
-- Each row is one competitor for a given domain snapshot.
CREATE TABLE IF NOT EXISTS public.competitor_snapshots (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID          REFERENCES public.users(id) ON DELETE CASCADE,
  domain              TEXT          NOT NULL,
  competitor_domain   TEXT          NOT NULL,
  intersections       INTEGER,      -- keywords in common
  competitor_se_type  TEXT,         -- 'organic'
  avg_position        NUMERIC(6,1),
  overlap_percent     NUMERIC(5,2),
  snapshot_date       DATE          NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain, competitor_domain, snapshot_date)
);

CREATE INDEX IF NOT EXISTS competitors_user_domain_idx ON public.competitor_snapshots(user_id, domain, snapshot_date DESC);
