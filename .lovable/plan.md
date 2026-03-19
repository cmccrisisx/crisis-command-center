

# Replace CX Red Button with African Face Avatar

## What Changes

Replace the red circular chat trigger button with a beautiful African face avatar image. The button will use the uploaded image as an avatar with a subtle glow/ring effect to keep it visually prominent.

## Files Modified

| File | Change |
|------|--------|
| `src/assets/cx-avatar.png` | Copy uploaded image to project |
| `src/components/CrisisChat.tsx` | Replace the red `Button` with an avatar image using the uploaded face, styled with a ring/glow effect. Also add the avatar to the chat header next to "CX" label for consistency. |

## Implementation Details

- Copy `user-uploads://image-10.png` → `src/assets/cx-avatar.png`
- Replace the `<Button>` trigger (lines 91-97) with a clickable avatar: circular image with a subtle primary-colored ring and shadow
- Import the avatar image as an ES6 module
- Add the same avatar as a small icon in the chat panel header next to "CX"
- Keep the tooltip bubble ("Ask CX anything ⚡") as-is

