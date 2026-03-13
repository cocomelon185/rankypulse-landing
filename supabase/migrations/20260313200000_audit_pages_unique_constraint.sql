-- Fix: audit_pages upsert requires UNIQUE constraint on (job_id, url)
-- Without this, every upsert with onConflict: "job_id,url" silently fails (PostgreSQL error 42P10)
-- This was the root cause of all sites scoring 95 with zero issues

-- Step 1: Remove any duplicate rows (keep the latest by id)
DELETE FROM public.audit_pages a
USING public.audit_pages b
WHERE a.job_id = b.job_id AND a.url = b.url AND a.id < b.id;

-- Step 2: Add the unique constraint
ALTER TABLE public.audit_pages
ADD CONSTRAINT audit_pages_job_url_unique UNIQUE (job_id, url);
