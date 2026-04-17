
DROP FUNCTION IF EXISTS public.get_cron_jobs_status();

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
  last_duration_ms numeric,
  history_7d jsonb
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
    END AS last_duration_ms,
    COALESCE(h.history, '[]'::jsonb) AS history_7d
  FROM cron.job j
  LEFT JOIN LATERAL (
    SELECT start_time, end_time, status
    FROM cron.job_run_details
    WHERE jobid = j.jobid
    ORDER BY start_time DESC NULLS LAST
    LIMIT 1
  ) r ON TRUE
  LEFT JOIN LATERAL (
    SELECT jsonb_agg(
      jsonb_build_object(
        'day', day_label,
        'succeeded', succeeded,
        'failed', failed
      ) ORDER BY day_label
    ) AS history
    FROM (
      SELECT
        to_char(d::date, 'YYYY-MM-DD') AS day_label,
        COUNT(*) FILTER (WHERE jrd.status = 'succeeded') AS succeeded,
        COUNT(*) FILTER (WHERE jrd.status = 'failed') AS failed
      FROM generate_series(
        (now() - interval '6 days')::date,
        now()::date,
        interval '1 day'
      ) AS d
      LEFT JOIN cron.job_run_details jrd
        ON jrd.jobid = j.jobid
       AND jrd.start_time::date = d::date
      GROUP BY d::date
      ORDER BY d::date
    ) per_day
  ) h ON TRUE
  ORDER BY j.jobname;
END;
$$;

REVOKE ALL ON FUNCTION public.get_cron_jobs_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_cron_jobs_status() TO authenticated;
