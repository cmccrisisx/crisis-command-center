Crisis X platform - dark-mode-first Bloomberg Terminal aesthetic, JetBrains Mono font, sharp geometric components

## Design System
- Dark obsidian bg (222 47% 4%), Ice White fg, Crisis Red primary (0 85% 55%)
- Fonts: system sans + JetBrains Mono for data/labels
- All numeric data uses tabular-nums + font-mono
- Custom tokens: crisis-red, crisis-amber, crisis-green, crisis-blue, crisis-purple
- Risk levels: critical/high/medium/low with color-coded badges
- No rounded bubbles — sharp sm radius (0.25rem)
- Global risk bar at top of every page (1px, color-coded)
- Outline button variant includes text-foreground globally (no per-button overrides)

## Architecture
- 5 modules: SIGNAL, SENSE, STRATEGIZE, SPEAK, STABILIZE
- Pages: Dashboard(/), Signals, War Room, Speak(/speak), Analytics, Stabilize(/stabilize), Reports, Settings
- Mock data engine in src/lib/mock-data.ts (telecom outage scenario)
- Dark mode forced via .dark wrapper in App.tsx

## Database Tables (Lovable Cloud)
- crises, signals, narratives, response_templates, response_log, war_room_messages, reputation_snapshots, profiles, user_roles, activity_log
- Enums: crisis_status, crisis_type, risk_level, sentiment_type, signal_source, response_template_type, approval_status
- Realtime enabled on: war_room_messages, signals
- All tables have RLS for authenticated users

## AI
- CrisisAI panel: sentiment, narrative, response, emotional, reputation, draft_response, post_crisis_summary, scenario_simulation
- Edge function: supabase/functions/crisis-ai/index.ts (Lovable AI gateway, gemini-3-flash-preview)
- Conversational AI agent "CX": supabase/functions/crisis-chat/index.ts + src/components/CrisisChat.tsx
- CX mounted in AppLayout — floating chat bubble on every page
- Hook: src/hooks/useCrisisChat.ts (streaming SSE)

## Auth & RBAC
- Roles: admin, pr_manager, legal_reviewer, social_manager
- has_role() security definer function
- Default role on signup: pr_manager (via handle_new_user trigger)
- Role-based nav filtering in sidebar

## Seeded Data
- Crisis: "Major Network Outage — Eastern Seaboard" (id: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
- 10 signals, 5 narrative clusters seeded

## Pending
- Persist Settings to profiles table
- Persist Reports to DB
- In-app notification system
- Demo walkthrough mode
- Mobile responsive improvements
