
Goal
- Make the admin keyword entry point obvious and one-click accessible, instead of hiding it inside the long Settings page.

What is happening now
- Admin tracking keywords are currently added in Settings under the admin-only “Keyword & Queries Manager”.
- That section exists, but it is easy to miss because:
  - it is nested inside a multi-section Settings page
  - the sidebar only labels the route as “Settings”
  - there is no dedicated shortcut from the dashboard, signals page, or top bar
  - there is also a separate personal “Keyword Tracking” card lower on the page, which can create confusion

Recommended organization
1. Promote it to a first-class admin destination
- Add a dedicated admin-only navigation item called “Tracking Manager” or “Keywords & Queries”.
- Keep the route either:
  - as a new standalone page, or
  - as `/settings?tab=tracking`
- Best UX: create a dedicated page so admins do not need to scan the rest of Settings.

2. Keep Settings for secondary controls only
- Leave personal workspace keyword preferences in Settings.
- Move the ingestion-driving admin manager out of the main Settings flow.
- Add a short note in Settings:
  - “Monitoring keywords are managed in Tracking Manager.”

3. Add fast entry points
- Add a top-right action button for admins:
  - “Manage Tracking”
- Add a shortcut card on the dashboard and Signals page:
  - “Open Tracking Manager”
- Keep sidebar access as the primary route and quick actions as secondary entry points.

4. Make the page simple on first load
- Top section:
  - search
  - case filter
  - platform filter
  - status filter
  - prominent “Add Rule” button
- First thing visible:
  - active rule counts by case
  - recent updates
- Main content:
  - single table grouped/filterable by case

Recommended UX flow
```text
Sidebar
  -> Tracking Manager
       -> Search / Filter / Add Rule
       -> Table of all active rules
       -> Drawer: Create/Edit rule
```

Implementation plan
1. Create a dedicated admin page
- Add a new page such as `src/pages/TrackingManager.tsx`.
- Move or reuse the existing `TrackingRuleManager` UI from `src/pages/Settings.tsx`.
- Keep all current validation, duplicate checks, and platform selection.

2. Add route wiring
- Add a protected route in `src/App.tsx` for the new admin page.
- Restrict access in the page itself using the existing auth role check so only admins can use it.

3. Update sidebar navigation
- Edit `src/components/AppSidebar.tsx`.
- Add a new admin-only nav item:
  - title: “Tracking Manager”
  - icon: target/search/filter style icon
  - route: `/tracking-manager`
- Keep “Settings” for system/admin settings, but no longer make it the only place admins can manage tracking.

4. Add admin quick actions
- In `src/components/TopBar.tsx`, add an admin-only button linking to the tracking manager.
- In `src/pages/Index.tsx`, add a small admin card/button near monitoring controls.
- Optionally add the same shortcut on `src/pages/Signals.tsx`.

5. Reduce confusion inside Settings
- In `src/pages/Settings.tsx`:
  - replace the large embedded manager with either:
    - a compact summary card and “Open Tracking Manager” button, or
    - a lightweight preview of counts only
  - keep the personal “Keyword Tracking” section, but rename it more clearly:
    - “Personal Workspace Keywords”
  - add helper text that these do not drive monitoring ingestion

6. Improve discoverability on mobile and desktop
- Desktop:
  - sidebar item visible for admins
  - top bar shortcut visible on larger screens
- Mobile:
  - dedicated route still accessible from menu/sidebar
  - primary CTA at top of page: “Add Rule”
- Ensure the add/edit action stays above the fold.

7. Preserve the current backend model
- Continue using `tracking_rules` as the source of truth.
- No schema change is required for this access improvement unless you also want:
  - pinned/favorite cases
  - last edited by
  - rule usage stats

Recommended labels
- Sidebar: “Tracking Manager”
- Page title: “Keyword & Queries Manager”
- Add button: “Add Tracking Rule”
- Settings summary note: “Monitoring rules have moved to Tracking Manager.”

Files to update
- `src/App.tsx`
- `src/components/AppSidebar.tsx`
- `src/components/TopBar.tsx`
- `src/pages/Settings.tsx`
- `src/pages/Index.tsx`
- optionally `src/pages/Signals.tsx`
- new page: `src/pages/TrackingManager.tsx`

Expected outcome
- Admin can find keyword management immediately from the main navigation.
- Adding tracked names becomes a one-click action.
- There is less confusion between personal keywords and monitoring keywords.
- The system feels simpler because the tracking tool is treated as a core workflow, not a buried settings subsection.
