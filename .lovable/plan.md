

# Fix Low-Contrast Text in TopBar

The `text-muted-foreground` labels in the TopBar are nearly invisible against the dark background. The current dark mode value is `220 10% 55%` which lacks sufficient contrast.

## Changes

### 1. `src/index.css` — Increase muted-foreground brightness in dark mode
- Change `--muted-foreground: 220 10% 55%` to `220 10% 65%` for better readability across the entire app

### 2. `src/components/TopBar.tsx` — Use brighter text for key labels
- Change "Global Risk:" label from `text-muted-foreground` to `text-foreground/70`
- Change "Signals" and "Alerts" labels from `text-muted-foreground` to `text-foreground/70`

This two-pronged approach improves global muted text contrast while ensuring TopBar labels are always legible.

