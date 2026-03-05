-- Improve query performance for projects page and audit domain page

-- Index for domain-based queries (used when filtering by domain in /api/audits/data)
CREATE INDEX IF NOT EXISTS crawl_jobs_user_domain_idx
  ON public.crawl_jobs (user_id, domain, created_at DESC);

-- Index for status-filtered queries (used in /api/projects)
CREATE INDEX IF NOT EXISTS crawl_jobs_user_status_idx
  ON public.crawl_jobs (user_id, status, created_at DESC);

-- Auto-update updated_at on crawl_jobs when status changes
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS crawl_jobs_updated_at ON public.crawl_jobs;
CREATE TRIGGER crawl_jobs_updated_at
  BEFORE UPDATE ON public.crawl_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Index for audit_pages score queries (used when calculating domain scores)
CREATE INDEX IF NOT EXISTS audit_pages_job_score_idx
  ON public.audit_pages (job_id, score);
