-- activity_events: tracks user actions for the Recent Activity feed
-- Run this in Supabase SQL editor or via supabase db push

CREATE TABLE IF NOT EXISTS public.activity_events (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type        TEXT        NOT NULL,   -- project_created | audit_started | audit_completed | project_deleted
  domain      TEXT,
  meta        JSONB       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup by user (most common query)
CREATE INDEX IF NOT EXISTS activity_events_user_id_created_idx
  ON public.activity_events (user_id, created_at DESC);

-- RLS: each user can only see their own events
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "activity_events_select_own" ON public.activity_events;
CREATE POLICY "activity_events_select_own"
  ON public.activity_events FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "activity_events_insert_own" ON public.activity_events;
CREATE POLICY "activity_events_insert_own"
  ON public.activity_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);
