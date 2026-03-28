create table if not exists public.keyword_suggestion_cache (
  id uuid primary key default gen_random_uuid(),
  cache_key text not null unique,
  domain text not null default '',
  topic text not null default '',
  country_code text not null default 'US',
  language_code text not null default 'en',
  payload_json jsonb not null,
  suggestion_count integer not null default 0,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_keyword_suggestion_cache_domain
  on public.keyword_suggestion_cache (domain);

create index if not exists idx_keyword_suggestion_cache_topic
  on public.keyword_suggestion_cache (topic);

create index if not exists idx_keyword_suggestion_cache_expires_at
  on public.keyword_suggestion_cache (expires_at);
