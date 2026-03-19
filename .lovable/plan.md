

# Landing Page — Interactive Polish with Enterprise Visual Impact

## What We're Building
Transform the current static landing page into a visually rich, interactive experience with CSS-driven effects, scroll-based parallax, and micro-interactions — all while keeping the clean, enterprise-grade Bloomberg-terminal aesthetic.

## Changes

### 1. Hero Section — Parallax + Floating Orbs (`Landing.tsx`)
- **Floating orbs**: 3-4 large radial-gradient circles (crisis-red, crisis-blue, crisis-purple) positioned absolutely behind the hero content, each with a different CSS float/drift animation — creates depth without clutter
- **Parallax scrolling**: Use framer-motion `useScroll` + `useTransform` so hero content translates slower than the background orbs/grid as user scrolls, creating natural depth
- **Scan line overlay**: A single thin horizontal line that sweeps downward on repeat — subtle radar/terminal feel
- **More dramatic entrance**: Logo scales from 0.8 with blur, title characters stagger in, CTA buttons slide up with spring physics

### 2. Interactive Feature Cards (`Landing.tsx`)
- On hover: card lifts with `translateY(-4px)`, border glows in the module's accent color (e.g. blue glow for Signal, purple for Sense), icon scales up slightly
- Staggered viewport entrance with subtle rotation (1-2deg) that resolves to 0
- Add a thin accent bar at the top of each card in the module's color

### 3. Stats Section — Animated Counters (`Landing.tsx`)
- Numbers animate in (count-up effect for "30s" and "4+", type-in for "AI") using framer-motion `useInView` trigger
- Each stat card gets a subtle border-glow pulse on viewport entry

### 4. New CSS Keyframes (`tailwind.config.ts` + `index.css`)
- `float`: gentle vertical bob (8px over 6s, ease-in-out, infinite) with 3 delay variants
- `scan-line`: translateY sweep from -100% to 100% over 8s
- `glow-pulse`: box-shadow opacity oscillation for card hover states
- Hero orb utility classes with radial gradients and blur

### 5. Minor Polish
- Increase hero vertical padding (pt-40 pb-28) for more presence
- Nav gets a more visible glass effect on scroll (already has backdrop-blur, strengthen it)
- Final CTA section: add floating orb accent behind it for visual continuity
- Smooth scroll behavior already in index.css — no changes needed

### Files Modified
- **`src/pages/Landing.tsx`** — parallax, orbs, interactive cards, animated stats, enhanced entrance animations
- **`tailwind.config.ts`** — new keyframes (float, scan-line, glow-pulse)
- **`src/index.css`** — hero-orb utility classes, scan-line overlay styles

