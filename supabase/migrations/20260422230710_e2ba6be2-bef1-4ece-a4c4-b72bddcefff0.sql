ALTER TABLE public.signals
ADD COLUMN IF NOT EXISTS matched_keyword text,
ADD COLUMN IF NOT EXISTS tracking_rule_id uuid,
ADD COLUMN IF NOT EXISTS ingested_at timestamp with time zone NOT NULL DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'signals_tracking_rule_id_fkey'
  ) THEN
    ALTER TABLE public.signals
    ADD CONSTRAINT signals_tracking_rule_id_fkey
    FOREIGN KEY (tracking_rule_id)
    REFERENCES public.tracking_rules(id)
    ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_signals_crisis_ingested_at
  ON public.signals (crisis_id, ingested_at DESC);

CREATE INDEX IF NOT EXISTS idx_signals_tracking_rule_id
  ON public.signals (tracking_rule_id);

CREATE INDEX IF NOT EXISTS idx_signals_matched_keyword
  ON public.signals (matched_keyword);