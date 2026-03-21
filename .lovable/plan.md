

# Fix Launch Page Logo — Show Full Logo with Creative Interactivity

## Problem
The GlowLogo component forces the logo into a `w-32 h-32` square with `object-cover`, which clips the wide landscape logo (it contains "Crisis" + red X + subtitle text). The rotating gradient background also overlaps and obscures the logo content.

## Solution

### Rewrite `src/components/launch/GlowLogo.tsx`
- **Remove forced square dimensions** — use `max-w-xs sm:max-w-sm md:max-w-md` with `w-auto h-auto` so the logo displays at its natural aspect ratio, fully visible
- **Remove `object-cover`** — use `object-contain` to ensure nothing is clipped
- **Remove the rotating conic-gradient overlay** — it covers the logo text. Replace with a subtle glow effect that sits *behind* the logo, not on top
- **Keep the pulsing red glow** — position it as a background shadow that frames the logo without overlapping content
- **Add interactive hover effect** — on hover, the logo scales up slightly (1.03) and the glow intensifies, giving a premium interactive feel
- **Add entrance animation** — logo fades in and scales from 0.9 to 1 with a blur-to-clear transition
- **Add a subtle floating animation** — gentle `y: [0, -6, 0]` loop so the logo feels alive on stage

### Styling details
- Container: `inline-block`, no forced width/height, padding for glow space
- Logo `<img>`: `max-w-[280px] sm:max-w-[380px] md:max-w-[440px] h-auto` — responsive, never clipped
- Background glow: `box-shadow` only, positioned on a pseudo-layer behind the image
- No rounded corners cropping — remove `rounded-2xl` from the image, keep it on the glow container only
- Remove `ring-1 ring-white/10` border that doesn't suit a transparent PNG

### File changed
- `src/components/launch/GlowLogo.tsx` — full rewrite

