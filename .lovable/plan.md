
Goal
- Verify whether the new IHS Nigeria keywords are already producing live alerts, and define the work needed to guarantee near-zero-delay alerting if the current pipeline is not fast enough.

What I verified
- The IHS Nigeria case exists with ID `5a16248d-ebaf-4547-94f6-1197c5836ace`.
- The requested keywords are active in `tracking_rules` for that case, including:
  - Mohamad Darwish
  - El-Rufai
  - IHS Nigeria
  - Dapo Otunla
  - Mrs Oyinkansola Badejo-Okusanya / Mrs oyinkansola badejo okusanya
  - Mohamad Darwish (CEO IHS Nigeria)
- The ingestion function logs show those terms being searched:
  - `Searching: IHS Nigeria :: "Mohamad Darwish"`
  - `Searching: IHS Nigeria :: "El-Rufai"`
  - `Searching: IHS Nigeria :: "IHS Nigeria"`
  - `Searching: IHS Nigeria :: "Dapo Otunla"`
  - `Searching: IHS Nigeria :: "Mrs Oyinkansola Badejo-Okusanya"`
- Recent `signals` rows were inserted for the IHS Nigeria case for those terms.
- Recent `notifications` rows were also created immediately after those signals, which means the in-app alert path is working.

Important conclusion
- Live alerts are working.
- Near-zero delay is not guaranteed by the current architecture.
- Right now alerts appear only after the ingestion job discovers new results, inserts them into `signals`, and the subscribed client receives the realtime insert.
- So the true delay depends on:
  1. how often `ingest-signals` runs,
  2. Firecrawl/API response time,
  3. deduping and DB insert completion,
  4. whether the user is actively logged in with `NotificationListener` mounted.

Why near-zero delay is not guaranteed today
- `NotificationListener` only reacts to database inserts on `signals`; it does not independently poll or stream external sources.
- `ingest-signals` processes rules in batches of 3 and waits on external search results before inserts happen.
- I found UI support for manual “Run now” from Settings, but I did not find code in the repo that clearly shows the actual cron schedule being created for `ingest-signals`.
- That means current “live” behavior is effectively “near-real-time after the next ingestion run,” not true instant streaming.

Implementation plan
1. Surface and verify the actual ingestion cadence
- Inspect the backend job configuration and confirm how often `ingest-signals` is scheduled.
- If it is slower than expected, tighten the schedule to an enterprise-friendly interval.
- Expose the current schedule and last successful run more prominently in the admin freshness monitor so operators can validate alert latency quickly.

2. Add explicit keyword-to-signal traceability
- Extend ingestion so each inserted signal stores the matched tracking rule ID and/or matched keyword text.
- This makes it possible to verify that each alert came from one of the requested IHS Nigeria keywords instead of just inferring from content.
- Use that traceability in the UI and future diagnostics.

3. Add case-scoped live alert verification in the product
- Add an IHS Nigeria-specific “recent matches” or “live alert stream” panel showing:
  - matched keyword
  - source
  - detected time
  - alert time
  - computed latency
- This makes “are these terms alerting fast enough?” visible without needing backend inspection.

4. Reduce alert latency in the ingestion pipeline
- Optimize the search/insertion loop so newly discovered signals are inserted sooner instead of only after larger batches finish.
- If needed, insert per-task/per-result earlier, then do enrichment in smaller chunks so alerts can fire faster.
- Keep dedupe behavior intact to avoid duplicate toast storms.

5. Strengthen realtime UX for operators
- Add a visible “live monitoring active” state on Signals / Tracking Manager for the selected case.
- Show a freshness SLA indicator such as:
  - healthy: seen within X min
  - delayed: no new ingestion for Y min
- If the job stalls, show an actionable warning instead of silently appearing idle.

6. Validate end-to-end latency after implementation
- Trigger ingestion for the IHS Nigeria case only.
- Confirm that:
  - matching `signals` rows are inserted,
  - notifications are created,
  - toast alerts appear in-session,
  - measured latency stays within the target threshold.

Expected outcome
- The IHS Nigeria keywords remain active and continue producing alerts.
- Operators can clearly see which keyword triggered each alert.
- Alerting becomes measurably faster and easier to trust.
- “Live” changes from best-effort near-real-time to a monitored, enterprise-grade workflow with visible latency and freshness indicators.

Technical notes
- Existing realtime alert path:
```text
tracking_rules
  -> ingest-signals edge function
  -> insert into signals
  -> NotificationListener subscribes to signals INSERT
  -> toast + notifications row
```
- Existing evidence already confirms the path is working for the new IHS Nigeria terms.
- The likely missing piece for “near-zero delay” is cadence + ingestion pipeline speed, not the realtime subscription itself.
