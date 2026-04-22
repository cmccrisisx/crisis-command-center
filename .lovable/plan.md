
Recommendation: organize the tracking manager as a single admin control center with a case filter, not separate per-case tabs.

Why this is the best fit
- You already have multiple case studies now: Kaduna, NPRW 2026, APC, ADC, PDP, and LP. That list will likely grow.
- Admins need to compare coverage across cases quickly and spot gaps, duplicates, or stale queries.
- A single searchable table is faster to maintain than opening each case one by one.
- It fits the existing app structure well because Settings is already admin-only, while case context already exists globally in the dashboard.

Recommended structure
1. Admin page/section
- Add a new admin-only section under Settings called “Keyword & Queries Manager”.
- Keep it separate from the current personal “Keyword Tracking” card, since that card is just user preferences and should not control ingestion.

2. Top controls
- Case filter dropdown: All cases / Kaduna / NPRW 2026 / APC / ADC / PDP / LP
- Search box: find any keyword/query quickly
- Type filter: Keywords, Queries, or both
- Status filter: Active / Paused
- “Add rule” button

3. Main table
Use one searchable table with rows like:
```text
Case           Type      Rule text                                      Status   Priority   Last updated
Kaduna         Query     Kaduna State protest OR attack OR bandit...    Active   1          Apr 22
NPRW 2026      Query     "Nigeria Public Relations Week" 2026...        Active   2          Apr 22
APC            Keyword   Tinubu                                         Active   3          Apr 22
```

Recommended columns
- Case
- Rule type: keyword or query
- Rule text
- Optional label/category
- Active/paused toggle
- Priority/order
- Last updated
- Actions: edit, duplicate, delete

4. Editing experience
- Use a side drawer or modal for create/edit.
- Fields should include:
  - Case
  - Rule type
  - Rule text
  - Optional notes
  - Active toggle
  - Priority
- For full search queries, include helper text like “Use OR, quotes, hashtags, names, events”.

5. Nice-to-have admin features
- Duplicate rule to another case
- Bulk pause/delete
- “Test query” action later
- Show total active rules per case
- Warn on duplicates before save

Backend shape to support this
Create a dedicated table for tracking rules rather than storing them in profile preferences.
Recommended model:
- One table for rules mapped to a crisis/case
- Each row belongs to one case
- Each row has a type: keyword or query
- Each row can be active/inactive
- Each row has priority/order and timestamps

This is better than per-case tabs because
- Tabs are fine for 2–3 cases, but become slower and more fragmented as cases grow.
- They hide cross-case duplicates.
- They make bulk operations harder.
- They make it harder to answer “which cases have no active queries?” or “which political party has the most tracking rules?”

Implementation direction
- Add a new admin-only manager inside Settings.
- Create a backend table for case-linked tracking rules with proper access control.
- Migrate the hardcoded rules from the ingestion function into that table.
- Update ingestion so it reads active rules from the database instead of hardcoded arrays.
- Leave the existing personal keyword preferences as separate user settings, unless you want them removed entirely.

Recommended final UX
- Default view: single admin table filtered to “All cases”
- Quick filter chips for each case
- Add/edit in a drawer
- Case-specific counts at the top
- Later, optional “Test query” and “last matched signal” indicators

If you want this built next, the best version is:
- single admin table
- grouped by case with filters
- supports both keywords and full search queries
- admin-only access
- wired directly into the ingestion pipeline
