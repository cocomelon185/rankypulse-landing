-- user_settings: generic key-value store for per-user preferences
-- Used by: rank competitor tracking, rank alert rules, and other feature flags.

create table if not exists user_settings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  key          text not null,
  value        jsonb not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (user_id, key)
);

-- RLS
alter table user_settings enable row level security;

create policy "Users can manage their own settings"
  on user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_user_settings_user_key on user_settings(user_id, key);
