-- Add unique constraint on (user_id, type, domain) to prevent duplicate activity events
-- Only one event of each type per domain per user can exist
-- When duplicate attempts occur, they will be silently ignored by upsert logic

ALTER TABLE public.activity_events
ADD CONSTRAINT activity_events_user_type_domain_unique
UNIQUE (user_id, type, domain);
