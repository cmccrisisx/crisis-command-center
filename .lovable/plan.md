

# Increase Crisis-X Logo Size

The logo is currently rendering but too small to read. Increase sizes across all three locations.

## Changes

### 1. `src/pages/Auth.tsx` (line 62)
- Change logo from `h-16` to `h-24` for better visibility on the login card

### 2. `src/components/AppSidebar.tsx` (lines 51)
- Change collapsed size from `h-7` to `h-8`
- Change expanded size from `h-9` to `h-14`

### 3. `index.html`
- Already references `/images/crisis-x-logo.jpeg` as favicon — no change needed (favicon is inherently small, browser tab sized)

