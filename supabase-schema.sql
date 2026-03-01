-- Supabase Schema Setup for Weekly SEO Audits
-- Paste this into the Supabase SQL Editor and run it.

-- 1. Create the saved_domains table
CREATE TABLE IF NOT EXISTS public.saved_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    last_score INTEGER DEFAULT 0,
    previous_score INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    
    -- Ensure a user can only save a specific domain once
    UNIQUE(user_id, domain)
);

-- 2. Setup RLS (Row Level Security) so users can only read/write their own domains
ALTER TABLE public.saved_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved domains"
    ON public.saved_domains FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved domains"
    ON public.saved_domains FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved domains"
    ON public.saved_domains FOR DELETE
    USING (auth.uid() = user_id);

-- Optional: Create an index on last_scanned_at to speed up the weekly Cron query
CREATE INDEX IF NOT EXISTS idx_saved_domains_last_scanned 
ON public.saved_domains(last_scanned_at);
