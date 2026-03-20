

# Update Naya Agent ID and Enable Voice Conversation

## What's needed
Replace the placeholder agent ID in `src/hooks/useNayaConversation.ts` with the real agent ID `agent_7001km67j3myeeprr67m00wjsm2c`.

Since this is a public agent (no auth required based on the provided integration examples), we can connect directly with the agent ID instead of going through the token endpoint — simpler and fewer failure points.

## Changes

### 1. Update `src/hooks/useNayaConversation.ts`
- Replace `PLACEHOLDER_AGENT_ID` with `agent_7001km67j3myeeprr67m00wjsm2c`
- Simplify `startConversation` to use direct `agentId` connection (public agent) instead of fetching a token from the edge function — this removes a network hop and potential failure point
- Keep the token-based flow as a commented fallback in case auth is enabled later

### 2. No other file changes needed
- VoiceMode.tsx, CrisisChat.tsx, and the edge function remain as-is
- The `naya-voice-token` edge function stays deployed for future use if the agent is switched to authenticated mode

