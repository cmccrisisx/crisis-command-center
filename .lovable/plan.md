

# Crisis-X Platform: Current State & Next Phase Plan

## What's Already Built

| Module | Status | Details |
|--------|--------|---------|
| **SIGNAL** (Detection) | Partial | Signals page with mock data, source filtering UI, keyword display. No real-time ingestion or spike detection logic. |
| **SENSE** (Intelligence) | Partial | AI-powered sentiment/narrative/response analysis via edge function (streaming, Lovable AI). Sentiment timeline chart on dashboard. No emotional analysis or reputation scoring. |
| **STRATEGIZE** (Decision) | Partial | War Room with approval chain UI, decision log, assignments. All static/mock. No playbook system or scenario simulation. |
| **SPEAK** (Execution) | Minimal | War Room has a message input. No response templates, no multi-channel publishing, no audit trail. |
| **STABILIZE** (Recovery) | Not built | No recovery tracking, share of voice, reputation score, or post-crisis reports. |
| **Auth & RBAC** | Built | Auth page, profiles table, user_roles with 4 roles (admin, pr_manager, legal_reviewer, social_manager), `has_role` function, ProtectedRoute. No role-based UI gating yet. |
| **Database** | Basic | Tables: profiles, user_roles, activity_log. No tables for crises, signals, responses, or reports. |

## Logical Next Phase: Make the 5 Modules Functional End-to-End

This phase focuses on connecting the modules with real database persistence, role-based permissions, and AI-driven workflows — turning static mockups into a working system.

---

### Phase 1: Database Foundation (Schema)

Create tables to persist crisis data instead of relying solely on mock data:

- **crises** — active/resolved crisis records (title, description, risk_level, type, status, detected_at, resolved_at)
- **signals** — ingested signals (source, author, content, sentiment, reach, keywords, crisis_id FK)
- **narratives** — AI-generated narrative clusters (title, summary, sentiment, risk_level, crisis_id FK)
- **response_templates** — pre-built templates (type: holding/apology/clarification, content, channel)
- **response_log** — what was said, when, by whom, on which channel (crisis_id FK, user_id FK)
- **war_room_messages** — decision log entries (crisis_id FK, user_id FK, message, role)
- **reputation_snapshots** — periodic sentiment/share-of-voice/reputation scores for STABILIZE (crisis_id FK, timestamp)

All tables get RLS policies scoped to authenticated users. Enable realtime on war_room_messages and signals.

### Phase 2: SIGNAL Module — Functional Detection

- Persist signals to DB when "detected" (mock ingestion for demo, but architecture supports future API integration)
- Add signal filtering (by source, sentiment, date range, keyword) with actual query params
- Implement spike detection indicator — compare current volume against rolling baseline
- Add influencer trigger alerts badge on dashboard

### Phase 3: SENSE Module — Emotional & Reputation Analysis

- Add two new AI analysis tabs to the CrisisAI panel: **Emotional Analysis** and **Reputation Analysis**
- Emotional Analysis: fear, anger, frustration, hope classification across signals
- Reputation Analysis: brand perception score, trust indicators, competitive positioning
- Save AI analysis results to DB so they persist across sessions
- Display reputation score widget on dashboard

### Phase 4: STRATEGIZE Module — Playbooks & Approval Workflow

- Create response playbook system with pre-configured strategies by crisis type (PR/Regulatory/Operational)
- Implement functional approval workflow: PR drafts → Legal reviews → Executive approves → Comms executes
- Each step updates status in DB, restricted by user role
- Add scenario simulation: AI generates best-case/worst-case outcomes for each response option

### Phase 5: SPEAK Module — Response Templates & Audit Trail

- Build response template library (holding statements, apologies, clarifications)
- AI-assisted message drafting using crisis context + selected template
- Response log: persist every response with timestamp, author, channel, approval status
- Multi-channel export UI (Twitter draft, LinkedIn draft, press release format)

### Phase 6: STABILIZE Module — Recovery Dashboard

- New page or dashboard section for post-crisis tracking
- Sentiment recovery chart (before/during/after crisis)
- Share of voice tracking over time
- Reputation score trend line
- Auto-generate post-crisis summary using AI (pulling from signals, responses, and outcomes)
- Lessons learned archive (stored in DB)

### Phase 7: Role-Based UI Gating

- Use `useAuth().hasRole()` to conditionally show/hide features:
  - Admin: full access + user management
  - PR Manager: draft responses, manage war room
  - Legal Reviewer: approve/reject in approval chain
  - Social Manager: publish responses, monitor signals
- Show role badge in TopBar next to user name
- Activity log: record all significant actions (approvals, publications, escalations)

---

### Technical Summary

- **~7 new DB tables** with RLS policies and realtime on key tables
- **2 new AI analysis types** added to the existing edge function
- **Enhanced existing pages** (Signals, War Room, Analytics, Reports) with DB-backed data
- **New STABILIZE section** (recovery dashboard)
- **Role-gated UI** across all modules
- All changes use existing patterns: mock data for demo mode, DB for authenticated sessions

### Recommended Build Order

Start with **Phase 1 (DB schema)** then **Phase 3 (Emotional + Reputation AI)** since you specifically called those out, followed by **Phase 2 (Signals)** → **Phase 5 (SPEAK)** → **Phase 4 (STRATEGIZE)** → **Phase 6 (STABILIZE)** → **Phase 7 (RBAC UI)**.

