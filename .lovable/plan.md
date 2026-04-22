
Goal
- Make the Tracking Manager feel cleaner and more user friendly by reducing repeated keyword CTAs and turning the add-rule dialog into a shorter, more focused form.

What is causing the problem now
- The same creation action appears multiple times on the same page:
  - page hero in `src/pages/TrackingManager.tsx`
  - top action card inside `src/components/TrackingRuleManager.tsx`
  - action row above the table inside `src/components/TrackingRuleManager.tsx`
- The add-rule sheet is visually long because it stacks too many fields at once:
  - case
  - platform
  - rule text
  - rule type
  - priority
  - label
  - notes
  - status
- The current sheet width and vertical spacing make the form feel heavier than it needs to.

What to change
1. Reduce the page to one primary add CTA area
- Keep the large hero CTA at the top of `src/pages/TrackingManager.tsx`.
- Remove the extra “Add Keyword / Add Search Query” card from `TrackingRuleManager`.
- Replace the table-level dual buttons with a lighter secondary action pattern:
  - either one small “Add rule” button in the section header
  - or no repeated button at all if the hero remains visible above the fold
- Result: only one dominant add area on the page, not three.

2. Simplify the hierarchy of the page
- Keep this order:
  - hero CTA
  - compact summary stats
  - filters/table
- If rules exist, the table section should feel operational, not promotional.
- Convert repeated instructional copy into one short line only, so admins do not keep rereading the same message.

3. Make the add dialog compact
- Update the sheet in `src/components/TrackingRuleManager.tsx` to feel shorter and denser:
  - reduce width to a more compact panel
  - reduce top/bottom spacing
  - shorten helper copy
- Put the most important fields first and visible without much scrolling:
  - case
  - platform
  - rule text
- Keep advanced fields below in a collapsed or secondary section:
  - rule type
  - priority
  - label
  - notes
  - active/paused status

4. Collapse advanced options by default
- Add an “Advanced options” toggle/accordion inside the sheet.
- Default state:
  - hidden for new rules
  - visible only when editing an existing rule, or when user expands it
- This keeps the common workflow fast while preserving full control.

5. Tighten individual form controls
- Reduce `rule_text` textarea height for keyword mode so it behaves more like a short input area.
- Keep a larger textarea only when rule type is query.
- Place `rule type` and `platform` efficiently so the form does not stretch vertically more than necessary.
- Make priority a smaller inline field rather than a full-emphasis block.

6. Improve action labels
- Keep the primary action label very simple:
  - “Add Keyword”
- Use one secondary option only where needed:
  - “Search Query”
- Avoid repeating long labels like “Add Search Query” in every section of the page.

Implementation details
- `src/pages/TrackingManager.tsx`
  - keep one strong hero CTA
  - remove redundant promotional framing elsewhere
- `src/components/TrackingRuleManager.tsx`
  - remove the duplicate CTA card when the page hero already exists
  - reduce repeated action buttons in the table section
  - compact the sheet layout
  - add an “Advanced options” disclosure area
  - make textarea height responsive to rule type
- Optional supporting cleanup:
  - keep top-bar/global shortcuts elsewhere in the app, but do not duplicate them inside the manager page body

Recommended UX
```text
Tracking Manager
  -> Hero: Add Keyword / Search Query
  -> Small stats
  -> Filters + rules table
  -> Add dialog:
       Case
       Platform
       Rule text
       [Advanced options]
       Save
```

Expected outcome
- The page will no longer feel repetitive or cluttered.
- Admin sees one clear place to start adding keywords.
- The dialog becomes faster to scan, faster to complete, and requires less scrolling.
- The workflow feels simpler without removing any important functionality.
