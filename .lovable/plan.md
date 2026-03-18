

## Problem

The `<div className="dark">` wrapper in `App.tsx` activates dark-mode CSS variables (light foreground text), but **no element sets `bg-background`** on the page content area. The browser's default white background shows through, making the light-colored dark-mode text invisible (light text on white background).

## Fix

**`src/App.tsx`** — Add `bg-background text-foreground min-h-screen` to the `.dark` wrapper div so the dark background actually renders:

```tsx
<div className="dark bg-background text-foreground min-h-screen">
```

This single change ensures the dark background color propagates to the full page, making all text visible. No other files need changes.

