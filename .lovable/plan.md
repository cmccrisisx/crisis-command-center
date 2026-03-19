

# PWA Manifest & Dynamic Page Titles

## 1. PWA Manifest (`public/manifest.json`)
Create a `manifest.json` with Crisis-X branding:
- `name`: "Crisis-X — Crisis Intelligence Platform"
- `short_name`: "Crisis-X"
- `start_url`: "/"
- `display`: "standalone"
- `background_color`: "#0a0d14"
- `theme_color`: "#0a0d14"
- Icons referencing the existing `/images/crisis-x-logo.jpeg` at 192x192 and 512x512 sizes

## 2. Link Manifest in `index.html`
Add `<link rel="manifest" href="/manifest.json">` in the `<head>`.

## 3. Dynamic Page Titles (`src/hooks/usePageTitle.ts`)
Create a small custom hook that calls `document.title = title` via `useEffect`. Usage: `usePageTitle("Signals")` → sets title to `"Signals — Crisis-X"`.

## 4. Add Hook to Every Page
Call `usePageTitle(pageName)` at the top of each page component:
- `Index.tsx` → "Dashboard — Crisis-X"
- `Signals.tsx` → "Signals — Crisis-X"
- `WarRoom.tsx` → "War Room — Crisis-X"
- `Speak.tsx` → "Speak — Crisis-X"
- `Analytics.tsx` → "Analytics — Crisis-X"
- `Stabilize.tsx` → "Stabilize — Crisis-X"
- `Reports.tsx` → "Reports — Crisis-X"
- `Scenarios.tsx` → "Scenarios — Crisis-X"
- `Settings.tsx` → "Settings — Crisis-X"
- `Auth.tsx` → "Sign In — Crisis-X"
- `NotFound.tsx` → "Not Found — Crisis-X"

### Files
- **New**: `public/manifest.json`, `src/hooks/usePageTitle.ts`
- **Modified**: `index.html` (1 line), all 11 page files (1 line each)

