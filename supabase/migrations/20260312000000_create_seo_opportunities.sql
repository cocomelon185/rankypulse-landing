-- Phase 5.2: SEO Opportunity Alerts System
-- Creates the seo_opportunities table for persisting detected opportunities.
-- Detection logic runs in opportunity-engine.ts after each daily rank refresh.

CREATE TABLE IF NOT EXISTS public.seo_opportunities (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  keyword_id             UUID        NOT NULL REFERENCES public.rank_keywords(id) ON DELETE CASCADE,
  domain                 TEXT        NOT NULL,
  keyword                TEXT        NOT NULL,
  current_position       INTEGER     NOT NULL,
  target_position        INTEGER     NOT NULL DEFAULT 8,
  search_volume          INTEGER     NOT NULL DEFAULT 0,
  estimated_traffic_gain INTEGER     NOT NULL DEFAULT 0,
  recommended_actions    JSONB       NOT NULL DEFAULT '[]',
  -- open: active opportunity | dismissed: user dismissed | completed: reached page 1 or user marked done
  status                 TEXT        NOT NULL DEFAULT 'open'
                           CHECK (status IN ('open', 'dismissed', 'completed')),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- One opportunity row per user+keyword — upsert-friendly deduplication
  UNIQUE (user_id, keyword_id)
);

-- Fast lookup for per-user per-domain opportunities
CREATE INDEX idx_seo_opp_user_domain ON public.seo_opportunities(user_id, domain);
-- Fast filtering by status (for dashboard / email)
CREATE INDEX idx_seo_opp_status ON public.seo_opportunities(user_id, status);
-- Fast traffic gain sorting
CREATE INDEX idx_seo_opp_gain ON public.seo_opportunities(user_id, estimated_traffic_gain DESC);

-- updated_at auto-trigger
CREATE OR REPLACE FUNCTION update_seo_opportunities_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_seo_opp_updated_at
  BEFORE UPDATE ON public.seo_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_seo_opportunities_updated_at();

-- Row Level Security
ALTER TABLE public.seo_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own opportunities"
  ON public.seo_opportunities
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
