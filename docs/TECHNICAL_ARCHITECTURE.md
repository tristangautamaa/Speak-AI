# SPEAK — Technical Architecture

## Current Architecture (Sprint 0)

All logic runs in the browser. The backend exists but is not connected.

```
Browser (Chrome)
│
├── Next.js App Router
│   ├── / → landing page
│   └── /conversation → practice screen
│
├── React Component Tree
│   ├── ConversationScreen       # main orchestrator
│   ├── Navbar                   # top bar
│   ├── MicButton                # start/stop mic
│   ├── TranscriptPanel          # scrolling transcript
│   └── MetricsPanel             # live metric bars
│
├── Hooks (stateful logic)
│   ├── useSpeechRecognition     # wraps Web Speech API
│   ├── useMicrophone            # mic permission + stream
│   └── useScoring               # runs scoring.ts on transcript changes
│
├── Lib (pure logic, no React)
│   ├── scoring.ts               # scoreTranscript(), normalizeTempo(), normalizeFillers()
│   └── coachResponses.ts        # generateCoachResponse()
│
├── Store (Zustand)
│   └── conversationStore.ts     # status, transcript, metrics, mic/socket state
│
└── Services (stub)
    └── socket.ts                # WebSocket client — not yet connected
```

### Data Flow (current)

```
User speaks
  → Web Speech API fires result events
  → useSpeechRecognition calls onResult(text, isFinal)
  → ConversationScreen: adds transcript entry to store
  → On isFinal: calls generateCoachResponse(text)
  → Adds AI coach entry to transcript
  → useScoring recomputes metrics from transcript
  → MetricsPanel re-renders with new scores
```

### Key Constraints

- **Chrome only** — Web Speech API (`webkitSpeechRecognition`) is not available in Firefox or Safari.
- **Frontend-only** — No server round-trips in the current loop. Sub-100ms response latency.
- **No persistence** — Transcript and metrics reset on page refresh.

---

## Planned Architecture (Future Sprints)

```
Browser (Chrome)
│
├── Next.js frontend (same structure)
│   └── services/socket.ts → active WebSocket to backend
│
Backend (FastAPI)
│
├── WebSocket endpoint
│   ├── Receives audio chunks from browser mic stream
│   ├── Sends to Deepgram for real-time transcription
│   └── Streams transcript back to browser
│
├── Coach endpoint
│   ├── Receives finalized user transcript turn
│   ├── Sends to OpenAI or Claude API with system prompt
│   └── Streams coach response tokens to browser
│
└── TTS endpoint (optional)
    ├── Receives coach text
    ├── Sends to ElevenLabs
    └── Streams audio back to browser
```

### Planned Services

| Service | Purpose | When to add |
|---|---|---|
| Deepgram | Server-side real-time transcription | After local voice loop is stable |
| OpenAI / Claude | LLM coaching replies | After Deepgram is integrated |
| ElevenLabs | Text-to-speech for coach voice | After LLM coaching is working |
| Supabase / Postgres | User sessions, progress history | After core loop is validated |
| NextAuth / Clerk | User authentication | When persistence is needed |

### Upgrade Path: Local → LLM Coach

1. Keep `coachResponses.ts` as fallback
2. Add `services/coach.ts` that calls backend `/coach` endpoint
3. Backend calls Claude API with coaching system prompt
4. Stream tokens to frontend
5. Toggle between local and LLM coach via env var

---

## Stack Summary

| Layer | Technology |
|---|---|
| Frontend framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Speech (current) | Web Speech API (browser) |
| Speech (planned) | Deepgram |
| Backend | FastAPI (Python) |
| AI (planned) | OpenAI / Claude API |
| TTS (planned) | ElevenLabs |
| Database (planned) | Supabase / Postgres |
