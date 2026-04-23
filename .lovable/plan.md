
Goal
- Stop surfacing stale 2025 stories as if they were current, and give users clear control over how far back monitoring should search and display results.

What is causing the issue now
- The ingestion function currently calls Firecrawl search without any recency constraint, so old stories can be returned.
- New signals are stamped with `detectedAt = now()` at ingest time, which makes older articles look freshly discovered.
- There is no user-controlled monitoring window in tracking rules, case settings, or page-level filters for Signals.
- Analytics filters only affect what is displayed, not what the crawler/search job asks external sources to return.

Implementation plan

1. Fix freshness at the ingestion source
- Update `supabase/functions/ingest-signals/index.ts` so search requests include an explicit recency constraint.
- Use a time-window parameter for each search task so the crawler asks for:
  - last 24h
  - last 7d
  - last 30d
  - optionally longer presets if needed
- Prefer using source-published timestamps from search results when available instead of always treating ingestion time as discovery time.
- Keep `ingested_at` for pipeline timing, but make `detected_at` reflect the story timestamp when that can be determined.

2. Add monitoring-duration settings at all three levels you requested
- Per keyword/query:
  - extend `tracking_rules` with a monitoring/lookback preset column
  - default existing rules to a safe value such as `7d`
- Per case:
  - add a case-level default monitoring window on `crises`
  - use it when a rule does not have its own override
- Global filter too:
  - add a page-level “monitoring window” control in Signals and Analytics so users can quickly narrow or widen what they see without editing saved rules

3. Define a clear precedence model
- Implement one consistent rule for how duration is chosen:
```text
rule-specific duration
  -> else case default duration
  -> else system default duration
```
- Keep the page-level global filter display-only for UI analysis unless the user manually triggers ingestion from that page, in which case the request can optionally pass a temporary override.

4. Upgrade the Tracking Manager UI
- Extend `src/components/TrackingRuleManager.tsx` so admins can choose a monitoring duration when creating or editing:
  - brand keywords
  - competitor keywords
  - search queries
- Show the effective monitoring window in the rules table so admins can see which rules are using case defaults versus custom overrides.
- Add a case-level default duration control in the same management flow or adjacent admin settings area.

5. Make manual refresh and live monitoring respect duration
- Update `src/pages/Signals.tsx` manual ingestion trigger so it can optionally send the active global duration override when the user clicks refresh.
- Keep scheduled ingestion using saved rule/case settings by default.
- Ensure live alerts still use the same realtime pipeline, but only for newly discovered content inside the effective freshness window.

6. Tighten freshness logic in Analytics
- Extend `src/hooks/useAnalyticsFilters.ts` and `src/components/analytics/AnalyticsFiltersBar.tsx` so the current time window is clearly visible and aligned with monitoring duration concepts.
- Differentiate:
  - monitoring duration = what the system searches externally
  - analytics range = what the UI displays from stored signals
- If both are present on the Analytics page, label them clearly so users do not confuse crawl scope with dashboard filtering.

7. Preserve and expose publication vs ingestion timing
- Update analytics and signal detail views to use consistent timestamps:
  - published/detected time for story freshness
  - ingested time for pipeline latency
- This prevents old stories from appearing “new” just because they were recently fetched.
- Show freshness labels based on actual story recency where possible.

8. Add safety filters to reduce stale content
- Add a post-search validation layer in ingestion:
  - discard results outside the allowed window when the result metadata reveals they are too old
  - optionally down-rank or skip ambiguous results with no usable timestamp if stricter freshness mode is chosen
- Keep logging for skipped stale results so admins can confirm the crawler is enforcing freshness.

9. Database and backend changes
- Create migrations for the new duration fields and any supporting indexes/defaults.
- Backfill existing records so current rules and cases have valid defaults.
- Keep RLS intact; this is mostly admin-managed configuration and backend ingestion behavior.
- If needed, add a small typed helper or RPC/view only for reading effective duration settings in the UI.

10. Production validation
- Test with the IHS Nigeria case and confirm:
  - searches no longer return obviously stale 2025 stories when a short window is selected
  - per-rule overrides work
  - case defaults apply when rule overrides are absent
  - Signals global filter changes visible results correctly
  - Analytics global filter still updates charts/KPIs correctly
  - live alerts continue to appear for truly recent stories

Expected outcome
- The crawler/search job will prioritize current stories and conversations instead of curating outdated material.
- Users will be able to control monitoring duration:
  - per keyword/query
  - per case
  - with a global page-level filter
- Signals and Analytics will better reflect real-world freshness, with timestamps and labels users can trust.

Technical details
- Files likely involved:
  - `supabase/functions/ingest-signals/index.ts`
  - `src/components/TrackingRuleManager.tsx`
  - `src/pages/Signals.tsx`
  - `src/hooks/useAnalyticsFilters.ts`
  - `src/components/analytics/AnalyticsFiltersBar.tsx`
  - `src/components/analytics/useAnalyticsData.ts`
  - `src/pages/Analytics.tsx`
  - one or more migrations for new duration columns/defaults
- Data model direction:
```text
tracking_rules.monitoring_window (optional override)
crises.default_monitoring_window
UI global filter = temporary display/runtime override
```
- Freshness rule:
```text
published/detected time = story recency
ingested_at = pipeline timing
```
