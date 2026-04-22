
Goal
- Fix the misleading “Compare after save” block in the Add Keyword sheet so it no longer looks disabled and clearly explains how keyword comparison actually works.

What is causing the confusion
- In `src/components/TrackingRuleManager.tsx`, the current “Compare after save” area is a plain informational box with muted styling (`bg-surface-elevated`, muted text), so it visually resembles a disabled control.
- It is not interactive inside the sheet, but its label reads like an action.
- The real comparison action already lives in the rules table header as `Compare selected`, which creates a mismatch between what the sheet implies and what the page actually supports.

What to change
1. Replace the disabled-looking box with a clearer helper panel
- Update the block around lines ~902–905 in `src/components/TrackingRuleManager.tsx`.
- Change the title from action-like wording (“Compare after save”) to explanatory wording such as:
  - “How comparison works”
  - or “Compare keywords in Analytics”
- Use normal helper-card styling rather than disabled-looking styling:
  - stronger contrast
  - optional icon
  - normal foreground text
  - no appearance of a form field/button

2. Make the message reflect the real workflow
- Rewrite the copy so it describes the actual steps:
  - save keywords first
  - select 2–5 saved keywords in the table
  - click `Compare selected`
  - open Analytics side-by-side comparison
- Example structure:
```text
Compare keywords in Analytics
1. Save your keywords.
2. Select 2–5 keyword rows in the table.
3. Click Compare selected.
```

3. Add an optional inline shortcut after save
- Improve the save success flow in `src/components/TrackingRuleManager.tsx`:
  - if multiple keywords were just added, show a toast or lightweight hint telling the user to select them in the table and use `Compare selected`
- This keeps the dialog simple while still guiding the next step.

4. Make the table comparison action easier to notice
- Slightly strengthen the existing `Compare selected` button in the table header:
  - clearer helper copy nearby when 0 or 1 keywords are selected
  - dynamic state such as:
    - “Select 2–5 keywords to compare”
    - “Ready to compare 2 keywords”
- Keep selection scoped to one case, as already implemented.

Files to update
- `src/components/TrackingRuleManager.tsx`
  - replace the misleading helper block
  - improve messaging/state around comparison workflow
  - optionally enhance the success toast/hint after save

No backend changes
- No database or backend changes are needed.
- This is a UI/UX clarification only.

Expected outcome
- The sheet no longer contains a box that looks disabled.
- Users understand that comparison happens after saving, from the table, not inside the dialog.
- The comparison workflow feels intentional and easier to follow:
```text
Add keywords
  -> Save
  -> Select 2–5 saved keyword rows
  -> Click Compare selected
  -> View side-by-side analytics
```
