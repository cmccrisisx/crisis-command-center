

# Seed Real-World Demo Data — MTN, Dangote, Zenith Bank

## Overview
Clear all existing demo data (Airtel scenario) and populate the platform with three realistic African brand crisis scenarios using real-world-plausible data. This will make the platform demo-ready with authentic signals, narratives, metrics, and response workflows.

## Data Architecture — 3 Crisis Scenarios

### Crisis 1: MTN Nigeria — Network Outage & Data Breach (CRITICAL, operational)
- 5G rollout causes widespread service disruption across Lagos, Abuja, Kano
- Customer data exposure rumor trends on Twitter/X
- NCC regulatory scrutiny, stock drops on NSE
- ~40 signals (Twitter, News, LinkedIn, Blog), reputation snapshots over 7 days

### Crisis 2: Dangote Refinery — Environmental Compliance Scandal (HIGH, regulatory)
- Reports of gas flaring violations at Lekki refinery
- Community protests in Ibeju-Lekki, environmental NGOs amplify
- NESREA investigation launched, international media picks up
- ~35 signals, reputation snapshots over 5 days

### Crisis 3: Zenith Bank — Fraud & Customer Trust Crisis (MEDIUM, pr)
- POS/mobile banking fraud ring exposed, customers report unauthorized debits
- CBN issues directive, social media outrage trends
- Zenith's response strategy being monitored
- ~30 signals, reputation snapshots over 4 days

## Database Operations (Sequential)

### Step 1: Clear existing data
Truncate in dependency order: `war_room_messages`, `response_log`, `reputation_snapshots`, `narratives`, `signals`, `activity_log`, `response_templates`, `naya_chat_messages`, `notifications`, then `crises`.

### Step 2: Insert 3 crises
Each with realistic title, description, risk level, type, status, sentiment score, signal count.

### Step 3: Insert ~105 signals (40 + 35 + 30)
Real-sounding authors (Nigerian journalists, influencers, analysts), realistic content referencing actual locations, regulators (NCC, NESREA, CBN), stock tickers, and social media patterns. Mix of twitter, news, linkedin, blog sources. Varied sentiment distribution.

### Step 4: Insert ~15 narratives (5 per crisis)
Trending narrative clusters with keywords, sentiment, risk levels.

### Step 5: Insert reputation snapshots
Time-series data showing sentiment trajectory — declining for active crises, stabilizing for responding ones. ~8 snapshots per crisis across multiple days.

### Step 6: Insert response templates
6 brand-specific templates (holding statements, apologies, clarifications) tailored to each crisis type.

### Step 7: Insert war room messages
~15 realistic team coordination messages across the 3 crises.

### Step 8: Insert activity log entries
~10 entries showing crisis detection, status changes, response drafts.

## Technical Notes
- All inserts use the migration tool's insert capability (data operations, not schema changes)
- Crisis IDs will use deterministic UUIDs for cross-referencing
- Timestamps spread across the last 7 days for realistic time-series charts
- `created_by` on crises set to NULL (seeded data, not user-created)
- No code changes needed — the UI already renders from these tables dynamically

## Files Modified
- **Database only** — bulk insert operations across 8 tables
- No frontend code changes required

