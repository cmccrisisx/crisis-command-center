
-- 1. demo_requests: restrict SELECT and DELETE to admins only
DROP POLICY IF EXISTS "Authenticated can view demo requests" ON public.demo_requests;
CREATE POLICY "Admins can view demo requests"
  ON public.demo_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can delete demo requests" ON public.demo_requests;
CREATE POLICY "Admins can delete demo requests"
  ON public.demo_requests FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. user_roles: restrict SELECT to own roles (admin bypass via existing ALL policy)
DROP POLICY IF EXISTS "Roles viewable by authenticated" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. response_log: restrict UPDATE to owner or admin
DROP POLICY IF EXISTS "Authenticated can update responses" ON public.response_log;
CREATE POLICY "Owner or admin can update responses"
  ON public.response_log FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- 4. crises: restrict UPDATE to creator or admin
DROP POLICY IF EXISTS "Authenticated can update crises" ON public.crises;
CREATE POLICY "Creator or admin can update crises"
  ON public.crises FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- 5. response_templates: restrict UPDATE to creator or admin
DROP POLICY IF EXISTS "Authenticated can update templates" ON public.response_templates;
CREATE POLICY "Creator or admin can update templates"
  ON public.response_templates FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- 6. narratives: tighten INSERT WITH CHECK
DROP POLICY IF EXISTS "Authenticated can insert narratives" ON public.narratives;
CREATE POLICY "Authenticated can insert narratives"
  ON public.narratives FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 7. reputation_snapshots: tighten INSERT WITH CHECK
DROP POLICY IF EXISTS "Authenticated can insert snapshots" ON public.reputation_snapshots;
CREATE POLICY "Authenticated can insert snapshots"
  ON public.reputation_snapshots FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
