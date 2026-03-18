Crisis X platform - dark-mode-first Bloomberg Terminal aesthetic, JetBrains Mono font, sharp geometric components

## Design System
- Dark obsidian bg (222 47% 4%), Ice White fg, Crisis Red primary (0 85% 55%)
- Fonts: system sans + JetBrains Mono for data/labels
- All numeric data uses tabular-nums + font-mono
- Custom tokens: crisis-red, crisis-amber, crisis-green, crisis-blue, crisis-purple
- Risk levels: critical/high/medium/low with color-coded badges
- No rounded bubbles — sharp sm radius (0.25rem)
- Global risk bar at top of every page (1px, color-coded)

## Architecture
- 5 modules: SIGNAL, SENSE, STRATEGIZE, SPEAK, STABILIZE
- Pages: Dashboard(/), Signals, War Room, Speak(/speak), Analytics, Stabilize(/stabilize), Reports, Settings
- Mock data engine in src/lib/mock-data.ts (telecom outage scenario)
- Dark mode forced via .dark wrapper in App.tsx

## Database Tables (Lovable Cloud)
- crises, signals, narratives, response_templates, response_log, war_room_messages, reputation_snapshots
- Enums: crisis_status, crisis_type, risk_level, sentiment_type, signal_source, response_template_type, approval_status
- Realtime enabled on: war_room_messages, signals
- All tables have RLS for authenticated users

## AI Analysis Types
- sentiment, narrative, response, emotional, reputation, draft_response, post_crisis_summary, scenario_simulation
- Edge function: supabase/functions/crisis-ai/index.ts
- Uses Lovable AI gateway (gemini-3-flash-preview)

## Auth & RBAC
- Roles: admin, pr_manager, legal_reviewer, social_manager
- has_role() security definer function
- Default role on signup: pr_manager
- Role-based assignments in War Room

## Completed
- Auth + RBAC foundation
- AI integration (8 analysis types via edge function)
- Real-time War Room with DB persistence
- SPEAK module (templates, AI drafting, audit trail)
- STABILIZE module (recovery charts, AI post-crisis reports)
- Emotional + Reputation analysis tabs in CrisisAI panel

## Seeded Data
- Crisis: "Major Network Outage — Eastern Seaboard" (id: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
- 10 signals seeded (twitter, news, blog, linkedin)
- 5 narrative clusters seeded
- Signals page now reads from DB (not mock data)

## Pending
- Functional approval workflow (status transitions by role)
- Scenario simulation UI
- PDF export for reports
- Role-based UI gating (hide/show features per role)
