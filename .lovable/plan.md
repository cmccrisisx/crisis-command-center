
Goal
- Create a polished web-based user journey and user guide inside the app for both standard users and admins/operators, with structured steps, screenshots, and clear explanations from setup through live monitoring and reporting.

What to build
1. New dedicated guide experience
- Add a new route such as `/user-guide` or `/journey-guide`.
- Build it as a long-form, responsive guide page inside the existing app design system.
- Support two audience paths:
  - New platform users
  - Admins/operators
- Include a simple audience toggle or segmented tabs so users can switch between “Core User Journey” and “Admin/Advanced Journey”.

2. Guide structure
- Organize the page into clear sections with a sticky in-page table of contents.
- Recommended sequence:
```text
1. Welcome / what the platform does
2. Sign in and access
3. Dashboard / Command Center overview
4. Case selection and switching
5. Setup: tracking rules and monitoring windows
6. Signals: live mentions and filtering
7. War Room: escalation and collaboration
8. Analytics: live mode, KPIs, attribution, trends
9. Reports: creating and exporting outputs
10. QA Checklist: validating freshness and crawl quality
11. Settings and roles
12. Recommended daily workflow / best practices
```

3. Screenshot-backed step cards
- Each major step should include:
  - step title
  - purpose
  - what users should do
  - what they should expect to see
  - screenshot with caption and callouts
- Use screenshots from the actual product states rather than generic placeholders.
- Include annotation treatment such as numbered callouts or labeled hotspots for key controls.

4. Audience-aware content
- New user sections should explain:
  - how to sign in
  - what the dashboard shows
  - where to check live mentions
  - how to move from Signals to War Room to Analytics to Reports
- Admin/operator sections should explain:
  - case setup and tracking rules
  - monitoring windows
  - QA checklist
  - role-based navigation and operational checks
- Reuse the same screenshots where possible, but tailor captions and step text per audience.

5. “Step-by-step journey” summary blocks
- Add short journey summaries at the top:
```text
New User Journey:
Sign in -> review dashboard -> watch signals -> escalate to war room -> review analytics -> export report

Admin Journey:
select case -> configure tracking -> verify monitoring window -> check signals freshness -> inspect analytics attribution -> validate QA checklist
```
- End the guide with a “daily operating rhythm” section that explains how teams use the platform during active monitoring.

Implementation approach

1. Add a reusable guide page layout
- Create a new page component, likely under `src/pages/`.
- Use the existing app shell styling conventions:
  - dark-mode-first
  - monospace labels for system captions
  - card-based sections
- Add a sticky sidebar or top jump menu for navigation between sections.

2. Add screenshot content support
- Store guide screenshots in a dedicated project asset location such as `src/assets/guide/`.
- Create a small reusable component for guide sections:
  - `GuideSection`
  - `GuideStepCard`
  - `GuideScreenshot`
  - `GuideAudienceToggle`
- Support caption text and optional numbered callouts overlay.

3. Capture product screenshots from real app states
- Prepare screenshots for:
  - Sign in page
  - Dashboard
  - Tracking Manager
  - Signals
  - War Room
  - Analytics
  - Reports
  - Admin QA Checklist
  - Settings
- Use current UI states that best represent the intended journey.
- Prefer screenshots that already align with the platform’s current real-time monitoring and analytics improvements.

4. Fit the guide to the existing routing/navigation model
- Add the route to `src/App.tsx`.
- Decide whether the guide should be:
  - public-facing from landing/about, or
  - authenticated inside the app shell, or
  - both
- Most consistent approach:
  - public intro/overview available from public nav
  - full operational guide inside authenticated layout
- If keeping it simple, start with one authenticated guide page linked from dashboard/top bar/settings.

5. Reuse current product concepts already visible in code
- Ground the guide in actual UI concepts already implemented:
  - `PublicNav` and `Auth`
  - Dashboard / Command Center
  - `CaseSwitcher`
  - Tracking Manager
  - Signals monitoring window and refresh flow
  - Analytics filters and live mode
  - War Room approval flow
  - Reports export
  - Admin QA Checklist
  - Settings / roles
- This keeps the guide accurate and reduces maintenance drift.

6. Make the guide maintainable
- Keep guide content data-driven where possible:
  - array of sections/steps
  - screenshot path + caption + audience tags
- This makes future updates easier when the UI changes.

Files likely involved
- `src/App.tsx`
- `src/pages/UserGuide.tsx` or `src/pages/JourneyGuide.tsx`
- possible new components such as:
  - `src/components/guide/GuideSection.tsx`
  - `src/components/guide/GuideStepCard.tsx`
  - `src/components/guide/GuideScreenshot.tsx`
  - `src/components/guide/GuideToc.tsx`
- navigation entry points depending on placement:
  - `src/components/PublicNav.tsx`
  - `src/components/TopBar.tsx`
  - or `src/pages/About.tsx`
- screenshot assets under a new folder like:
  - `src/assets/guide/*`

Content outline to implement
```text
A. Platform introduction
- What Crisis-X is
- Who it is for
- How the workflow is organized

B. Getting started
- Sign in
- Roles and permissions
- Landing in the dashboard

C. Operating workflow
- Read the dashboard
- Switch or choose the correct case
- Check live signals
- Escalate to the War Room
- Monitor analytics and attribution health
- Generate or export reports

D. Admin workflow
- Add keywords and search queries
- Set monitoring windows
- Review freshness / timestamp QA
- Check settings and role administration

E. Best practices
- Recommended daily checks
- When to use each module
- How to validate data freshness
```

Screenshot plan
- Use screenshots that map one-to-one with guide sections:
```text
01-auth-signin
02-dashboard-command-center
03-case-switcher
04-tracking-manager
05-signals-monitoring
06-war-room
07-analytics-live-mode
08-reports
09-admin-qa
10-settings
```
- Pair each screenshot with:
  - a title
  - 2-4 bullet explanations
  - a “Why this matters” note

Technical details
- The guide should be responsive and readable on laptop/tablet widths.
- Use existing UI primitives (`Card`, `Badge`, `Button`, layout spacing, mono labels) to stay on-brand.
- Keep images optimized and not excessively large.
- If screenshots need annotation, generate consistent overlays in React rather than baking all labels into the image files.
- Prefer a data-driven content model so text, captions, and screenshot metadata are easy to revise.

Validation checklist
- Confirm every guide step maps to a real screen and current feature.
- Confirm both audiences can follow the guide without assuming prior knowledge.
- Confirm screenshots are clear, current, and match the actual route names and labels.
- Confirm navigation links to the guide are discoverable.
- Confirm the guide works well in the current dark theme and within the existing layout patterns.

Expected outcome
- Users get a professional, structured, screenshot-backed walkthrough of the platform.
- New users understand the end-to-end flow quickly.
- Admins get a practical operational guide for setup, monitoring quality, and daily use.
- The guide becomes a reusable onboarding and enablement asset inside the product.
