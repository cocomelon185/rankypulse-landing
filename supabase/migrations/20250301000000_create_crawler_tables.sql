-- Track site-wide crawl progress
CREATE TABLE IF NOT EXISTS public.crawl_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, crawling, completed, failed
  pages_limit INTEGER NOT NULL DEFAULT 50,
  pages_crawled INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Queue of URLs discovered during the crawl
CREATE TABLE IF NOT EXISTS public.crawl_queue (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, done
  UNIQUE(job_id, url)
);

-- Results for each individual page audited
CREATE TABLE IF NOT EXISTS public.audit_pages (
  id BIGSERIAL PRIMARY KEY,
  job_id UUID REFERENCES public.crawl_jobs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  issues JSONB NOT NULL DEFAULT '[]',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS crawl_jobs_user_id_idx ON public.crawl_jobs(user_id);
CREATE INDEX IF NOT EXISTS crawl_queue_job_status_idx ON public.crawl_queue(job_id, status);
CREATE INDEX IF NOT EXISTS audit_pages_job_url_idx ON public.audit_pages(job_id, url);
