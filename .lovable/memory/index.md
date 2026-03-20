# Memory: index.md
Updated: now

Crisis X platform - dark-mode-first Bloomberg Terminal aesthetic, JetBrains Mono font, sharp geometric components

## Design System
- Dark obsidian bg (222 47% 4%), Ice White fg, Crisis Red primary (0 85% 55%)
- Fonts: system sans + JetBrains Mono for data/labels
- All numeric data uses tabular-nums + font-mono
- Custom tokens: crisis-red, crisis-amber, crisis-green, crisis-blue, crisis-purple
- Risk levels: critical/high/medium/low with color-coded badges
- No rounded bubbles — sharp sm radius (0.25rem)
- Global risk bar at top of every page (1px, color-coded)

## Architecture
- 5 modules: SIGNAL, SENSE, STRATEGIZE, SPEAK, STABILIZE
- Pages: Dashboard(/), Signals, War Room, Analytics, Reports, Settings
- Dark mode forced via .dark wrapper in App.tsx
- AI advisor: **Naya** (not CX) — modern African professional woman persona
- Chat table: `naya_chat_messages` (renamed from cx_chat_messages)
- Avatar: `src/assets/naya-avatar.png`

## Pending
- Real-time data subscriptions
- Email notifications for demo requests (needs domain setup)
