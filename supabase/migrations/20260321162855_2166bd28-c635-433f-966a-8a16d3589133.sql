
-- Create verified_communications table
CREATE TABLE public.verified_communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_title text NOT NULL,
  authorizing_executive text NOT NULL,
  content_hash text NOT NULL,
  signature text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text NOT NULL DEFAULT 'application/octet-stream',
  minted_by uuid NOT NULL,
  minted_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'anchoring',
  chain_tx_hash text,
  verification_url text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Index on content_hash for fast public lookups
CREATE INDEX idx_verified_communications_hash ON public.verified_communications (content_hash);

-- Enable RLS
ALTER TABLE public.verified_communications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all records
CREATE POLICY "Authenticated can view verified communications"
  ON public.verified_communications FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can insert own records
CREATE POLICY "Users can mint own communications"
  ON public.verified_communications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = minted_by);

-- Admin can update status
CREATE POLICY "Admin can update verified communications"
  ON public.verified_communications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Anon can look up by content_hash (public verification)
CREATE POLICY "Public can verify by hash"
  ON public.verified_communications FOR SELECT TO anon
  USING (true);

-- Storage bucket for verified documents (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('verified-documents', 'verified-documents', false);

-- Storage policies
CREATE POLICY "Authenticated can upload verified docs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verified-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated can view own verified docs"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'verified-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
