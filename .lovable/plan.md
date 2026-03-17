
# Crisis X — Real-Time Crisis Intelligence & Response Platform

## Overview
A modular crisis command center built as a dark-mode-first, data-dense dashboard inspired by Bloomberg Terminal aesthetics. The platform uses Supabase for auth, database, and edge functions, with Lovable AI for intelligence capabilities. Demo mode ships with a simulated telecom outage scenario.

---

## Phase 1: Foundation & Core Shell

### Design System Setup
- Dark obsidian palette (`222 47% 4%` background), Ice White foreground, Crisis Red primary
- Import Geist Sans + JetBrains Mono fonts
- Global Risk Status bar (4px, color-coded) at the top of every page
- Hard shadows, `backdrop-blur`, no rounded bubbles — sharp geometric components
- Custom components: RiskBadge, NarrativeCard, skeleton screens (no spinners)

### Authentication & Roles
- Supabase auth with email/password login
- `user_roles` table with enum: `admin`, `pr_manager`, `legal_reviewer`, `social_manager`
- Role-based route guards and permission checks via `has_role()` security definer function
- Activity log table tracking user actions with timestamps

### App Shell & Navigation
- Sidebar navigation: Dashboard, War Room, Analytics, Reports, Settings
- Top bar with global risk indicator, user avatar, notification bell
- Responsive layout optimized for desktop-first (with mobile support)

---

## Phase 2: SIGNAL — Detection Engine

### Real-Time Signal Ticker
- Right-hand sidebar with vertical scrolling feed of incoming signals (tweets, news, blogs)
- Paginated batches (no infinite scroll per design spec)
- Sparkline charts showing 1h vs 24h volume per keyword
- `tabular-nums` for all numeric data, `font-mono` timestamps

### Alert System
- Configurable keyword tracking and alert thresholds (stored in Supabase)
- Spike/anomaly detection logic — flags when mention volume exceeds baseline by configurable multiplier
- Influencer trigger alerts when high-follower accounts engage
- Toast + persistent alert panel for new crisis detections

### Mock Data Engine
- Simulated real-time data streams using intervals and randomized realistic data
- Telecom outage scenario pre-loaded: escalating negative mentions, key influencer posts, news pickups

---

## Phase 3: SENSE — Intelligence Engine

### AI-Powered Analysis (via Lovable AI)
- Edge function calling Lovable AI to classify sentiment (Positive/Neutral/Negative)
- Topic clustering — AI groups related mentions into narrative threads
- Stakeholder identification — AI tags key drivers of conversation
- Risk score calculation: Low / Medium / High / Critical

### Sentiment Heatmap
- `oklch` gradient visualization from Green (Recovery) to Red (Crisis)
- 3-column stakeholder impact grid: Investors, Customers, Employees

### Narrative Summary
- AI-generated "What is happening" plain-English summary block
- Styled with `bg-white/5 border-l-2 border-intel` per design spec
- Auto-refreshes as new signals arrive

---

## Phase 4: STRATEGIZE — Decision Engine

### Crisis Classification
- AI categorizes crisis type: PR / Regulatory / Operational
- Recommended response playbooks pulled from templates table

### War Room Mode
- "Escalate" button triggers War Room — interface border pulses Crisis Red
- Horizontal Chain of Command tracker with status pills (Legal Review → Approve → Execute)
- Live collaboration: chat timeline + decision log stored in Supabase
- Assigned responsibilities per role

### Scenario Simulator
- Slider from "Aggressive" to "Passive" response strategy
- Updates projected reputation recovery chart with spring animation
- Best-case / worst-case outcome projections via AI

### Approval Workflow
- Multi-step approval: PR Manager drafts → Legal reviews → Executive approves
- Each step logged with timestamp and user, visible in timeline
- Role-gated action buttons

---

## Phase 5: SPEAK — Execution Engine

### Response Editor
- Split-pane: AI Draft (left) + Live Preview as Tweet/LinkedIn post (right)
- Pre-built templates: Holding Statements, Apologies, Clarifications
- AI-assisted drafting via Lovable AI edge function

### Publishing
- "Hold to Confirm" 2-second publish button (prevents accidental crisis posts)
- Multi-channel mock publishing to Twitter/X, LinkedIn, Press Release
- Full audit trail: what was said, when, by whom

---

## Phase 6: STABILIZE — Recovery Engine

### Recovery Dashboard
- Sentiment recovery over time (line chart)
- Share of Voice — overlapping area charts (before vs. after incident)
- Reputation Delta score

### Reporting
- Auto-generated post-crisis executive briefing
- Export to PDF with clean, high-contrast print stylesheet
- Lessons learned archive stored in database

---

## Phase 7: Main Dashboard & Analytics

### Command Center Dashboard
- Real-time sentiment graph (recharts)
- Crisis alert panel with active incidents
- Trending narratives feed
- Risk level indicator (green → amber → red, animated)

### Analytics Page
- Sentiment trends over time with filterable date ranges
- Influencer impact rankings
- Media reach metrics
- Filters by geography, keyword, platform

---

## Phase 8: Demo Mode — Telecom Outage Scenario

### Interactive Simulation
- Pre-scripted scenario: Network outage → spike detection → High Risk flag → sentiment drop → AI suggests holding statement → user approves → sentiment recovers
- Guided walkthrough mode showing each module in action
- Realistic mock data across all 5 modules

---

## Technical Architecture
- **Frontend**: React + TypeScript + Tailwind (dark mode primary) + Recharts + Framer Motion
- **Backend**: Supabase (auth, Postgres, Edge Functions, real-time subscriptions)
- **AI**: Lovable AI gateway for sentiment analysis, summaries, draft generation
- **Data**: Mock data engine with realistic crisis simulation, designed for future API integration
