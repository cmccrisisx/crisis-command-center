

# Add Real-Time Voice Conversation Mode to Naya

## Overview
Add a microphone button to the chat input area that lets users have a live voice conversation with Naya using ElevenLabs Conversational AI WebRTC. Users tap the mic, grant permission, and speak — Naya responds with her Nigerian-accented voice in real-time.

## Prerequisite: ElevenLabs Agent
An ElevenLabs Conversational AI Agent must be created in the ElevenLabs dashboard with Naya's crisis advisor personality and the selected Nigerian female voice. The agent ID will be stored as a constant. Since we cannot create agents via API without additional setup, we'll use a configurable agent ID constant that you can update after creating the agent in ElevenLabs.

## Implementation

### 1. Create `useNayaConversation` hook
New file: `src/hooks/useNayaConversation.ts`
- Uses `useConversation` from `@elevenlabs/react` (already installed)
- Fetches a WebRTC token from the existing `naya-voice-token` edge function
- Manages connection state: `idle` → `connecting` → `connected` → `speaking`/`listening`
- Handles microphone permission request with user-friendly error toast
- Exposes: `startConversation()`, `endConversation()`, `status`, `isSpeaking`
- Includes `onMessage` handler to show live transcripts in the chat

### 2. Update `naya-voice-token` edge function
The edge function already accepts `agentId` and returns a token — no changes needed. It works as-is for the Conversational AI flow.

### 3. Add voice conversation UI to `CrisisChat.tsx`
- Add a `Mic` icon button next to the Send button in the input area
- When tapped: requests mic permission → fetches token → starts WebRTC session
- During conversation, show a visual indicator:
  - Pulsing red ring around mic when connected
  - "Naya is speaking..." / "Listening..." status text
  - Waveform-style animation (simple CSS pulse)
- Replace the input area with a "voice mode" overlay showing:
  - Large animated mic icon with status
  - "End Conversation" button
  - Live transcript of what user said and Naya's responses
- Pressing End returns to normal chat mode

### 4. Voice mode state in chat panel
- New state: `voiceMode: boolean`
- When voice mode is active, the messages area shows a centered voice UI overlay
- Transcripts from the conversation get appended to the chat messages array so they persist after ending voice mode

## Files Created/Modified
- `src/hooks/useNayaConversation.ts` — new hook wrapping ElevenLabs `useConversation`
- `src/components/CrisisChat.tsx` — add mic button, voice mode UI overlay, transcript display
- No edge function changes needed
- No database changes needed

## Agent ID Configuration
The agent ID will be stored as a constant in `useNayaConversation.ts`. You'll need to:
1. Go to [ElevenLabs Agents](https://elevenlabs.io/app/conversational-ai) 
2. Create an agent with Naya's personality prompt and the selected voice
3. Copy the agent ID and we'll configure it in the code

Alternatively, we can prompt for the agent ID or store it as a secret. If you don't have an agent set up yet, I can proceed with a placeholder and you can update it later.

