

## Fix: Filter Input and Button Text Invisible on Signals Page

### Problem
The search input (`bg-card`) and Filters button render with a solid dark background in this dark theme, making the placeholder text and button label invisible.

### Changes

**`src/pages/Signals.tsx`**
- Line 140: Change `bg-card` on the Input to `bg-background` so it picks up the page background with visible border contrast, or use `bg-secondary` for a lighter surface
- Line 144: Add `border-border` styling to the Filters button to ensure it's distinguishable

Specifically:
- Input (line 140): replace `bg-card` → `bg-secondary` and add `text-foreground placeholder:text-muted-foreground` to ensure both typed text and placeholder are visible
- Filters button: add explicit `text-foreground` class to guarantee label visibility

