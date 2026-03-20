-- Allow authenticated users to delete demo requests (admin use)
CREATE POLICY "Authenticated can delete demo requests"
  ON public.demo_requests FOR DELETE
  TO authenticated
  USING (true);