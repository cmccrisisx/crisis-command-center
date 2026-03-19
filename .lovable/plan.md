

# Public Landing Page + Split-Screen Auth

## Overview
Create a public marketing landing page at `/` for unauthenticated users and redesign the auth page with a split-screen layout — auth form on one side, visually striking Crisis-X branded creative on the other.

## 1. New Public Landing Page (`src/pages/Landing.tsx`)
A dark, cinematic single-page marketing site with these sections:

- **Hero**: Full-width with Crisis-X logo, tagline ("Crisis Intelligence. Instant Clarity."), animated risk bar accent, and CTA buttons (Sign In / Get Started)
- **Features grid**: 5 module cards (Signal, Sense, Strategize, Speak, Stabilize) with icons and brief descriptions
- **Social proof / stats strip**: Animated counters — "Real-time signals", "AI-powered response", "Multi-channel coordination"
- **Final CTA**: "Take control of your next crisis" with sign-up button
- Uses existing design tokens (crisis-red, dark obsidian bg, JetBrains Mono)

## 2. Split-Screen Auth Page (`src/pages/Auth.tsx`)
Redesign into a two-column layout (stacks on mobile):

- **Left panel (branding)**: Dark gradient background with large Crisis-X logo, animated subtle grid/pulse effect, tagline text, and decorative risk-level color bars
- **Right panel (form)**: Current auth form (sign in / sign up) polished and centered
- On mobile (`< md`): branding panel becomes a compact header above the form

## 3. Routing Update (`src/App.tsx`)
- `/` route → shows `Landing` for unauthenticated users, `Index` (dashboard) for authenticated users
- `/auth` → split-screen auth page
- All other protected routes stay the same

### Technical approach
- Create a new `LandingOrDashboard` wrapper component that checks auth state and renders accordingly
- No new dependencies needed — pure Tailwind + existing design system
- Landing page is fully public (no `ProtectedRoute` wrapper)

### Files
- **New**: `src/pages/Landing.tsx`
- **Modified**: `src/pages/Auth.tsx` (split-screen redesign), `src/App.tsx` (routing)

