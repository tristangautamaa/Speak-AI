@AGENTS.md

# SPEAK — Claude Code Project Context

## What is SPEAK?

SPEAK is a web-only laptop MVP for an AI communication coach. It helps users speak with calm confidence through real-time conversation practice, speech transcription, coaching, and scoring.

## Monorepo Structure

```
speak/
├── frontend/          # Next.js app — the entire user-facing product
│   └── src/
│       ├── app/                  # Next.js App Router pages
│       │   ├── page.tsx          # Landing page
│       │   └── conversation/     # Main practice screen
│       ├── components/           # UI components
│       ├── hooks/                # useSpeechRecognition, useMicrophone, useScoring
│       ├── lib/                  # scoring.ts, coachResponses.ts (pure logic)
│       ├── services/             # socket.ts (WebSocket, currently unused)
│       └── store/                # Zustand: conversationStore.ts
├── backend/           # FastAPI Python server (stub — not yet connected)
│   └── venv/          # GENERATED — do not edit
├── docs/              # Project documentation
├── CLAUDE.md          # This file
├── AGENTS.md          # Agent coding rules
└── README.md          # Human setup guide
```

## Current Working State (Sprint 0 complete)

The app runs fully on the frontend alone. Open `/conversation` to:
- Click mic → browser speech recognition starts (`useSpeechRecognition`)
- Spoken words are transcribed live in the transcript panel
- On final speech segments, a rule-based coach reply is generated (`coachResponses.ts`)
- Metrics (confidence, tempo, clarity, fillers) update in real time (`scoring.ts`)

**What does NOT work yet:**
- Backend is not connected — WebSocket in `services/socket.ts` is a stub
- No OpenAI / Claude API calls — coach replies are local rule-based only
- No Deepgram or ElevenLabs — no server-side transcription or voice output
- No database, auth, or payments

## Run Commands

```bash
# Frontend only (sufficient to use the app)
cd frontend
npm run dev
# → http://localhost:3000

# Backend (not needed for current MVP)
cd backend
venv\Scripts\activate        # Windows
uvicorn main:app --reload
# → http://127.0.0.1:8000
```

## Key File Reference

| File | Purpose |
|---|---|
| `frontend/src/lib/scoring.ts` | Pure scoring logic: confidence, tempo, clarity, fillers |
| `frontend/src/lib/coachResponses.ts` | Rule-based coach reply generator |
| `frontend/src/hooks/useSpeechRecognition.ts` | Web Speech API wrapper (Chrome) |
| `frontend/src/hooks/useMicrophone.ts` | Mic permission + stream management |
| `frontend/src/hooks/useScoring.ts` | Wires scoring.ts to Zustand store |
| `frontend/src/store/conversationStore.ts` | Zustand global state |
| `frontend/src/services/socket.ts` | WebSocket stub — not yet active |

## Hard Constraints — Read Before Coding

- **Do NOT** train or fine-tune any AI model.
- **Do NOT** add mobile support — laptop web only.
- **Do NOT** integrate OpenAI/Claude API until the local voice loop is fully stable.
- **Do NOT** modify backend code unless the user explicitly asks for backend work.
- **Do NOT** place application code inside `backend/venv/`.
- Treat `backend/venv/` and `frontend/node_modules/` as generated folders — never edit them.
- **Do NOT** read the Next.js docs guide from training data — read `frontend/node_modules/next/dist/docs/` instead (breaking changes).
- **Do NOT** add features beyond what the user requests. No speculative abstractions.
- **Do NOT** add comments that describe what code does — only add comments when WHY is non-obvious.

## Current Priority

The current priority is **closing the product loop** — making a user feel coached after a practice session. Infrastructure perfection, scalability, and DevOps are not priorities for this phase.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand
- **State**: Zustand (`conversationStore`)
- **Speech**: Web Speech API (browser-native, Chrome only)
- **Backend**: FastAPI + Python (stub, not yet active)
- **Planned (future)**: Deepgram (transcription), ElevenLabs (TTS), OpenAI / Claude API (coaching)
