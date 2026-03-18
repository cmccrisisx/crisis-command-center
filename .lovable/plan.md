

# Seed Database with Airtel Nigeria Telecom Outage Data

## Current State
The database already has some generic "TelecomCo / Eastern Seaboard" data. We'll update existing records and add more to create a rich Airtel Nigeria crisis scenario.

## Plan

### 1. Update existing crisis
Change the single crisis from "Major Network Outage — Eastern Seaboard" to an Airtel Nigeria-themed crisis (title, description, bump signal_count/sentiment).

### 2. Update existing signals
Update the 12 existing signals to reference Airtel Nigeria, Lagos, Abuja, Nigerian users, NCC (Nigerian Communications Commission) instead of TelecomCo/FCC/Eastern Seaboard.

### 3. Add more signals (~8-10 new)
Insert additional Airtel Nigeria-specific signals covering:
- Nigerian Twitter/X reactions (#AirtelDown, #AirtelNigeria)
- NCC regulatory response
- Nigerian tech blogs (TechCabal, Techpoint Africa)
- Competitor mentions (MTN, Glo, 9mobile)
- Business impact on mobile money/banking

### 4. Update existing narratives
Rebrand the 5 narratives to Airtel Nigeria context (NCC instead of FCC, Naira instead of dollars, Lagos/Abuja instead of Eastern seaboard).

### 5. Update reputation snapshots
Update the 12 existing snapshots to reflect realistic Airtel Nigeria sentiment patterns over the crisis timeline.

### 6. Update mock-data.ts
Rebrand the local mock data constants to Airtel Nigeria so any fallback/utility references stay consistent.

## Technical Approach
- Use the data insert tool for all UPDATE/INSERT operations (no migrations needed — schema is unchanged)
- Crisis ID `a1b2c3d4-e5f6-7890-abcd-ef1234567890` will be referenced as the foreign key for new signals/narratives
- All data uses existing enum values (signal_source, sentiment_type, risk_level, crisis_type, crisis_status)

