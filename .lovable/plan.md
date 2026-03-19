

# Landing Page — Hero-Only with AI Image Slider

## Overview
Strip the landing page down to just the **hero section + nav + footer**. Remove the stats section, features/modules section, and final CTA section entirely. The hero becomes the full landing experience — clean, direct, enterprise-grade.

Then enhance the hero with the AI-generated image slider as previously approved.

## What Gets Removed
- **Stats section** (Signal Detection, Channel Coverage, AI Powered — lines ~250-260)
- **Features/Modules section** (Five Integrated Modules grid — lines ~265-320)
- **Final CTA section** ("Take Control of Your Next Crisis" — lines ~325-370)
- All related data arrays (`modules`, `stats`) and the `AnimatedStat` component
- Unused icon imports (`Radio`, `Brain`, `Target`, `Megaphone`, `Shield`, `Zap`, `Globe`, `BarChart3`)

## What Stays
- **Nav bar** (logo + Sign In / Get Started)
- **Hero section** — reworked with AI-generated image slider background:
  - 4 AI-generated images of African creatives/professionals in corporate crisis settings
  - Auto-rotating crossfade (6s interval) with Ken Burns zoom
  - Dark gradient overlay for text readability
  - Slide indicators + progress bar
  - Pause on hover
  - Existing parallax scroll retained
  - Logo, title ("Crisis Intelligence. Instant Clarity."), subtitle, CTA buttons
- **Footer** (copyright + systems operational)

## Steps
1. Generate 4 hero images via AI gateway → `src/assets/hero/`
2. Rewrite `Landing.tsx`: remove stats/features/CTA sections, add image slider to hero
3. Add Ken Burns keyframe + vignette styles to `index.css`
4. Clean up unused imports and data arrays

## Files Modified
- `src/pages/Landing.tsx` — major simplification + image slider
- `src/index.css` — Ken Burns keyframe, vignette class
- `src/assets/hero/` — 4 new AI-generated images

