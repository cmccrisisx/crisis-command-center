

# Add Voice to Naya — Nigerian Female Voice with Igbo Accent

## Overview
Give Naya a voice using ElevenLabs Text-to-Speech and Conversational AI. Users can listen to Naya's responses or have a real-time voice conversation — making Crisis X a truly immersive advisory experience.

## Voice Setup

### ElevenLabs Voice Selection
ElevenLabs' Voice Library has diverse voices. The best approach:
1. **Voice Library search** — find a Nigerian female voice with Igbo-accented English (ElevenLabs has community-cloned voices from African creators)
2. **Fallback** — use a close pre-built voice and note that a custom voice clone can be uploaded later for a perfect Igbo accent match

You'll need to pick your preferred voice from [ElevenLabs Voice Library](https://elevenlabs.io/voice-library) — or we can start with a default and swap later.

## Implementation Steps

### 1. Connect ElevenLabs to project
Link the existing ElevenLabs connection (already in workspace) to this project so `ELEVENLABS_API_KEY` is available in edge functions.

### 2. Create TTS edge function — `supabase/functions/naya-tts/index.ts`
- Accepts `{ text, voiceId }` from the client
- Calls ElevenLabs TTS API (`eleven_turbo_v2_5` for low latency streaming)
- Returns audio stream for instant playback
- Uses the selected Nigerian female voice ID

### 3. Create voice conversation token endpoint — `supabase/functions/naya-voice-token/index.ts`
- Generates a single-use conversation token for ElevenLabs Conversational AI
- Uses an ElevenLabs Agent configured with Naya's personality and crisis expertise
- Returns token to client for WebRTC voice session

### 4. Add "Read Aloud" button to chat messages — `src/components/CrisisChat.tsx`
- Add a speaker icon on each assistant message
- Clicking it streams TTS audio of that response
- Shows a small audio progress indicator while playing
- Stop button to cancel playback

### 5. Add Voice Chat mode — `src/components/CrisisChat.tsx`
- Add a microphone button next to the text input
- Clicking it opens a voice conversation session using `@elevenlabs/react` `useConversation` hook
- Shows speaking/listening state with a visual indicator
- Users can talk to Naya and hear her respond in real-time

### 6. Install dependency
- Add `@elevenlabs/react` package for the conversation hook

## Technical Notes
- **Voice ID**: Will need to be configured — either from Voice Library or a custom clone. Can be stored as a constant in the TTS edge function.
- **ElevenLabs Agent**: For full voice conversation, an Agent needs to be created in the ElevenLabs dashboard with Naya's system prompt. Alternatively, we can use overrides to inject the prompt dynamically.
- **TTS model**: `eleven_turbo_v2_5` for streaming (lowest latency), `eleven_multilingual_v2` for highest quality
- **Cost**: TTS is per-character; voice conversations are per-minute. Both are reasonable for advisory use.

## Files Created/Modified
- `supabase/functions/naya-tts/index.ts` — new TTS edge function
- `supabase/functions/naya-voice-token/index.ts` — new conversation token endpoint
- `src/components/CrisisChat.tsx` — add Read Aloud + Voice Chat buttons
- `src/hooks/useNayaVoice.ts` — new hook for TTS playback and voice conversation state
- `package.json` — add `@elevenlabs/react`

