

# Enhance CX — Youth-Friendly Character + Reputation Expert + Interactivity

## What Changes

### 1. Revamp CX System Prompt (crisis-chat edge function)
Rewrite the `SYSTEM_PROMPT` to give CX a distinct, youth-friendly personality:
- Gen-Z/millennial-aware tone — uses casual language, relatable analogies, occasional slang
- Still authoritative on reputation management — knows brand perception, cancel culture dynamics, influencer crises, social media pile-ons
- Deep expertise: reputation scoring, trust recovery timelines, stakeholder mapping, narrative counter-strategies
- Proactively offers frameworks (e.g., "here's a 3-step playbook") instead of just answering
- References real-world crisis patterns (without naming specific companies unless asked)

### 2. Enhanced Chat UI (CrisisChat.tsx)
Make the chat more interactive and engaging:
- **Quick action chips** below messages — contextual follow-up buttons (e.g., after a reputation analysis, show "Draft a response", "Run scenario sim", "Deep dive on sentiment")
- **Typing indicator** with personality ("CX is cooking..." instead of dots)
- **Welcome screen** refresh — more engaging intro with personality, 5-6 quick-start prompts organized by category (Reputation, Strategy, Drafting, Analysis)
- **Message reactions** — thumbs up/down on assistant messages for feedback
- **Expand chat to full width** toggle for longer conversations

### 3. Expanded CX Capabilities via System Prompt
Add explicit expertise areas to the system prompt:
- **Reputation scoring** — can estimate brand health scores and trust index
- **Cancel culture playbook** — understands social media dynamics, pile-on patterns
- **Stakeholder prioritization** — can rank which audiences to address first
- **Response timing** — knows when to speak vs. stay silent
- **Platform-specific advice** — tailored guidance for Twitter/X, LinkedIn, TikTok, Instagram, press
- **Recovery roadmaps** — multi-week reputation repair plans

### 4. Context-Aware Suggestions
After each assistant message, parse the response type and show relevant follow-up action chips. These chips auto-populate the input with smart prompts so the user doesn't have to think about what to ask next.

## Files Modified

| File | Change |
|------|--------|
| `supabase/functions/crisis-chat/index.ts` | Rewrite system prompt with enhanced personality + expertise |
| `src/components/CrisisChat.tsx` | Add quick actions, better welcome screen, reactions, expand toggle, personality in loading state |

## Technical Notes
- No database changes needed — all changes are in the edge function prompt and frontend UI
- Quick action chips will call the existing `send()` function with pre-written prompts
- Reactions are local-only (no persistence) — visual feedback for UX

