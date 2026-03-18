CREATE OR REPLACE FUNCTION public.transition_approval_status(
  _response_id uuid,
  _new_status approval_status,
  _user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_status approval_status;
  _user_role app_role;
BEGIN
  SELECT approval_status INTO _current_status
  FROM public.response_log WHERE id = _response_id;
  
  IF _current_status IS NULL THEN
    RAISE EXCEPTION 'Response not found';
  END IF;

  SELECT role INTO _user_role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'legal_reviewer' THEN 2
    WHEN 'pr_manager' THEN 3
    WHEN 'social_manager' THEN 4
  END
  LIMIT 1;

  IF _user_role IS NULL THEN
    RAISE EXCEPTION 'User has no role';
  END IF;

  IF _user_role = 'admin' THEN
    NULL;
  ELSIF _user_role = 'pr_manager' AND _current_status = 'draft' AND _new_status = 'pending_legal' THEN
    NULL;
  ELSIF _user_role = 'legal_reviewer' AND _current_status = 'pending_legal' AND _new_status IN ('pending_exec', 'rejected') THEN
    NULL;
  ELSIF _user_role = 'legal_reviewer' AND _current_status = 'pending_exec' AND _new_status IN ('approved', 'rejected') THEN
    NULL;
  ELSIF _user_role = 'social_manager' AND _current_status = 'approved' AND _new_status = 'published' THEN
    NULL;
  ELSE
    RAISE EXCEPTION 'Role % cannot transition from % to %', _user_role, _current_status, _new_status;
  END IF;

  UPDATE public.response_log
  SET approval_status = _new_status,
      approved_by = CASE WHEN _new_status IN ('approved', 'rejected', 'published') THEN _user_id ELSE approved_by END,
      approved_at = CASE WHEN _new_status IN ('approved', 'rejected', 'published') THEN now() ELSE approved_at END,
      published_at = CASE WHEN _new_status = 'published' THEN now() ELSE published_at END
  WHERE id = _response_id;

  INSERT INTO public.activity_log (user_id, action, details)
  VALUES (_user_id, 'approval_transition', jsonb_build_object(
    'response_id', _response_id,
    'from_status', _current_status,
    'to_status', _new_status
  ));

  RETURN true;
END;
$$