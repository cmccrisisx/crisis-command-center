

## Audit: Non-Functional CTAs & Incomplete Features

After reviewing every page, here are all the buttons/CTAs that are either non-functional or have visibility issues, grouped by page:

### Issues Found

**Reports Page**
- **"New Report" button** — no `onClick` handler, does nothing
- Fix: Add a dialog/modal to create a new report (title, type, sections selection), save to local state

**Signals Page**
- **Search input** — renders but has no filtering logic
- **"Filters" button** — no `onClick` handler, does nothing
- Fix: Wire search input to filter signals by content/author. Add a popover with source/sentiment filters.

**Settings Page**
- **"Add" keyword button** — no handler, does nothing
- **Keyword "×" badges** — no remove handler
- **Alert threshold inputs** — no save/persist
- **Notification switches** — no persist
- Fix: Add local state for keywords (add/remove). Add a "Save" button with toast confirmation for settings. Persist to localStorage or database.

**TopBar**
- **Bell notification icon** — no dropdown/popover
- Fix: Add a popover showing recent alerts from mock data

**Button Text Visibility**
- Several buttons use very small font sizes (`text-[10px]`, `text-[9px]`) with icons that could crowd out text on smaller viewports
- Fix: Audit and ensure minimum `text-xs` on actionable buttons, add `whitespace-nowrap` where needed

### Implementation Plan

1. **Reports — New Report dialog**: Create a Dialog with form fields (title, type selector, section checkboxes). On submit, add to local reports array and show toast.

2. **Signals — Search & Filters**: Wire search `Input` to a state variable, filter the `signals` query results by `content`/`author` match. Add a Popover on "Filters" button with checkboxes for source types and sentiment range.

3. **Settings — Full interactivity**: 
   - Keywords: `useState` array, add input handler, remove on badge click
   - Threshold inputs: controlled state + "Save Changes" button at bottom
   - Notification switches: controlled state + save
   - Persist to `localStorage` with a toast on save

4. **TopBar — Notification popover**: Wrap Bell button in a Popover showing the latest 5 mock alerts with timestamps and risk levels.

5. **Button text visibility pass**: Ensure all CTA buttons have at minimum `text-xs` (not `text-[10px]`), add `whitespace-nowrap`, and verify icon + text don't overflow on the 1064px viewport.

### Files to Modify
- `src/pages/Reports.tsx` — New Report dialog
- `src/pages/Signals.tsx` — search filtering + filter popover
- `src/pages/Settings.tsx` — full interactivity for all controls
- `src/components/TopBar.tsx` — notification popover
- Minor text size adjustments across all pages where buttons use `text-[10px]` or smaller

