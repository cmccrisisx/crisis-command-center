

# Add Pulse Animation & CTA to CX Avatar Button

## Changes

### 1. Pulse animation on avatar button
Add a CSS `animate-pulse` ring effect behind the avatar — a subtle expanding/fading ring that draws attention without being distracting.

### 2. CTA label below the avatar
I recommend placing a small CTA **below** the avatar rather than above, since the tooltip ("Ask CX anything ⚡") already appears above. The CTA will be a persistent mini label like **"Chat with CX"** that sits just beneath the button — compact, always visible, and inviting.

## File: `src/components/CrisisChat.tsx`

**Avatar button** (line 92-97):
- Wrap with a pulsing ring pseudo-element using `before:` Tailwind classes or a separate `<span>` behind the button that animates
- Add a small text CTA below: `"Chat with CX"` in `text-[10px] font-mono` styling

**Structure:**
```
┌─────────────┐
│  [tooltip]   │  ← existing, shows only when no messages
│   (avatar)   │  ← with pulsing ring behind it
│  "Chat with  │  ← new persistent CTA label
│     CX"      │
└─────────────┘
```

No other files need changes.

