CREATE TABLE IF NOT EXISTS public.ingestion_rule_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.tracking_rules(id) ON DELETE CASCADE,
  crisis_id uuid NOT NULL REFERENCES public.crises(id) ON DELETE CASCADE,
  last_run_at timestamp with time zone NOT NULL DEFAULT now(),
  last_crawl_window public.monitoring_window NOT NULL,
  stale_results_skipped integer NOT NULL DEFAULT 0,
  timestamp_source_counts jsonb NOT NULL DEFAULT '{"published":0,"modified":0,"inline":0,"fallback":0}'::jsonb,
  total_results_considered integer NOT NULL DEFAULT 0,
  inserted_results integer NOT NULL DEFAULT 0,
  UNIQUE (rule_id)
);

ALTER TABLE public.ingestion_rule_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view ingestion QA"
ON public.ingestion_rule_qa
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS ingestion_rule_qa_crisis_idx
ON public.ingestion_rule_qa (crisis_id, last_run_at DESC);

CREATE INDEX IF NOT EXISTS ingestion_rule_qa_last_run_idx
ON public.ingestion_rule_qa (last_run_at DESC);