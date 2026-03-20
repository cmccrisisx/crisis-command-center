

# Rename AI Agent from "CX" to "Naya"

## Overview
Rebrand the AI assistant from "CX" to **Naya** — a contemporary, youthful, modern African corporate female persona. Update the avatar, system prompt personality, and all UI references.

## Changes

### 1. Generate new avatar — AI image
- Generate a portrait of a modern young African professional woman via AI image generation
- Save as `src/assets/naya-avatar.png`
- Style: confident, corporate-casual, warm lighting, contemporary African aesthetic

### 2. Update system prompt — `supabase/functions/crisis-chat/index.ts`
- Rename "CX" → "Naya" in the system prompt opening
- Adjust persona to reflect a sharp, modern African professional woman — keep the same expertise but give her a warmer, more relatable voice with subtle African cultural references
- Deploy the edge function

### 3. Update chat UI — `src/components/CrisisChat.tsx`
- Replace all "CX" references with "Naya" (avatar alt text, header name, placeholder, loading state, PDF export labels, tooltip)
- Update import from `cx-avatar.png` to `naya-avatar.png`
- Change greeting from "yo, i'm CX" to something fitting Naya's persona

### 4. Update chat hook — `src/hooks/useCrisisChat.ts`
- Table name `cx_chat_messages` stays (it's a DB table — renaming requires migration and isn't worth the risk). Only code references to the name "CX" change.

### 5. Update demo walkthrough — `src/components/DemoWalkthrough.tsx`
- Change "AI Advisor — CX" to "AI Advisor — Naya" and update description

### 6. Rename database table (migration)
- Rename `cx_chat_messages` → `naya_chat_messages` for consistency
- Update all code references to the new table name

## Files Modified
- `src/assets/naya-avatar.png` — new AI-generated avatar
- `supabase/functions/crisis-chat/index.ts` — persona rename + personality tweak
- `src/components/CrisisChat.tsx` — all UI text + avatar import
- `src/hooks/useCrisisChat.ts` — table name references
- `src/components/DemoWalkthrough.tsx` — walkthrough step text
- Database migration — rename table

