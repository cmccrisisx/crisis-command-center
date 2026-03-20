

# Pre-Launch Enhancements: Mobile Responsiveness + Data Audit

## Data Status: All Live

Every page queries the database directly via the client SDK. No mock data files exist. Current database counts:
- **122 signals**, **6 crises**, **30 narratives**, **45 reputation snapshots**, **6 response templates**
- Only `Reports.tsx` has hardcoded `defaultReports[]` (3 static report entries used as fallback UI) — this is acceptable scaffolding, not mock data

The `ingest-signals` edge function generates simulated signals on demand (the "Ingest Signals" button on the Signals page). This is intentional for demo purposes. All chart data, stats, and AI analysis pull from live database tables.

**Verdict: The app runs on real database data. No hidden mock layers.**

## Mobile Responsiveness Issues Found

### 1. War Room header — overflows on mobile
- Header uses `flex items-center justify-between` with a fixed `w-[280px]` SelectTrigger
- No flex-wrap or stacking on small screens — will overflow

### 2. War Room approval chain — horizontal overflow
- `div className="flex items-center gap-2"` with 4 equal steps — no wrapping
- On mobile, the chain overflows or gets crushed

### 3. Stabilize header — button text truncates
- "Generate Post-Crisis Report" button doesn't shrink on mobile
- Header is `flex items-center justify-between` with no wrapping

### 4. Analytics page title — no responsive sizing
- `text-2xl` with no `sm:` breakpoint adjustment

### 5. Speak page — tabs overflow on small screens
- Multiple tab triggers in a row may overflow horizontally

### 6. Scenarios page — preset cards may not stack properly on narrow screens

## Plan

### File: `src/pages/WarRoom.tsx`
- Make header flex-wrap: `flex flex-col sm:flex-row sm:items-center justify-between gap-3`
- Make SelectTrigger responsive: `w-full sm:w-[280px]`
- Make approval chain wrap on mobile: `flex flex-wrap` or convert to `grid grid-cols-2 sm:grid-cols-4`

### File: `src/pages/Stabilize.tsx`
- Wrap header: `flex flex-col sm:flex-row sm:items-center justify-between gap-3`
- Make button text hide on mobile, show icon only: `<span className="hidden sm:inline">Generate Post-Crisis Report</span>`

### File: `src/pages/Analytics.tsx`
- Responsive title: `text-xl sm:text-2xl`

### File: `src/pages/Speak.tsx`
- Add `overflow-x-auto` to TabsList wrapper for horizontal scroll on mobile
- Responsive title sizing

### File: `src/pages/Scenarios.tsx`
- Responsive title and preset card grid adjustments

### File: `src/pages/Reports.tsx`
- Note: `defaultReports` array is static scaffolding — flag it with a comment but leave as-is (not mock data, just default report templates)

### Files: All page headers
- Consistent pattern: `text-xl sm:text-2xl` for h1 elements
- Consistent pattern: `flex flex-col sm:flex-row` for header layouts with buttons

No database changes needed. No edge function changes needed.

