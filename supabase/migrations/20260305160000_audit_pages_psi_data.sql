-- Add psi_data JSONB column to audit_pages to store full PageSpeed Insights response
-- This enables the Speed and Vitals pages to show real metrics (FCP, LCP, TTI, TBT, CLS, SI)
-- Only stored for the root page of each crawl job

ALTER TABLE public.audit_pages
ADD COLUMN IF NOT EXISTS psi_data JSONB;
