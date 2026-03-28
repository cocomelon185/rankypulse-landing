-- Keyword research intelligence cache

CREATE TABLE IF NOT EXISTS public.keyword_research_runs (
  id             TEXT PRIMARY KEY,
  seed_keyword   TEXT NOT NULL,
  country        TEXT NOT NULL,
  language_code  TEXT NOT NULL DEFAULT 'en',
  status         TEXT NOT NULL DEFAULT 'completed',
  generated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(seed_keyword, country, language_code)
);

CREATE TABLE IF NOT EXISTS public.keyword_intelligence (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                       TEXT NOT NULL REFERENCES public.keyword_research_runs(id) ON DELETE CASCADE,
  keyword                      TEXT NOT NULL,
  search_volume                INTEGER,
  cpc                          NUMERIC(8,4),
  ads_competition              NUMERIC(4,3),
  search_results_count         BIGINT,
  serp_features_count          INTEGER NOT NULL DEFAULT 0,
  serp_features                JSONB NOT NULL DEFAULT '[]'::jsonb,
  avg_domain_authority_top10   NUMERIC(6,2),
  avg_backlinks_top10          NUMERIC(12,2),
  difficulty_score             NUMERIC(6,2),
  difficulty_label             TEXT NOT NULL DEFAULT 'Difficulty unavailable',
  difficulty_status            TEXT NOT NULL DEFAULT 'unavailable',
  intent                       TEXT NOT NULL DEFAULT 'unknown',
  recommended_content_type     TEXT NOT NULL DEFAULT 'Blog Post',
  estimated_traffic_low        INTEGER,
  estimated_traffic_high       INTEGER,
  opportunity_score            NUMERIC(6,2),
  opportunity_rating           TEXT NOT NULL DEFAULT 'Unavailable',
  opportunity_status           TEXT NOT NULL DEFAULT 'Opportunity unavailable',
  cluster_id                   TEXT,
  cluster_name                 TEXT,
  top_opportunity_in_cluster   BOOLEAN NOT NULL DEFAULT false,
  serp_pressure                TEXT NOT NULL DEFAULT 'Low',
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, keyword)
);

CREATE TABLE IF NOT EXISTS public.keyword_clusters (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id                 TEXT NOT NULL REFERENCES public.keyword_research_runs(id) ON DELETE CASCADE,
  cluster_id             TEXT NOT NULL,
  cluster_name           TEXT NOT NULL,
  total_search_volume    INTEGER NOT NULL DEFAULT 0,
  average_difficulty     NUMERIC(6,2),
  top_keyword            TEXT NOT NULL,
  top_opportunity_score  NUMERIC(6,2),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(run_id, cluster_id)
);

CREATE INDEX IF NOT EXISTS keyword_research_runs_generated_idx
  ON public.keyword_research_runs(generated_at DESC);

CREATE INDEX IF NOT EXISTS keyword_intelligence_run_opportunity_idx
  ON public.keyword_intelligence(run_id, opportunity_score DESC);

CREATE INDEX IF NOT EXISTS keyword_clusters_run_volume_idx
  ON public.keyword_clusters(run_id, total_search_volume DESC);
