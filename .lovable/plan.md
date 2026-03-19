

# Fix Landing Page — Compact Hero + Logo Overlap Fix

## Problems
1. **Central logo hidden behind sticky nav**: The nav is fixed at `top-1` (~4px), and the hero logo sits near the top of the centered content — on shorter viewports it collides with the nav bar.
2. **Hero too tall**: `min-h-screen` forces the hero to fill the entire viewport, pushing the footer below the fold. Users can't see the full layout.

## Changes — `src/pages/Landing.tsx`

### 1. Make hero compact — fit everything in viewport
- Change hero from `min-h-screen` to `h-screen` so it locks to exactly the viewport height (footer sits right below)
- Reduce the logo size from `h-28` to `h-16` to save vertical space
- Reduce `mb-8` on logo container to `mb-4`
- Reduce title size: `lg:text-7xl` → `lg:text-6xl`
- Reduce subtitle `mb-10` → `mb-6`
- Reduce CTA `mb-12` → `mb-6`
- Add `pt-16` to the hero content container so it clears the sticky nav (~64px)

### 2. Footer stays visible
- With `h-screen` instead of `min-h-screen`, the footer will naturally appear right at the bottom edge, visible without scrolling on most viewports

### Files Modified
- `src/pages/Landing.tsx` — spacing and sizing adjustments only

