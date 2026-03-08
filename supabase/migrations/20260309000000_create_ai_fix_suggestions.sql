-- AI fix suggestions: cache AI-generated fix text per user/domain/issue
-- so we don't call Claude on every click. 24-hour TTL enforced at app level.

CREATE TABLE IF NOT EXISTS public.ai_fix_suggestions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL,
  domain      TEXT        NOT NULL,
  issue_id    TEXT        NOT NULL,
  suggestion  TEXT        NOT NULL,       -- full AI-generated text
  metadata    JSONB,                      -- { charCount, keyword, issueTitle, model }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup: user + domain + issue (latest suggestion)
CREATE INDEX idx_ais_user_domain_issue
  ON public.ai_fix_suggestions (user_id, domain, issue_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.ai_fix_suggestions ENABLE ROW LEVEL SECURITY;

-- Users can only see / manage their own suggestions
CREATE POLICY "Users manage own ai fix suggestions"
  ON public.ai_fix_suggestions
  FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
