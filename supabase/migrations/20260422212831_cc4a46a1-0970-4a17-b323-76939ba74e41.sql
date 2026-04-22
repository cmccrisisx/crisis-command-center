CREATE TABLE public.tracking_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crisis_id UUID NOT NULL REFERENCES public.crises(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  label TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 100,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT tracking_rules_rule_type_check CHECK (rule_type IN ('keyword', 'query')),
  CONSTRAINT tracking_rules_priority_check CHECK (priority >= 0),
  CONSTRAINT tracking_rules_unique_per_case UNIQUE (crisis_id, rule_type, rule_text)
);

ALTER TABLE public.tracking_rules ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tracking_rules_crisis_priority
  ON public.tracking_rules (crisis_id, priority, created_at DESC);

CREATE INDEX idx_tracking_rules_active
  ON public.tracking_rules (is_active, rule_type, crisis_id);

CREATE POLICY "Authenticated users can view tracking rules"
ON public.tracking_rules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can create tracking rules"
ON public.tracking_rules
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tracking rules"
ON public.tracking_rules
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tracking rules"
ON public.tracking_rules
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_tracking_rules_updated_at
BEFORE UPDATE ON public.tracking_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();