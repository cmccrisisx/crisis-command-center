
Goal
- Turn Analytics into a production-ready module with trustworthy case-level metrics, keyword attribution, live freshness visibility, and validation checks so the numbers shown in the UI match what the monitoring pipeline is actually producing.

What needs improvement today
- The current Analytics page only shows four basic panels plus keyword comparison.
- It pulls full table datasets client-side and computes metrics in the browser, which will not scale well.
- Keyword comparison currently falls back to text matching in signal content instead of using reliable matched-keyword attribution.
- Recent database rows show `matched_keyword` and `tracking_rule_id` are still null on live signals, so traceable keyword analytics is not yet dependable.
- Snapshot fields such as `share_of_voice` are currently synthetic/hardcoded, which makes some analytics look complete without being production-accurate.
- There is no date-range control, no export-ready analytics summary, and no production QA flow for validating ingestion-to-chart correctness.

Implementation plan

1. Rework the Analytics page into a real module
- Replace the current single-grid layout with a structured analytics dashboard:
  - KPI header row
  - trend charts
  - keyword intelligence
  - source / sentiment / influencer sections
  - live freshness + data quality status
- Add clear loading, empty, and error states for every section.
- Keep the current visual system: dark terminal aesthetic, mono labels, sharp cards, compact data-heavy layout.

2. Add production-grade filtering and scoping
- Add analytics controls for:
  - case selector support via existing active-case context
  - date range presets (24h, 7d, 30d, custom-ready structure)
  - source filter
  - sentiment filter
- Make all widgets respond to the same filter state so charts, KPIs, and tables stay consistent.

3. Replace client-heavy calculations with reliable aggregated queries
- Move core metrics away from “fetch everything and reduce in React” toward targeted queries and grouped data retrieval.
- Build analytics data loaders for:
  - KPI totals
  - sentiment-over-time series
  - platform/source distribution
  - keyword performance
  - influencer leaderboard
  - recent matched alerts / freshness
- Keep React Query, but split large page queries into stable, reusable hooks so the page remains responsive.

4. Fix keyword attribution before expanding keyword analytics
- Update the ingestion pipeline so every new signal consistently stores:
  - `matched_keyword`
  - `tracking_rule_id`
  - `ingested_at`
- Verify the insertion path is actually writing those fields in production, since current live rows show they are null.
- Add a backfill strategy for recent signals where attribution can be deterministically recovered from tracking rules and URLs/content.
- Update Analytics to prioritize these fields instead of content substring matching.

5. Expand the analytics feature set
- Add KPI cards for:
  - total mentions
  - negative share
  - positive share
  - estimated reach
  - active tracked keywords
  - last ingest freshness
  - median pipeline latency
- Add richer charting:
  - sentiment trend over time
  - mention volume over time
  - source mix
  - top matched keywords
  - keyword spike / momentum view
  - influencer impact with sentiment and reach
- Add a recent matched-signals table showing:
  - matched keyword
  - source
  - sentiment
  - author
  - detected time
  - ingest latency
  - source link

6. Make “analytics truthfulness” visible in the UI
- Add a small data-quality/status strip showing:
  - scheduler cadence
  - last successful ingest
  - freshness health
  - whether keyword attribution is complete or partial
- Reuse the existing live monitoring concepts already present in Tracking Manager, but adapt them for analytics operators.
- If a metric is derived from placeholder logic, label it clearly until replaced with production-grade computation.

7. Correct incomplete or placeholder metric logic
- Replace hardcoded / pseudo values where possible, especially:
  - `share_of_voice`
  - overly heuristic reach-only summaries
  - keyword comparison based on plain content matching
- Tighten how influencer ranking, sentiment mix, and spike score are computed so they are case-aware and time-range-aware.
- Ensure charts use consistent timestamps (`detected_at` vs `ingested_at`) depending on the metric purpose.

8. Add analytics export/readout support
- Add a compact “export analytics snapshot” or “send to reports” flow so a filtered analytics view can become a report section.
- Reuse the existing report/PDF pattern, but feed it real analytics summaries instead of generic text.
- Include selected filters in the exported output so results are auditable.

9. Production testing and verification
- Validate end-to-end for at least one live case, especially IHS Nigeria:
  - tracking rules exist
  - ingest job runs on cadence
  - signals are inserted
  - keyword attribution fields populate
  - snapshots update
  - analytics widgets reflect the same counts as the database
- Test edge cases:
  - no case selected
  - no signals in range
  - only one source
  - no influencer rows
  - delayed ingest / stale freshness
- Perform UI QA across dashboard, analytics, signals, and tracking-manager handoff so filters and compare links stay aligned.

Files likely involved
- `src/pages/Analytics.tsx`
- `src/components/analytics/KeywordComparisonPanel.tsx`
- new analytics-specific components/hooks for KPI cards, filters, charts, tables
- `src/components/LiveMonitoringPanel.tsx` for shared freshness/status patterns
- `supabase/functions/ingest-signals/index.ts`
- one or more migrations only if needed for backfill helpers, indexes, or analytics-oriented DB functions/views

Technical notes
- Existing ingestion logs confirm live searches are running for the new IHS Nigeria keywords.
- Existing signals table schema already supports `matched_keyword`, `tracking_rule_id`, and `ingested_at`, but current live rows still show null values, so implementation must verify and repair the write path and/or historical data.
- Current analytics accuracy is limited more by data quality and aggregation strategy than by chart components.
- The safest production path is:
```text
tracking_rules
  -> ingest-signals
  -> signals with keyword attribution
  -> snapshots / aggregates
  -> analytics queries
  -> reports/export
```

Expected outcome
- Analytics becomes a trustworthy, operator-ready module rather than a basic chart page.
- Keyword comparison becomes traceable to actual matched rules.
- Freshness and latency are visible inside analytics.
- The module is validated against real live data and ready for production use.
