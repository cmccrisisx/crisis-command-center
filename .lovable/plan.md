

# Launch Page — Logo Glow, Story Flow, and Presenter-Friendly Interactivity

## Logo Fix + Animated Glow

**Problem:** The logo uses `rounded-full` on a non-square JPEG, making it oval. The image also lacks visual punch for stage presentation.

**Fix in `src/pages/Launch.tsx`:**
- Replace `rounded-full` with `rounded-2xl` (or `rounded-xl`) so the logo keeps its natural aspect ratio — no more oval distortion
- Add a CSS pulsing glow ring effect using layered `box-shadow` with `crisis-red` color, animated via framer-motion's `animate` prop cycling between two shadow intensities
- Wrap the logo in a container with a subtle rotating gradient border (using `background: conic-gradient(...)` on a pseudo-element or a wrapper div with framer-motion `rotate` animation)
- Make the logo larger on desktop: `w-32 h-32 sm:w-44 sm:h-44`

## Storytelling + Presenter-Friendly Enhancements

The goal: each section feels like a "slide" the presenter clicks through, with dramatic reveals the audience can follow.

### 1. Hero — Typewriter headline effect
- Animate "Crisis-X" title with a staggered letter reveal (framer-motion `staggerChildren`) so the name types itself on screen
- Add a subtle tagline fade-in with 1s delay after the title finishes

### 2. Problem Section — Sequential stat reveals
- Instead of all 3 stats appearing together, stagger them with 0.4s delays between each card
- Add a brief "flash" highlight effect on each counter when it finishes counting (border pulse)

### 3. Positioning Section — Text typing/word-by-word reveal
- Animate "Detect. Analyze. Respond. Recover." word-by-word with staggered delays, creating a dramatic build-up before "In Real Time." drops in bold red

### 4. 5 Modules — Connected timeline with progress animation
- Add a vertical progress line on the left (desktop) that fills downward as the user scrolls through modules
- Each module card gets a left-side colored dot connected to the line, lighting up as it enters view
- On hover, cards expand slightly with an elevated shadow

### 5. Naya Section — Animated voice waveform decoration
- Add a decorative SVG waveform animation behind the "Meet Naya" heading (3-4 animated bars pulsing) to visually communicate "voice AI"
- Cards get a subtle shimmer/shine effect on hover

### 6. User Flow — Animated step-by-step connector
- Replace static connector line with an animated line that draws itself left-to-right as section enters view
- Each numbered circle pulses once when it appears, then settles
- Add brief descriptive text under each step that fades in after the circle

### 7. Platform Highlights — Counter animations for stats
- Animate numeric stats (60s, 122+, 5, 24/7) with the Counter component where applicable
- Cards get a subtle scale-up on scroll-in

### 8. CTA Section — Breathing glow on primary button
- Add a pulsing `box-shadow` glow on the "Book a Demo" button to draw the eye

## Technical Details

### File: `src/pages/Launch.tsx` (full rewrite of the component)
- Add `StaggerText` component — splits text into words/letters, animates each with `staggerChildren`
- Add `GlowLogo` component — wrapper with animated shadow + rotating border gradient
- Add `ProgressTimeline` component — vertical scroll-linked progress bar for the modules section
- Add `AnimatedConnector` component — horizontal SVG line that draws on scroll for user flow
- Add `WaveformDecor` component — small animated bars for the Naya section
- Enhance `Reveal` to support `once: false` variant for re-triggering (optional, for presenter re-scrolling)

### No new dependencies needed
- All animations use framer-motion (already installed) and CSS keyframes
- No new packages required

### Files modified
- `src/pages/Launch.tsx` — major enhancement with new sub-components and animation logic

