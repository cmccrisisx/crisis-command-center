
Goal
- Redesign the Tracking Manager add-rule sheet so it feels enterprise-grade, interactive, and easier to complete by separating primary brand keywords from optional competitor tracking.

What to build
1. Restructure the sheet into two clear sections
- In `src/components/TrackingRuleManager.tsx`, replace the current single keyword-entry block with a guided two-part layout:
  - Brand keywords (primary, required for keyword flow)
  - Competitor keywords (optional)
- Keep case and platform at the top so the scope is obvious before users start typing.
- Preserve query mode as a separate simpler path.

2. Make brand keywords the primary interactive workspace
- Turn the brand keyword area into the main active input region with:
  - stronger focus styling
  - larger click target
  - helper text for comma / Enter / newline paste
  - chip-based entry for multiple terms
- Add lightweight interaction helpers:
  - live count of keywords added
  - paste-to-import behavior
  - remove/edit chips before saving
  - empty-state guidance such as “Add brand, product, executive, or campaign names”

3. Add a separate competitor section that is clearly optional
- Introduce a second chip-input block labeled something like:
  - “Competitor keywords (optional)”
- Style it as secondary but still fully interactive, not disabled.
- Support the same multi-entry behavior as brand keywords:
  - comma / Enter / newline parsing
  - dedupe within the section
  - removable chips
- Include helper copy explaining use cases, for example monitoring rival brands or comparison entities.

4. Improve the information architecture of the dialog
- Recommended order:
```text
Case
Platform
Brand keywords
Competitor keywords (optional)
Comparison guidance
Advanced options
Save
```
- Replace any passive-looking informational boxes with cleaner enterprise UI patterns:
  - section headers
  - concise helper copy
  - badges/counters
  - clear required vs optional distinction
- Keep advanced options collapsed by default.

5. Make the workflow feel smarter and more guided
- Add inline validations instead of confusing disabled-feeling inputs:
  - case required
  - at least one brand keyword required for save
- Keep typing enabled at all times; only disable the final save button when required fields are missing.
- Add contextual hints such as:
  - “3 brand keywords ready”
  - “2 competitor keywords added”
- If useful, add quick suggestion rows for common keyword types:
  - Brand
  - Product
  - Executive
  - Competitor
  - Campaign

6. Keep save behavior simple and compatible with the existing data model
- Continue saving one tracking rule per keyword in `tracking_rules`.
- Batch insert brand and competitor keywords in one submit flow.
- Use labels/notes or a lightweight metadata convention in the saved payload to distinguish:
  - brand keyword
  - competitor keyword
- Keep duplicate detection aligned with the current normalized keyword logic.

7. Improve comparison readiness inside the same flow
- Update the comparison guidance so it matches the new structure:
  - save keywords first
  - select 2–5 saved rows in the table
  - compare in Analytics
- Optionally bias the saved toast and follow-up hint toward competitor use cases, e.g. brand vs competitor comparison.

Files to update
- `src/components/TrackingRuleManager.tsx`
  - primary redesign of the sheet
  - dual keyword sections
  - updated validation, save, and helper states
- `src/components/ui/`
  - optionally add a reusable chip-input / keyword-section component if the logic should be shared or simplified
- `src/pages/TrackingManager.tsx`
  - optionally refresh hero/helper copy so the page matches the new brand vs competitor workflow

Technical details
- No backend schema change is required for the initial version.
- Existing `tracking_rules` rows can still represent each keyword individually.
- The implementation should reuse the current normalization, deduplication, and batch-save patterns.
- Query mode should remain available, but the keyword flow should become the polished, default enterprise experience.

Expected outcome
- The sheet becomes clearer, faster to scan, and more professional.
- Users immediately understand the difference between their core tracked brand terms and optional competitor terms.
- Multi-keyword entry feels interactive instead of form-heavy.
- The comparison workflow becomes more natural for enterprise monitoring:
```text
Select case
  -> Add brand keywords
  -> Optionally add competitor keywords
  -> Save
  -> Select 2–5 saved rows
  -> Compare in Analytics
```
