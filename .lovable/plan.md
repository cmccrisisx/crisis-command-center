

# Crisis-X Launch Pitch — Both PPTX + Web Page

## Deliverables

### 1. PowerPoint Deck (.pptx) — 12-14 slides
A premium, dark-themed slide deck matching the Crisis-X aesthetic (dark obsidian background, Crisis Red accents, JetBrains Mono font feel). For the Wednesday stage presentation.

**Slide outline:**
1. **Title Slide** — "Crisis-X: Africa's First AI-Powered Crisis Intelligence Engine" | CMC Connect LLP | Launch Date
2. **The Problem** — Crises move faster than teams can respond. Stats on reputation damage speed, social media amplification
3. **Introducing Crisis-X** — One-line positioning: "Detect. Analyze. Respond. Recover. In real time."
4. **The 5-Module Architecture** — Visual diagram: SIGNAL → SENSE → STRATEGIZE → SPEAK → STABILIZE with color-coded icons
5. **SIGNAL: Detect** — Multi-source ingestion, AI filtering, influencer detection
6. **SENSE: Analyze** — Narrative clustering, sentiment analysis, reputation scoring
7. **STRATEGIZE: Plan** — War Room, scenario modeling, AI-generated holding statements
8. **SPEAK: Respond** — Multi-channel publishing, approval workflows, audit trail
9. **STABILIZE: Recover** — Reputation monitoring, media reach, post-crisis reporting
10. **Meet Naya** — AI Crisis Advisor with real-time voice conversation (ElevenLabs), chat, scenario analysis
11. **User Flow** — 5-step visual journey from signal detection to reputation recovery
12. **Industry Use Cases** — 6 sectors: Corporate, Government, Telecoms, Oil & Gas, Healthcare, Aviation
13. **Platform Highlights** — Key stats (< 60s detection, real-time AI, RBAC, PWA, PDF export)
14. **Call to Action** — Book a demo, get started, contact CMC Connect LLP

### 2. Interactive Web Launch Page (`/launch`)
A new route in the app — a cinematic, scroll-driven page designed for sharing online post-event.

**Sections:**
- Hero with animated logo reveal + launch announcement
- Problem statement with animated counters
- 5-module showcase with hover/scroll animations
- Naya AI advisor spotlight
- User flow timeline (interactive)
- Industry use cases grid
- CTA: Book Demo + Get Started buttons

## Technical Details

### PPTX Generation
- Use `pptxgenjs` via `lov-exec` script
- Dark theme: background `#0A0B0F`, text white/ice, accents Crisis Red `#E02D3C`
- Color palette per module: red (Signal), purple (Sense), amber (Strategize), blue (Speak), green (Stabilize)
- Embed the Crisis-X logo from `src/assets/crisis-x-logo.jpeg`
- Output to `/mnt/documents/crisis-x-launch-pitch.pptx`
- QA via LibreOffice → PDF → image inspection

### Web Launch Page
- New file: `src/pages/Launch.tsx`
- Route: `/launch` (public, no auth required)
- Uses framer-motion for scroll animations
- Reuses existing design tokens and Crisis-X branding
- Mobile responsive from the start
- Links to `/auth?signup=true` and `/about#book-demo`

### Route Update
- `src/App.tsx` — add `/launch` route

## Files Created/Modified
- `/mnt/documents/crisis-x-launch-pitch.pptx` — downloadable slide deck
- `src/pages/Launch.tsx` — interactive web launch page
- `src/App.tsx` — add route

