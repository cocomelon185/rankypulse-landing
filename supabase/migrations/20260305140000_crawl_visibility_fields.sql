-- Visibility fields for crawl_jobs: lets the UI show what the crawler is doing right now
-- Run in Supabase SQL editor or via supabase db push

ALTER TABLE public.crawl_jobs
  ADD COLUMN IF NOT EXISTS current_url      TEXT,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error       TEXT;

-- Index: useful for finding stalled jobs
CREATE INDEX IF NOT EXISTS crawl_jobs_heartbeat_idx
  ON public.crawl_jobs (user_id, last_heartbeat_at DESC)
  WHERE status IN ('crawling', 'pending');
