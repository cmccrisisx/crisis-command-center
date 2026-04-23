DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'monitoring_window' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.monitoring_window AS ENUM ('24h', '7d', '30d', '90d');
  END IF;
END $$;

ALTER TABLE public.crises
ADD COLUMN IF NOT EXISTS default_monitoring_window public.monitoring_window;

UPDATE public.crises
SET default_monitoring_window = '7d'::public.monitoring_window
WHERE default_monitoring_window IS NULL;

ALTER TABLE public.crises
ALTER COLUMN default_monitoring_window SET DEFAULT '7d'::public.monitoring_window,
ALTER COLUMN default_monitoring_window SET NOT NULL;

ALTER TABLE public.tracking_rules
ADD COLUMN IF NOT EXISTS monitoring_window public.monitoring_window;

CREATE OR REPLACE FUNCTION public.get_effective_monitoring_window(_crisis_id uuid, _rule_id uuid DEFAULT NULL)
RETURNS public.monitoring_window
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rule_window public.monitoring_window;
  _case_window public.monitoring_window;
BEGIN
  IF _rule_id IS NOT NULL THEN
    SELECT monitoring_window INTO _rule_window
    FROM public.tracking_rules
    WHERE id = _rule_id
    LIMIT 1;
  END IF;

  IF _rule_window IS NOT NULL THEN
    RETURN _rule_window;
  END IF;

  SELECT default_monitoring_window INTO _case_window
  FROM public.crises
  WHERE id = _crisis_id
  LIMIT 1;

  RETURN COALESCE(_case_window, '7d'::public.monitoring_window);
END;
$$;