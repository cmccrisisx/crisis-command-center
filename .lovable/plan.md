
The user wants to wipe all existing demo/brand data and refocus the platform on a single brand: **Kaduna State (Government)**, with real-time signal ingestion.

Let me check the current ingestion setup and seeded data.

Current state:
- `ingest-signals/index.ts` hardcodes 6 brand queries (MTN, Dangote, Zenith, Flutterwave, Opay, Paystack) → 6 fixed crisis IDs
- `crises` table has those 6 seeded crises
- Signals, narratives, reputation_snapshots, response_log all reference those crisis_ids

## Plan: Refocus Platform on Kaduna State

### 1. Database Cleanup (migration)
- Delete all existing `signals`, `narratives`, `reputation_snapshots`, `response_log`, `war_room_messages`, `naya_chat_messages`
- Delete all existing `crises`
- Insert ONE new crisis: **Kaduna State Government** (single fixed UUID, type: `operational`, risk_level: `medium`)

### 2. Edge Function Update — `supabase/functions/ingest-signals/index.ts`
Replace the 6-brand config with a single Kaduna-focused query set:
- `BRAND_QUERIES` → one entry covering Kaduna State governance, security, protests, infrastructure, education, IDP, Uba Sani administration, etc. (broken into 3-4 sub-queries for richer coverage)
- `BRAND_CRISIS_MAP` → single key `kaduna` → new crisis UUID
- All sub-queries write to the same Kaduna crisis_id

Suggested queries:
1. `"Kaduna State governor Uba Sani policy OR security OR budget"`
2. `"Kaduna State protest OR attack OR bandit OR insecurity"`
3. `"Kaduna State infrastructure OR education OR healthcare OR IDP"`
4. `"Kaduna government KADIPA investment OR economy"`

### 3. Trigger Initial Ingestion
After deploy, invoke `ingest-signals` once to populate fresh real-time data for Kaduna.

### 4. UI — No code changes needed
Dashboard, Signals, War Room, Analytics already query whatever crisis exists. With only Kaduna present, all views auto-focus on it. The `AppLayout` query (`order created_at desc, limit 1`) will pick up Kaduna automatically.

### Notes
- Existing cron schedule (if any) on `ingest-signals` continues working — now feeds only Kaduna.
- Storage bucket `verified-documents` and user data (profiles, roles, notifications) are preserved.
- This is destructive — all demo crisis data gets wiped.
