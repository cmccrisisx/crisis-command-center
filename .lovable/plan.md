

# GlowLogo — Dramatic Unveiling Effect

## Concept
Transform the logo into a theatrical reveal experience fit for a stage unveiling. The logo starts hidden behind an animated "curtain" of particles/lines, then dramatically reveals itself with a cinematic sequence.

## Animation Sequence (auto-plays on page load)
1. **Stage 0 (0-1s)**: A glowing red horizontal line appears center-screen, pulsing — teasing something is coming
2. **Stage 1 (1-2s)**: The line splits vertically into two halves that slide apart like curtains, revealing the logo behind with a bright flash
3. **Stage 2 (2-3s)**: Logo scales from 0.95→1 with blur-to-sharp transition, red glow intensifies dramatically then settles to the ambient pulse
4. **Stage 3 (3s+)**: Logo enters its idle state — gentle float + breathing glow + interactive hover

## Interactive Features (post-reveal)
- **Hover**: Logo lifts slightly (y: -4), glow intensifies, subtle scale 1.02
- **Click/Tap**: Triggers a brief "pulse burst" — a ring of red light expands outward from the logo and fades (like a sonar ping) — satisfying feedback for presenters clicking during the talk
- **Mouse proximity glow**: The red glow subtly follows/intensifies toward the cursor direction using `onMouseMove` to calculate offset

## Technical Details

### File: `src/components/launch/GlowLogo.tsx` — full rewrite
- Use framer-motion `AnimatePresence` + `variants` for the multi-stage sequence
- `useState` to track reveal phase (`hidden` → `revealing` → `revealed`)
- Curtain effect: two `motion.div` elements with `clipPath` or `translateX` animation
- Burst effect on click: a `motion.div` circle that scales from 0→3 with opacity 1→0
- Mouse-follow glow: `onMouseMove` handler calculates relative position, applies as `radialGradient` offset on a background layer
- No new dependencies

### File: `src/pages/Launch.tsx` — no changes needed
Already renders `<GlowLogo />` in the hero.

