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
│       │   ├── conversation/     # Main practice screen
│       │   ├── summary/          # Post-session summary
│       │   └── progress/         # Session history and progress
│       ├── components/           # UI components
│       ├── hooks/                # useSpeechRecognition, useMicrophone, useScoring
│       ├── lib/                  # scoring.ts, coachResponses.ts, scenarios.ts, sessionHistory.ts
│       ├── services/             # coachApi.ts, sessionReviewApi.ts, socket.ts (stub)
│       └── store/                # Zustand: conversationStore.ts
├── backend/           # FastAPI Python server — active, serves AI coaching endpoints
│   ├── main.py        # All backend logic: /coach/respond, /coach/session-review, Socket.IO
│   ├── .env           # NEVER commit — contains OPENAI_API_KEY
│   └── venv/          # GENERATED — do not edit
├── docs/              # Project documentation
├── CLAUDE.md          # This file
├── AGENTS.md          # Agent coding rules
└── README.md          # Human setup guide
```

## Current Working State (Sprint 3 complete)

The full coaching loop is working end-to-end. Open `/conversation` to:
- Choose a practice scenario (HR Manager, Teacher, Colleague, Businessperson)
- Click mic → browser speech recognition starts (`useSpeechRecognition`)
- Spoken words are transcribed live in the transcript panel
- On final speech segments, the frontend calls `POST /coach/respond` → backend returns an OpenAI-powered coach reply, structured `AiScores` (confidence, clarity, conciseness, presence), a `practiceAgain` flag, detected issues, rewrite suggestion, and an optional follow-up `nextPrompt`
- If the backend is unavailable, `useMicrophone` falls back to rule-based responses from `coachResponses.ts`
- Metrics (confidence, tempo, clarity, fillers) update in real time (`scoring.ts`)
- "End Session" saves the session to `localStorage` and fires `POST /coach/session-review` for an AI-generated debrief
- `/summary` shows the score, metric breakdown, Aria's review (or static fallback), Improvement Moment card (attempt comparison), session replay, and inline feedback widget
- `/progress` shows score history, averages, and trend across all saved sessions

**Practice Again / Attempt Comparison:**
- When the AI flags a response for retry (`practiceAgain: true`), a "Try again" button appears in the transcript
- Clicking it snapshots the original attempt and waits for the next user utterance
- After the retry, `AttemptComparisonCard` shows a before/after diff (fillers, word count, AI scores) in the right panel
- The comparison is also persisted to the session record and shown in `/summary` as the Improvement Moment card

**Anonymous user architecture:**
- `localUser.ts` — generates and persists a `speak_anonymous_user_id` UUID in localStorage; survives page reloads but stays local
- `sessionIds.ts` — generates `sess_` prefixed session IDs per conversation
- Both IDs are attached to saved session records for future backend sync readiness

**What does NOT work yet:**
- Backend WebSocket is scaffolded but not connected to speech recognition — transcription goes through the browser Web Speech API
- No Deepgram or ElevenLabs — no server-side transcription or voice output
- No database, auth, or payments — sessions persist in `localStorage` only

## Run Commands

```bash
# Frontend only — sufficient if backend is already running
cd frontend
npm run dev
# → http://localhost:3000

# Backend — required for OpenAI coach responses and AI session review
cd backend
venv\Scripts\activate        # Windows
uvicorn main:app --reload
# → http://127.0.0.1:8000
# Requires OPENAI_API_KEY in backend/.env
```

## Key File Reference

| File | Purpose |
|---|---|
| `frontend/src/lib/scoring.ts` | Pure scoring logic: confidence, tempo, clarity, fillers |
| `frontend/src/lib/coachResponses.ts` | Rule-based coach reply generator (fallback when backend down) |
| `frontend/src/lib/scenarios.ts` | Scenario definitions: id, title, persona, openingPrompt, coachingFocus, tone |
| `frontend/src/lib/sessionHistory.ts` | `localStorage` session persistence: `loadSessions`, `saveSession` |
| `frontend/src/hooks/useSpeechRecognition.ts` | Web Speech API wrapper (Chrome only); handles no-speech and auto-restart |
| `frontend/src/hooks/useMicrophone.ts` | Mic permission, coach API call, error/no-speech/fallback handling |
| `frontend/src/hooks/useScoring.ts` | Wires scoring.ts to Zustand store on transcript changes |
| `frontend/src/store/conversationStore.ts` | Zustand global state: transcript, metrics, mic, scenario, session review |
| `frontend/src/services/coachApi.ts` | `requestCoachResponse` — POST /coach/respond |
| `frontend/src/services/sessionReviewApi.ts` | `requestSessionReview` — POST /coach/session-review |
| `frontend/src/lib/localUser.ts` | Anonymous user ID: `getOrCreateAnonymousUserId`, `getAnonymousUserId` |
| `frontend/src/lib/sessionIds.ts` | Session/attempt ID generators: `createSessionId`, `createAttemptId` |
| `frontend/src/components/ConversationScreen.tsx` | Main orchestrator: scenario picker → conversation → end session |
| `frontend/src/components/ScenarioPicker.tsx` | Scenario selection cards shown before conversation starts |
| `frontend/src/components/AttemptComparisonCard.tsx` | Before/after diff card (fillers, words, AI scores) shown in right panel after retry |
| `frontend/src/components/SessionSummary.tsx` | Score ring, metric breakdown, Improvement Moment, AI review (or static fallback), session replay, feedback |
| `frontend/src/components/ProgressDashboard.tsx` | Score trend, averages, session history list |
| `backend/main.py` | FastAPI: /coach/respond (OpenAI), /coach/session-review (OpenAI), Socket.IO stub |

## Hard Constraints — Read Before Coding

- **Do NOT** train or fine-tune any AI model.
- **Do NOT** add mobile support — laptop web only.
- **Do NOT** overbuild — the priority is a working product loop, not infrastructure.
- **Do NOT** modify backend code unless the user explicitly asks for backend work.
- **Do NOT** place application code inside `backend/venv/`.
- Treat `backend/venv/` and `frontend/node_modules/` as generated folders — never edit them.
- **Do NOT** read the Next.js docs guide from training data — read `frontend/node_modules/next/dist/docs/` instead (breaking changes).
- **Do NOT** add features beyond what the user requests. No speculative abstractions.
- **Do NOT** add comments that describe what code does — only add comments when WHY is non-obvious.
- **Do NOT** commit `backend/.env` — it contains `OPENAI_API_KEY`. The root `.gitignore` covers all `.env*` patterns.

## Current Priority

The current priority is **polish and reliability** — the product loop is closed. New work should improve what's already there (error states, loading clarity, UX smoothness) before adding new features.

## Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand
- **State**: Zustand (`conversationStore`)
- **Speech**: Web Speech API (browser-native, Chrome only)
- **Backend**: FastAPI + Python, OpenAI `gpt-4o-mini` via `AsyncOpenAI`
- **Persistence**: `localStorage` (sessions) — no database
- **Planned (future)**: Deepgram (transcription), ElevenLabs (TTS), user accounts
