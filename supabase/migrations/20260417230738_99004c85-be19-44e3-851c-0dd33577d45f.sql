
CREATE OR REPLACE FUNCTION public.get_cron_jobs_status()
RETURNS TABLE (
  jobid bigint,
  jobname text,
  schedule text,
  active boolean,
  command text,
  last_start timestamptz,
  last_end timestamptz,
  last_status text,
  last_duration_ms numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, cron
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can view cron jobs';
  END IF;

  RETURN QUERY
  SELECT
    j.jobid,
    j.jobname::text,
    j.schedule::text,
    j.active,
    j.command::text,
    r.start_time AS last_start,
    r.end_time AS last_end,
    r.status::text AS last_status,
    CASE
      WHEN r.end_time IS NOT NULL AND r.start_time IS NOT NULL
        THEN EXTRACT(EPOCH FROM (r.end_time - r.start_time)) * 1000
      ELSE NULL
    END AS last_duration_ms
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, end_time, status
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC NULLS LAST
    LIMIT 1
  ) r ON TRUE
  ORDER BY j.jobname;
END;
$$;

REVOKE ALL ON FUNCTION public.get_cron_jobs_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cron_jobs_status() TO authenticated;
