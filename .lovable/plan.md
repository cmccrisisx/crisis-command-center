

# Generate African Lady Avatar for CX

## What Changes

Use Lovable AI image generation to create a beautiful African lady avatar, then replace the current `cx-avatar.png` with the generated image.

## Implementation

1. **Create a one-time edge function** (`generate-avatar`) that calls the AI image generation model (`google/gemini-3-pro-image-preview`) with a prompt like: *"Professional portrait of a beautiful African woman, warm confident expression, soft studio lighting, dark background, suitable as a chat assistant avatar, high quality, photorealistic"*

2. **Run the edge function once** to generate the image, then save the base64 result as `src/assets/cx-avatar.png`

3. **No changes needed to `CrisisChat.tsx`** — it already imports and uses `cx-avatar.png`

Alternatively (simpler and faster): since we just need a static asset, I'll write a small script via the edge function to generate the image and store it directly. The existing component code stays untouched.

