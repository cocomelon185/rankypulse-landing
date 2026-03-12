-- DataForSEO cost-control foundation for keyword research.

CREATE TABLE IF NOT EXISTS public.keyword_research_cache (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key           TEXT NOT NULL UNIQUE,
  domain              TEXT NOT NULL,
  seed_keyword        TEXT NOT NULL,
  country_code        TEXT NOT NULL,
  language_code       TEXT NOT NULL DEFAULT 'en',
  mode                TEXT NOT NULL DEFAULT 'preview',
  provider            TEXT NOT NULL DEFAULT 'dataforseo',
  payload_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
  keyword_count       INTEGER NOT NULL DEFAULT 0,
  contains_difficulty BOOLEAN NOT NULL DEFAULT false,
  estimated_cost      NUMERIC(10,6) NOT NULL DEFAULT 0,
  source_endpoint     TEXT,
  fetched_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at          TIMESTAMPTZ NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS keyword_research_cache_lookup_idx
  ON public.keyword_research_cache(domain, seed_keyword, country_code, language_code, mode);

CREATE INDEX IF NOT EXISTS keyword_research_cache_expires_idx
  ON public.keyword_research_cache(expires_at DESC);

CREATE TABLE IF NOT EXISTS public.keyword_metrics_cache (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword                    TEXT NOT NULL,
  country_code               TEXT NOT NULL,
  language_code              TEXT NOT NULL DEFAULT 'en',
  volume                     INTEGER,
  cpc                        NUMERIC(8,4),
  competition                NUMERIC(4,3),
  difficulty                 NUMERIC(6,2),
  difficulty_label           TEXT,
  difficulty_status          TEXT NOT NULL DEFAULT 'pending',
  intent                     TEXT NOT NULL DEFAULT 'unknown',
  serp_snapshot_hash         TEXT,
  search_results_count       BIGINT,
  serp_features              JSONB NOT NULL DEFAULT '[]'::jsonb,
  serp_features_count        INTEGER NOT NULL DEFAULT 0,
  avg_domain_authority_top10 NUMERIC(6,2),
  avg_backlinks_top10        NUMERIC(12,2),
  source_endpoint            TEXT,
  estimated_cost             NUMERIC(10,6) NOT NULL DEFAULT 0,
  fetched_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                 TIMESTAMPTZ NOT NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(keyword, country_code, language_code)
);

CREATE INDEX IF NOT EXISTS keyword_metrics_cache_expiry_idx
  ON public.keyword_metrics_cache(expires_at DESC);

CREATE INDEX IF NOT EXISTS keyword_metrics_cache_status_idx
  ON public.keyword_metrics_cache(difficulty_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider            TEXT NOT NULL DEFAULT 'dataforseo',
  endpoint            TEXT NOT NULL,
  user_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,
  team_id             UUID,
  project_id          UUID,
  cache_hit           BOOLEAN NOT NULL DEFAULT false,
  request_fingerprint TEXT NOT NULL,
  request_units       INTEGER NOT NULL DEFAULT 1,
  estimated_cost      NUMERIC(10,6) NOT NULL DEFAULT 0,
  status_code         INTEGER,
  duration_ms         INTEGER,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_usage_logs_created_idx
  ON public.api_usage_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS api_usage_logs_user_created_idx
  ON public.api_usage_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS api_usage_logs_provider_endpoint_idx
  ON public.api_usage_logs(provider, endpoint, created_at DESC);

CREATE INDEX IF NOT EXISTS api_usage_logs_fingerprint_idx
  ON public.api_usage_logs(request_fingerprint, created_at DESC);

CREATE TABLE IF NOT EXISTS public.daily_api_budget_state (
  date               DATE NOT NULL,
  provider           TEXT NOT NULL DEFAULT 'dataforseo',
  spend_estimate     NUMERIC(12,6) NOT NULL DEFAULT 0,
  soft_limit_reached BOOLEAN NOT NULL DEFAULT false,
  hard_limit_reached BOOLEAN NOT NULL DEFAULT false,
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY(date, provider)
);

