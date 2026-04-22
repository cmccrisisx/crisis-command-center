DROP INDEX IF EXISTS public.tracking_rules_unique_normalized_idx;

CREATE UNIQUE INDEX tracking_rules_unique_normalized_idx
ON public.tracking_rules (
  crisis_id,
  platform,
  rule_type,
  lower(regexp_replace(btrim(rule_text), '\s+', ' ', 'g'))
);