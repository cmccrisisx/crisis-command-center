
Goal
- Make keyword management clear and move monitoring/analysis to case-specific, near-real-time data so the AI stops pulling stale or unrelated context.

What exists right now
- Keywords/queries are added in Settings under the admin-only “Keyword & Queries Manager”.
- Personal keywords also exist lower in Settings, but those are only workspace preferences and do not drive ingestion.
- The current ingestion function still uses hardcoded `BRAND_QUERIES` and `BRAND_CRISIS_MAP` inside `supabase/functions/ingest-signals/index.ts`.
- The dashboard AI panel is not scoped correctly:
  - it loads the latest crisis overall, not the active case
  - it loads all signals overall, not the active case
- The AI prompts in `supabase/functions/crisis-ai/index.ts` are partly hardcoded to Kaduna State Government, which can bias outputs like reputation/emotional analysis.

Why you are seeing stale / wrong analysis
- New rules added in the Keyword & Queries Manager are not yet powering ingestion because `ingest-signals` still reads hardcoded queries.
- Emotional/reputation analysis is being run on broad or mixed signal sets instead of the selected case.
- Reputation snapshots are historical aggregates, so if the active case scoping is wrong, the charts and summaries can reflect older unrelated entities like Airtel Nigeria.

Recommended implementation
1. Wire the manager to real ingestion
- Refactor `ingest-signals` to fetch active rules from `tracking_rules` instead of `BRAND_QUERIES`.
- Join each rule to its mapped crisis/case.
- Respect platform selection (`all`, `twitter`, `news`, `blog`, `linkedin`) when building searches.
- Keep server-side duplicate protection already added.

2. Add your new tracked names as tracking rules
- Insert admin rules mapped to the correct IHS Nigeria crisis/case:
  - Mohamad Darwish (CEO IHS Nigeria)
  - El-Rufai
  - IHS Nigeria
  - Dapo Otunla
  - Mrs Oyinkansola Badejo-Okusanya
- Store them as keywords or query rules depending on how broad you want matching.
- If the IHS Nigeria case does not yet exist, create/select that crisis first so the rules map to the right case.

3. Fix AI analysis scoping
- Update `src/components/CrisisAIPanel.tsx` to use `useActiveCase()`.
- Query only the selected case’s crisis record and signals.
- Pass active case metadata into the AI call so emotional and reputation analysis are case-specific.
- Update empty/loading states so the panel clearly says when no case is selected or no recent signals exist.

4. Remove brand-biased prompts
- Update `supabase/functions/crisis-ai/index.ts` so prompts are generic and driven by `crisisContext`.
- Remove the hardcoded “Kaduna State Government” framing from narrative generation and any other case-specific prompt text.
- Ensure reputation analysis speaks about the current organization/case only.

5. Improve “real-time” behavior
- Keep the existing live subscriptions for new `signals`.
- Make analysis prefer a recent window for fast-changing views:
  - emotional analysis: recent signals first (for example last 24–72 hours, case-scoped)
  - reputation analysis: latest case-scoped snapshots and/or rolling recent signals
- After each ingestion run, continue updating:
  - `signals`
  - `reputation_snapshots`
  - `narratives`
  - crisis signal counts
- Ensure those updates are filtered per crisis so dashboards refresh with the active case only.

6. Make ingestion cadence more reliable
- Review how ingestion is being triggered now.
- If it is only manual from the Signals page, add or verify a scheduled backend job to run automatically on a short interval.
- Expose the latest run time / last successful ingest in the admin area or cron panel so you can confirm freshness.

7. Improve freshness signals in the UI
- Show “last updated” / “latest signal time” in the AI panel and analytics views.
- Warn when analysis is based on stale data or too few recent signals.
- Optionally add a “Use recent signals only” mode for emotional and reputation tabs.

Where you will add keywords after this
- Settings → Keyword & Queries Manager (admin-only), not the personal keyword card.
- That manager will be the source of truth for tracked names and case mapping.

Technical details
- Frontend files to update:
  - `src/components/CrisisAIPanel.tsx`
  - optionally `src/pages/Signals.tsx` / dashboard labels for freshness indicators
- Backend files to update:
  - `supabase/functions/ingest-signals/index.ts`
  - `supabase/functions/crisis-ai/index.ts`
- Database/data work:
  - use existing `tracking_rules` table as source of truth
  - add the five IHS-related names as rules mapped to the appropriate crisis
  - no new roles model needed; current admin-only rule management already fits

Expected outcome
- Admin adds tracked names in one place.
- Ingestion actually uses those rules.
- Emotional and reputation analysis follow the active case only.
- Dashboards stop surfacing outdated October 2023 / Airtel Nigeria context unless that is truly the selected case’s current data.
- Monitoring becomes much closer to real time, with clear freshness indicators and scheduled ingestion support.
