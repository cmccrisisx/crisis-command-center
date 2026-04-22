ALTER TABLE public.tracking_rules
ADD COLUMN platform TEXT NOT NULL DEFAULT 'all';

ALTER TABLE public.tracking_rules
ADD CONSTRAINT tracking_rules_platform_check
CHECK (platform IN ('all', 'twitter', 'news', 'blog', 'linkedin'));

ALTER TABLE public.tracking_rules
ADD CONSTRAINT tracking_rules_rule_text_not_blank
CHECK (char_length(btrim(rule_text)) > 0);

ALTER TABLE public.tracking_rules
DROP CONSTRAINT IF EXISTS tracking_rules_unique_per_case;

CREATE UNIQUE INDEX IF NOT EXISTS tracking_rules_unique_normalized_idx
ON public.tracking_rules (
  crisis_id,
  platform,
  rule_type,
  lower(btrim(rule_text))
);