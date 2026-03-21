

# Verified Authority — Implementation Plan

## Overview
Build two views — an internal Trust Ledger for minting verified communications, and a public Verification Portal — sharing one backend (edge function + database table).

## 1. Database Migration

New table `verified_communications`:
- `id` uuid PK, `document_title` text, `authorizing_executive` text, `content_hash` text (SHA-256), `signature` text (HMAC), `file_name` text, `file_size` bigint, `mime_type` text, `minted_by` uuid (references profiles.user_id), `minted_at` timestamptz default now(), `status` text default 'anchoring', `chain_tx_hash` text nullable, `verification_url` text, `metadata` jsonb default '{}'

RLS policies:
- Authenticated SELECT (all records for internal users)
- Authenticated INSERT (minted_by = auth.uid())
- Admin UPDATE (status changes)
- Anon SELECT by content_hash only (public verification lookups)

Storage bucket `verified-documents` (private) for uploaded files.

## 2. Edge Function: `verify-communication`

Two endpoints:
- `POST` with `action: "mint"` — receives file as base64, computes SHA-256 via Web Crypto, signs with HMAC using service role key, inserts record, returns hash + signature. Auth required.
- `POST` with `action: "verify"` — receives file as base64, computes SHA-256, looks up match in table, returns result. No auth required.

## 3. Trust Ledger Page (`src/pages/TrustLedger.tsx`) — Protected

Crisis-X command center aesthetic:
- Header: "Trust Ledger: Asset Minting & Verification"
- Split layout: Left = drag-and-drop upload zone + title/executive inputs. Right = minting console showing hash preview + "Anchor to Blockchain" button (amber accent)
- Bottom: history table from `verified_communications` — Document Name, Date Minted, Hash (truncated + copy), Status badges (green "Verified", pulsing blue "Anchoring...")
- Flow: upload → client-side hash preview → click Anchor → edge function call → spinner → verified + copy link

## 4. Verification Portal (`src/pages/Verify.tsx`) — Public

Minimalist, no-auth page:
- Centered Crisis-X logo + "Public Trust Verification Portal"
- File upload dropzone + "Scan File" button
- States: Loading (scanning animation), Verified (green shield, issuer/timestamp/ledger receipt), Tampered (red warning, explanation text)
- Footer: "Powered by Crisis-X Trust Infrastructure"

## 5. Routing & Navigation

- `src/App.tsx`: Add `/trust-ledger` (protected), `/verify` (public)
- `src/components/AppSidebar.tsx`: Add "Trust Ledger" nav item with ShieldCheck icon, allowed roles: admin, pr_manager

## 6. Launch Page

Add "Verified Authority" feature highlight section in `src/pages/Launch.tsx` — shield icon, brief copy about cryptographic verification of corporate communications.

## Files

| Action | File |
|--------|------|
| Create | `supabase/functions/verify-communication/index.ts` |
| Create | `src/pages/TrustLedger.tsx` |
| Create | `src/pages/Verify.tsx` |
| Modify | `src/App.tsx` — 2 new routes |
| Modify | `src/components/AppSidebar.tsx` — nav item |
| Modify | `src/pages/Launch.tsx` — feature section |
| Modify | `supabase/config.toml` — function config |
| Migration | `verified_communications` table + RLS + storage bucket |

## Implementation Order
1. Database migration
2. Edge function + deploy
3. Trust Ledger page
4. Verify page
5. Routing + sidebar + launch page update

