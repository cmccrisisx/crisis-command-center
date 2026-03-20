

# Real-Time Signal Ingestion Pipeline — Firecrawl + AI

## Overview
Build an automated edge function that scrapes real news/social mentions for **MTN Nigeria, Dangote, Zenith Bank, Flutterwave, Opay, and Paystack** using Firecrawl, then uses Lovable AI to extract sentiment, keywords, and crisis relevance before inserting live signals into the database.

## Architecture

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐     ┌──────────┐
│  Cron Job    │────▶│ ingest-signals   │────▶│ Firecrawl   │────▶│ Lovable  │
│ (every 15m) │     │ Edge Function    │     │ Search API  │     │ AI (NLP) │
└─────────────┘     └──────────────────┘     └─────────────┘     └──────────┘
                            │                                          │
                            ▼                                          ▼
                    ┌──────────────┐                          Sentiment, keywords,
                    │ signals table │◀─────────────────────── source classification
                    └──────────────┘
```

## Steps

### 1. Link Firecrawl connector
Connect the existing PRAttribution Crawler (Firecrawl) connection to this project so the `FIRECRAWL_API_KEY` is available in edge functions.

### 2. Create `ingest-signals` edge function
- **Brand queries**: Search Firecrawl for each brand: `"MTN Nigeria crisis OR outage OR scandal"`, `"Dangote refinery OR regulation"`, `"Zenith Bank fraud OR customer"`, `"Flutterwave dispute OR shutdown"`, `"Opay fraud OR regulation"`, `"Paystack downtime OR security"`
- **Deduplication**: Check existing signals by content hash or URL to avoid duplicates
- **AI enrichment**: For each scraped result, call Lovable AI (gemini-2.5-flash-lite — fast & cheap) with tool calling to extract:
  - `sentiment`: positive / neutral / negative
  - `keywords`: array of 3-5 relevant terms
  - `is_influencer`: boolean based on source authority
  - `author`: extracted from the article/post
  - `reach`: estimated from source domain authority
- **Crisis matching**: Match each signal to the correct crisis record by brand name
- **Insert**: Batch insert into `signals` table using service role key

### 3. Schedule with pg_cron
Set up a cron job to call `ingest-signals` every 15 minutes, keeping the signal feed fresh without hammering APIs.

### 4. Add manual trigger button
Add a "Refresh Signals" button on the Signals page that calls the edge function on-demand for instant data pull.

### 5. Create crises for new brands
Insert 3 new crisis records for Flutterwave, Opay, and Paystack (the existing MTN, Dangote, Zenith Bank crises stay).

## Technical Details

- **Firecrawl Search API**: `POST /v1/search` with `scrapeOptions: { formats: ['markdown'] }` to get article content
- **AI model**: `google/gemini-2.5-flash-lite` for signal classification (cheapest, fastest — handles sentiment/keyword extraction easily)
- **Rate limiting**: 1-second delay between brand searches to respect Firecrawl limits; 6 brands × ~10 results = ~60 signals per run
- **Dedup strategy**: Store a `source_url` column (new migration) on signals table; skip if URL already exists
- **Service role**: Edge function uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for inserts

## Database Changes

### Migration: Add `source_url` column to signals
```sql
ALTER TABLE public.signals ADD COLUMN IF NOT EXISTS source_url text;
CREATE UNIQUE INDEX IF NOT EXISTS signals_source_url_unique ON public.signals (source_url) WHERE source_url IS NOT NULL;
```

### Insert 3 fintech crisis records
- **Flutterwave** — Regulatory scrutiny & merchant disputes (HIGH, regulatory)
- **Opay** — Agent fraud & consumer protection concerns (MEDIUM, operational)
- **Paystack** — Payment gateway downtime & security review (MEDIUM, operational)

## Files Created/Modified
- `supabase/functions/ingest-signals/index.ts` — new edge function (Firecrawl search + AI enrichment + DB insert)
- `src/pages/Signals.tsx` — add "Refresh Signals" button
- Database migration — add `source_url` column + unique index
- Database insert — 3 new fintech crisis records
- pg_cron job — scheduled every 15 minutes

