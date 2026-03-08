-- Task completions: persist Action Center task status (done, verified, snoozed)
-- so users don't lose progress when they navigate away or refresh.

CREATE TABLE IF NOT EXISTS public.task_completions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  domain      TEXT        NOT NULL,
  issue_id    TEXT        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'done',   -- done | verified | snoozed | regression
  marked_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  UNIQUE (user_id, domain, issue_id)
);

-- Fast lookup for Action Center page load
CREATE INDEX idx_tc_user_domain ON public.task_completions(user_id, domain);

-- Enable RLS
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;

-- Users can only see/modify their own completions
CREATE POLICY "Users manage own task completions"
  ON public.task_completions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
