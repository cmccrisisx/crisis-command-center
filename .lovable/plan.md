

## Text Visibility Fix Plan

### Problem
The CrisisAIPanel title ("CrisisX AI Analysis") and description text are hard to read due to low-contrast `text-muted-foreground` on light backgrounds combined with very small font sizes (`text-[11px]`, `text-[10px]`, `text-[9px]`). This pattern repeats across multiple components.

### Changes

**1. `src/components/CrisisAIPanel.tsx`**
- Title: add explicit `text-foreground` to ensure high contrast
- Description (line 85): bump `text-[11px]` → `text-xs` and change `text-muted-foreground` → `text-foreground/70` for better contrast
- Re-analyze button (line 129): `text-[10px]` → `text-xs`
- STREAMING badge (line 121): `text-[9px]` → `text-[10px]`

**2. `src/pages/Stabilize.tsx`**
- Stat labels (lines 90, 99, 106, 115): `text-[10px]` → `text-xs`
- Sub-text (lines 94, 101, 110): `text-[10px]` → `text-xs`
- STREAMING badge: `text-[9px]` → `text-[10px]`

**3. `src/pages/Scenarios.tsx`**
- Preset descriptions (line 110): `text-[11px]` → `text-xs`
- Crisis description (line 147): `text-[11px]` → `text-xs`

**4. `src/pages/Analytics.tsx`**
- Influencer stats (line 114): `text-[10px]` → `text-xs`

**5. `src/components/TopBar.tsx`**
- User name (line 94): `text-[11px]` → `text-xs`

**6. `src/pages/Speak.tsx`**
- Channel descriptions (line 334): `text-[10px]` → `text-xs`

**7. `src/pages/Signals.tsx`**
- Filter count badge: keep `text-[10px]` (badge context, acceptable)

### Principle
Minimum readable size for body/label text: `text-xs` (12px). `text-[10px]` only acceptable inside compact badges/chips. All descriptive text with `text-muted-foreground` on light surfaces gets bumped to `text-foreground/70` or at minimum `text-xs` to ensure legibility.

