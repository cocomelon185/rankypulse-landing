-- ─── Phase 5: Rank Intelligence System ───────────────────────────────────────

-- rank_keywords: one row per (user, domain, keyword, device) — survives project re-crawls
CREATE TABLE IF NOT EXISTS public.rank_keywords (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain      TEXT         NOT NULL,
  keyword     TEXT         NOT NULL,
  target_url  TEXT,
  country     TEXT         NOT NULL DEFAULT 'US',
  device      TEXT         NOT NULL DEFAULT 'desktop' CHECK (device IN ('desktop','mobile')),
  volume      INTEGER,
  cpc         NUMERIC(8,2),
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, domain, keyword, device)
);

-- rank_history: daily SERP snapshots (NULL position = not in top 100)
CREATE TABLE IF NOT EXISTS public.rank_history (
  id             BIGSERIAL    PRIMARY KEY,
  keyword_id     UUID         NOT NULL REFERENCES public.rank_keywords(id) ON DELETE CASCADE,
  position       INTEGER,
  ranked_url     TEXT,
  checked_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  search_engine  TEXT         NOT NULL DEFAULT 'google'
);

-- visibility_snapshots: one row per (user, domain, day) — precomputed for the chart
CREATE TABLE IF NOT EXISTS public.visibility_snapshots (
  id            BIGSERIAL    PRIMARY KEY,
  user_id       UUID         NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  domain        TEXT         NOT NULL,
  score         NUMERIC(6,2) NOT NULL,
  snapshot_date DATE         NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, domain, snapshot_date)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS rank_keywords_user_domain_idx
  ON public.rank_keywords(user_id, domain);

CREATE INDEX IF NOT EXISTS rank_history_keyword_date_idx
  ON public.rank_history(keyword_id, checked_at DESC);

CREATE INDEX IF NOT EXISTS visibility_user_domain_date_idx
  ON public.visibility_snapshots(user_id, domain, snapshot_date DESC);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- API routes use supabaseAdmin (service role) so these policies are for
-- future client-side access only and do not affect existing server code.
ALTER TABLE public.rank_keywords        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_history         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visibility_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY rank_keywords_self ON public.rank_keywords
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY rank_history_self ON public.rank_history
  FOR ALL USING (
    keyword_id IN (SELECT id FROM public.rank_keywords WHERE user_id = auth.uid())
  );

CREATE POLICY visibility_self ON public.visibility_snapshots
  FOR ALL USING (user_id = auth.uid());
