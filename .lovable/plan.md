
# Add Crisis-X Logo Platform-Wide

## Changes

### 1. Copy logo to project
- Copy `user-uploads://Crisis-X_Logo.jpeg` to `public/images/crisis-x-logo.jpeg` (for favicon/HTML use)
- Also copy to `src/assets/crisis-x-logo.jpeg` (for React component imports)

### 2. Update `index.html`
- Set favicon to the Crisis-X logo
- Update title to "Crisis-X" and meta tags (og:title, description, etc.)

### 3. Update `src/pages/Auth.tsx`
- Replace the Shield icon + text logo with an `<img>` tag importing the logo from `@/assets/crisis-x-logo.jpeg`
- Size appropriately for the auth card header

### 4. Update `src/components/AppSidebar.tsx`
- Replace Shield icon in sidebar header with the Crisis-X logo image
- Show smaller version when collapsed, larger when expanded

### 5. Update `src/components/TopBar.tsx` (optional)
- No logo currently shown in top bar — keep as-is unless branding needed there

### Files Changed
- `public/images/crisis-x-logo.jpeg` (new — copied asset)
- `src/assets/crisis-x-logo.jpeg` (new — copied asset)
- `index.html` — favicon + meta tags
- `src/pages/Auth.tsx` — logo on login page
- `src/components/AppSidebar.tsx` — logo in sidebar
