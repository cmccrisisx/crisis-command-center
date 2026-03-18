

## Crisis X Platform — Comprehensive Review & Enhancement Plan

### Current Implementation Status

**Fully Implemented:**
- Auth (email/password sign-up & sign-in, RBAC with 4 roles)
- Database schema (signals, crises, narratives, profiles, user_roles, war_room_messages, response_log, response_templates, reputation_snapshots, activity_log)
- Dashboard with real-time signal subscription + DB queries
- Signals page with real-time feed, filtering, search (fully wired to DB)
- War Room with real-time chat, AI advisor, approval chain display
- Speak module with approval workflow (draft → legal → exec → approved → published), AI drafting, templates, compose tab
- Analytics page with charts (sentiment, volume, influencer)
- Stabilize page with recovery charts, AI post-crisis report, PDF export
- Scenarios page with AI-powered simulation (3 strategies)
- Reports page with PDF export (jsPDF)
- Settings page (local storage only)
- CrisisAI edge function with streaming SSE via Lovable AI gateway
- Sidebar with RBAC-based nav filtering
- Global risk bar
- PDF export utility

**Partially Implemented / Gaps:**

| Area | Issue |
|------|-------|
| **Dashboard** | Still falls back to `mockData` for stats (activeAlerts, mediaReach, responsesSent, avgResponseTime), crisis alert, narratives, stakeholders, sentiment timeline chart. Only signals + signal count are from DB. |
| **Analytics** | 100% mock data — no DB queries. Influencer data and volume-by-platform are hardcoded. |
| **War Room** | Approval chain is static/hardcoded. Assignments are hardcoded. No crisis_id scoping on messages. |
| **Speak** | Templates are hardcoded (not from `response_templates` table). No realtime on approval queue. |
| **Stabilize** | Recovery data is randomly generated each render (not persisted). Lessons learned are hardcoded. |
| **Scenarios** | No persistence of simulation results. |
| **Reports** | Reports are local state only (not persisted to DB). |
| **Settings** | Saved to localStorage, not the database. No user profile editing. |
| **Roles** | No admin UI to assign roles. New users get zero roles and see only Dashboard. |
| **No conversational AI agent** | There is no conversational AI chatbot/agent anywhere in the app. |
| **Notifications** | Settings UI exists but no actual notification system (no push, no email, no in-app). |
| **Demo/onboarding** | Demo mode toggle exists but doesn't do anything. No guided walkthrough. |

---

### Enhancement Plan

#### Phase 1 — Conversational AI Crisis Agent (High Priority)

Add a floating AI chat assistant accessible from every page — a "youthful" conversational agent that helps users navigate the platform, ask crisis questions, get quick analysis, and draft responses conversationally.

**Implementation:**
1. Create new edge function `supabase/functions/crisis-chat/index.ts` — a conversational endpoint that accepts message history and responds with context-aware crisis guidance using Lovable AI (google/gemini-3-flash-preview). System prompt: friendly, sharp, slightly informal crisis advisor persona ("CX" — your AI crisis partner).
2. Create `src/hooks/useCrisisChat.ts` — manages conversation state, streaming, message history.
3. Create `src/components/CrisisChat.tsx` — floating chat bubble (bottom-right corner), expandable panel with message list, markdown rendering, input field. Styled in the Bloomberg dark aesthetic.
4. Mount `<CrisisChat />` inside `AppLayout` so it appears on every page.
5. The agent can contextually reference the current page, current crisis data, and provide actionable advice.

#### Phase 2 — Wire Remaining Pages to Database

1. **Dashboard**: Query `crises`, `narratives`, `reputation_snapshots` tables instead of mock data for the crisis alert, narratives, stakeholders, and sentiment timeline.
2. **Analytics**: Query `signals` and `reputation_snapshots` for real charts. Compute influencer data from signals where `is_influencer = true`.
3. **Speak templates**: Load from `response_templates` table instead of hardcoded array.
4. **Reports**: Persist reports to a new `reports` table in the database.
5. **Settings**: Persist to `profiles` table (add preferences JSON column) instead of localStorage.

#### Phase 3 — Role Management & Onboarding

1. Add admin role-management UI on Settings page (assign roles to users by email).
2. Auto-assign a default role (`pr_manager`) to new sign-ups via a database trigger, so they can actually see nav items.
3. Add a guided demo walkthrough (step-by-step overlay) for first-time users.

#### Phase 4 — Polish

1. In-app notification system (toast-based alerts for new signals, approval status changes).
2. Realtime subscription on approval queue in Speak.
3. Scope War Room messages by `crisis_id`.
4. Mobile responsive improvements (sidebar collapse, chat panel).

---

### Recommended Starting Point

The conversational AI agent is the most impactful single addition — it transforms the platform from a dashboard into an interactive crisis command experience. I recommend implementing Phase 1 first.

