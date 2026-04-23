
Goal
- Confirm whether live mentions are flowing now, and fix the Analytics dashboard so unattributed mentions are reduced in the data and clearly handled in the UI.

What is confirmed already
- Realtime plumbing exists in the app:
  - `NotificationListener` subscribes to `signals` inserts for live alerts.
  - `Signals` page subscribes to `signals` inserts/updates/deletes.
  - `useAnalyticsData` subscribes to `signals` inserts when Live Mode is enabled.
- Recent production data shows the pipeline is active:
  - latest `ingested_at`: `2026-04-23 05:51:20+00`
  - latest `detected_at`: `2026-04-23 05:51:19+00`
  - `81` signals arrived in the last `60 minutes`
  - `0` signals arrived in the last `15 minutes` at the moment checked
- So: live mention capability is in place and working, but the feed was not actively receiving brand-new mentions in the last 15 minutes at the exact time of inspection.

Current problem found
- Analytics still has a large attribution gap:
  - `234` signals in the current 7-day window
  - `130` signals missing `matched_keyword` or `tracking_rule_id`
  - `55.6%` unattributed
- The dashboard currently groups these under `"Unattributed"` in keyword analytics, which makes the module look broken even when live ingestion itself is functioning.

Why the unattributed issue is still happening
- `useAnalyticsData` treats any missing `matched_keyword` as `"Unattributed"` and surfaces it in top keyword summaries.
- The live analytics subscription only listens for `INSERT`, so if a fresh signal is inserted first and repaired moments later by attribution backfill, Analytics may keep showing the stale unattributed version until a refetch.
- The backfill function only repairs rows it can confidently match from content/url/keywords; anything ambiguous remains null.
- The recent QA sample shows ingestion runs completing, but many rows are still ending up without final attribution.

Implementation plan

1. Make live Analytics track attribution repairs, not just new inserts
- Update `src/components/analytics/useAnalyticsData.ts` to subscribe to both:
  - `INSERT` on `signals`
  - `UPDATE` on `signals`
- On update, patch the cached signal row so when `matched_keyword` / `tracking_rule_id` are filled in by the repair flow, KPIs and keyword panels update immediately.
- Keep the existing Live Mode behavior, but make it truly realtime for attribution changes as well.

2. Separate “live mentions confirmed” from “attributed mentions”
- Extend analytics-derived metrics with:
  - live mention count in the active window
  - unattributed mention count
  - unattributed percentage
  - attributed mention count
- Use this to show operators that realtime ingestion is working even when attribution quality needs repair.

3. Fix KPI and status messaging on the dashboard
- Update `src/components/analytics/types.ts` and `AnalyticsKpiGrid.tsx` to include:
  - Attributed mentions
  - Unattributed mentions
  - Attribution coverage / gap
- Update `AnalyticsStatusStrip.tsx` so the attribution badge becomes more explicit, for example:
```text
Attribution complete
Attribution partial
Attribution critical
```
- This makes the issue measurable instead of hiding it inside keyword charts.

4. Stop “Unattributed” from polluting keyword ranking
- Update the keyword aggregation in `useAnalyticsData.ts` so:
  - matched keywords remain in “Top matched keywords”
  - unattributed rows are counted separately instead of competing with real tracked keywords
- Keep a dedicated unattributed metric/card so the data is still visible.
- Result: keyword panels represent actual tracked rules, not a null bucket.

5. Improve recent signal visibility
- Update `AnalyticsDetailPanels.tsx` so recent rows with missing attribution are visually flagged, not silently mixed in.
- Show a clear label such as:
  - “Pending attribution”
  - or “Needs repair”
- This helps admins distinguish between ingestion success and rule-linking failure.

6. Tighten the live cache behavior after repairs
- In `useAnalyticsData.ts`, whenever an updated signal becomes attributed:
  - remove it from the unattributed count
  - recalculate keyword summaries
  - refresh recent alerts ordering if needed
- This ensures the dashboard reflects the same repaired state the database has, without waiting for a hard reload.

7. Strengthen the automatic repair path
- Review and refine `supabase/functions/backfill-signal-attribution/index.ts` so it catches more recent null rows by:
  - preserving current rule-id and keyword matching logic
  - broadening normalized content matching carefully
  - ensuring both partially-null cases are repaired:
```text
matched_keyword is null
tracking_rule_id is null
either one missing
```
- Keep the logic conservative to avoid false attribution.

8. Add dashboard-safe filtering for keyword comparison
- Update `KeywordComparisonPanel.tsx` so comparisons are driven by properly attributed signals first.
- Do not let generic content matching inflate keyword comparisons when attribution fields are missing.
- This keeps comparison metrics aligned with tracked rules and not accidental text matches.

9. Validate against production data
- Re-check production after implementation to confirm:
  - new inserts appear in Live Mode without delay
  - post-insert attribution updates are reflected immediately
  - unattributed count drops after repair runs
  - top keywords no longer show a dominant “Unattributed” bucket
  - recent alerts distinguish attributed vs pending-attribution rows correctly

Expected outcome
- The app will clearly demonstrate that live mentions are flowing.
- Analytics will update not only on new mentions, but also when attribution is repaired moments later.
- “Unattributed mentions” will become a visible quality metric instead of corrupting keyword dashboards.
- Operators will be able to trust the keyword charts, KPI cards, and recent alerts again.

Technical notes
- Files to update:
  - `src/components/analytics/useAnalyticsData.ts`
  - `src/components/analytics/types.ts`
  - `src/components/analytics/AnalyticsKpiGrid.tsx`
  - `src/components/analytics/AnalyticsStatusStrip.tsx`
  - `src/components/analytics/AnalyticsDetailPanels.tsx`
  - `src/components/analytics/KeywordComparisonPanel.tsx`
  - possibly `supabase/functions/backfill-signal-attribution/index.ts`
- Core fix:
```text
signals INSERT -> show live mention immediately
signals UPDATE -> patch attribution in cache immediately
dashboard KPIs -> split attributed vs unattributed
keyword views -> exclude null attribution from ranked keyword buckets
```
