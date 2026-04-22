
Goal
- Make “Add Keyword” feel immediately usable by fixing the confusing input state, allowing admins to add multiple keywords in one action, and adding keyword-level analytics comparison.

What is happening now
- In `src/components/TrackingRuleManager.tsx`, the form only supports one `rule_text` value at a time.
- The rule text field is a plain textarea, so it can look inactive or secondary even though it is not intentionally disabled.
- The dialog depends on selecting a case first, but there is no strong inline guidance when the case is blank.
- There is no existing keyword comparison feature anywhere in the app (`compare` search returned no implementation).
- Analytics today is case-level in `src/pages/Analytics.tsx`, not keyword-level.

What to build
1. Make the keyword input obviously active
- Update the add dialog in `src/components/TrackingRuleManager.tsx` so the keyword entry control is the primary field:
  - autofocus it when the sheet opens
  - stronger background/border contrast
  - clearer label like “Keywords”
  - helper text explaining separators: comma, Enter, or new line
- Add inline empty/error state near the case selector:
  - “Select a case first”
- Keep the typing field enabled at all times, but disable only the final save action if required fields are missing.

2. Replace single-keyword entry with multi-keyword chip input
- Change the form from a single `rule_text` textarea into a compact multi-entry experience:
  - text input / combobox-style entry field
  - pressing Enter, comma, or pasting a comma/newline list creates chips
  - chips can be removed before saving
- For query mode, keep a separate single text area because search queries are usually one expression, not many chips.
- Internally, convert keyword chips into multiple tracking rule inserts when saving.

3. Support batch save of multiple keywords
- Extend the save logic in `src/components/TrackingRuleManager.tsx` to:
  - normalize every keyword
  - deduplicate within the current batch
  - compare against existing rules for the same case/platform/type
  - insert only new keywords, with a clear summary toast:
    - “5 keywords added”
    - “2 skipped because they already exist”
- Keep the existing duplicate protection semantics aligned with the normalized rule text logic already in place.

4. Simplify the dialog for the common workflow
- Reorganize the sheet to this order:
  - Case
  - Platform
  - Keywords
  - optional “Compare after save” shortcut or hint
  - Advanced options
- Hide rule type in keyword flow when launched from “Add Keyword”.
- Keep advanced options collapsed by default.

5. Add keyword comparison for analytics
- Add a lightweight comparison flow for saved tracking keywords:
  - allow selecting 2–5 keywords from the current case
  - show comparison in Analytics, driven from existing `signals` and `reputation_snapshots` data where possible
- Recommended UI:
  - a comparison selector card near the top of `src/pages/Analytics.tsx`
  - compare metrics per selected keyword:
    - mention volume
    - sentiment breakdown
    - most recent mention time
    - top sources/platforms
- Use `signals.keywords` and signal content matching as the first data source so this can ship without a schema change.

6. Add comparison entry points
- In `src/components/TrackingRuleManager.tsx`, add row-level selection controls or a “Compare” action for keyword rules.
- Deep-link from Tracking Manager to Analytics with selected keywords in the URL, for example:
```text
/analytics?compare=keyword-a,keyword-b
```
- Keep comparison scoped to the active case to avoid mixing unrelated data.

Implementation details
- `src/components/TrackingRuleManager.tsx`
  - replace single keyword textarea flow with chip-based batch entry for keyword mode
  - preserve single-field query mode
  - add clearer validation and disabled-save logic
  - update insert mutation to support multiple inserts in one action
- `src/pages/Analytics.tsx`
  - read selected comparison keywords from URL/search params or local component state
  - derive per-keyword metrics from case-filtered signals
  - render compact comparison cards/charts
- `src/pages/TrackingManager.tsx`
  - keep the hero CTA, but optionally add a small hint under it:
    - “Paste multiple keywords separated by commas or new lines”
- Optional shared UI
  - create a reusable chip input component if needed, likely under `src/components/ui/`

Database / backend impact
- No schema change is required for the initial fix.
- Existing `tracking_rules` can remain one row per keyword/query.
- Existing RLS is already admin-protected for tracking rules, which matches this workflow.
- If later needed, comparison presets could be persisted, but that should be a second phase.

Expected outcome
- The keyword field no longer feels disabled or confusing.
- Admin can paste or type multiple names in one go, such as:
  - Mohamad Darwish
  - El-Rufai
  - IHS Nigeria
  - Dapo Otunla
  - Mrs Oyinkansola Badejo Okusanya
- Saving becomes faster and cleaner because duplicates are skipped automatically.
- Users can compare tracked keywords in analytics instead of only viewing case-level aggregates.
