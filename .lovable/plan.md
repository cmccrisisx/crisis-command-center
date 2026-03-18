

## Fix: Button Text Invisible on Stabilize Page

### Problem
The "Generate Post-Crisis Report" button (line 80) uses `variant="outline"` which inherits border/text colors that blend into the dark background, making the text invisible.

### Changes

**`src/pages/Stabilize.tsx` (line 80)**
- Add `text-foreground` class to the Button to force visible text color against the dark background.

