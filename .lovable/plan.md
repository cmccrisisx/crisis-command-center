

# Fix Crisis Alert Card — Invisible Text on Light Pink Background

The crisis alert card uses `bg-crisis-red/5` which overrides the dark card background with a nearly-white pink tint. The light foreground text (white/light gray from dark mode) becomes invisible against this light pink background.

## Root Cause

The `Card` base class includes `bg-card` (dark in dark mode), but `bg-crisis-red/5` replaces it with `hsl(0 85% 55% / 0.05)` — a 5% opacity red that resolves to a very light pink regardless of dark mode. Light-colored `text-foreground` is then invisible on this light background.

## Fix — `src/pages/Index.tsx`

Change the crisis alert card background from `bg-crisis-red/5` to a dark-mode-friendly dark red:

- **Card class**: `border-crisis-red/30 bg-crisis-red/5` → `border-crisis-red/30 bg-crisis-red/10 dark:bg-red-950/60`

This gives a dark, richly tinted red background that keeps the text legible while maintaining the "alert" visual distinction.

