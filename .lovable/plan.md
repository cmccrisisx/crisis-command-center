
Goal
- Make “Add keywords” the most obvious action on the Tracking Manager page so admins can start adding rules immediately without scrolling or searching.

What to change
1. Promote the add action to the page hero
- Update `src/pages/TrackingManager.tsx` so the first visible block is a strong admin CTA:
  - headline
  - short instruction (“Add names, brands, and search queries here”)
  - large primary button: “Add Keyword”
  - secondary button: “Add Search Query”
- Keep “System Settings” as a secondary link, not the dominant action.

2. Let the page open directly into add mode when appropriate
- Extend `src/components/TrackingRuleManager.tsx` to support an initial open state and preferred default rule type.
- From `TrackingManager.tsx`, pass props so:
  - “Add Keyword” opens the form immediately with `rule_type = "keyword"`
  - “Add Search Query” opens the form immediately with `rule_type = "query"`
- If there are zero existing rules, auto-open the add drawer on first load for admins.

3. Move the create CTA above stats and filters
- In `TrackingRuleManager.tsx`, reorder the layout so creation comes before analytics pills, chips, filters, and the table.
- Keep a persistent top action row with:
  - primary “Add Keyword”
  - secondary “Add Query”
  - optional small hint text under the buttons
- Stats can remain, but lower on the page.

4. Add a true empty-state first-use experience
- When there are no rules, replace the table area with a large empty state:
  - “No tracking rules yet”
  - explanation of what to add
  - large centered “Add your first keyword” button
- Keep filters hidden or minimized until at least one rule exists.

5. Make the add flow simpler inside the drawer
- Adjust the sheet title and copy based on entry point:
  - “Add Keyword”
  - “Add Search Query”
- Focus the most important fields first:
  - case
  - platform
  - rule text
- Keep advanced fields like priority, notes, and paused/active lower in the form.

6. Improve visibility across the app
- Strengthen the shortcut CTA labels already shown in other places:
  - `src/components/TopBar.tsx`: rename to “Add Keyword”
  - `src/pages/Index.tsx`: add/keep an admin shortcut card with “Add Tracking Rule”
  - `src/pages/Signals.tsx`: make the admin shortcut more action-oriented, e.g. “Add Keyword”
- These shortcuts should deep-link into the page in add mode.

Implementation details
- `src/pages/TrackingManager.tsx`
  - add a hero CTA section at the very top
  - wire buttons to open the manager drawer immediately
- `src/components/TrackingRuleManager.tsx`
  - add optional props such as:
    - `initialOpen?: boolean`
    - `initialRuleType?: "keyword" | "query"`
    - `showHeroActions?: boolean`
  - support auto-open when no rules exist
  - reorder UI so add actions appear before stats/filters/table
  - add a dedicated empty state
- `src/components/TopBar.tsx`
  - make the quick action more explicit and creation-focused
- `src/pages/Index.tsx`
  - keep/add a clear admin shortcut with direct add intent
- `src/pages/Signals.tsx`
  - update shortcut wording to direct creation rather than general management

Recommended UX
```text
Tracking Manager
  -> Hero: “Add tracked keywords and queries”
  -> [Add Keyword] [Add Search Query]
  -> Drawer opens immediately
  -> Then: stats / filters / rules table
```

Expected outcome
- Admin sees the add action immediately on page load.
- First-time setup becomes obvious because the form can open automatically.
- Keyword entry feels like the primary workflow, while filters and table management become secondary.
- The page becomes much more user-friendly for urgent monitoring updates.
