

# Replace Crisis-X Logo Platform-Wide

## What's Changing
The uploaded white Crisis-X logo (PNG with transparency) replaces the old JPEG logo everywhere in the platform. The new logo is white text + red X on transparent background — perfect for the dark theme.

## Files to Modify

### Asset
- Copy `user-uploads://white_logo_crisisX.png` → `src/assets/crisis-x-logo.png`
- Also copy to `public/images/crisis-x-logo.png` for PWA manifest

### Import Updates (change `.jpeg` → `.png` in 6 files)
1. **`src/pages/Landing.tsx`** — nav logo + hero logo
2. **`src/pages/Auth.tsx`** — login page logo
3. **`src/pages/About.tsx`** — nav logo
4. **`src/components/AppSidebar.tsx`** — sidebar logo
5. **`src/components/launch/GlowLogo.tsx`** — launch page animated logo

### Styling Adjustments
- Remove `rounded` / `rounded-lg` classes from logo `<img>` tags — the new PNG has transparency, so rounded corners on a box look wrong
- Remove `shadow-2xl shadow-primary/20` where applied — transparent PNGs don't need box shadows
- Keep sizing classes (`h-8`, `h-14`, `h-16`, `h-24`, etc.) as-is

### PWA Manifest (`public/manifest.json`)
- Update icon paths from `.jpeg` to `.png` and type from `image/jpeg` to `image/png`

## No other changes needed
The old `.jpeg` file can remain (no harm), but all references will point to the new `.png`.

