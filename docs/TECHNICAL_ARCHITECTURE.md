# SPEAK — Technical Architecture

## Anonymous Local User System

SPEAK has no authentication. Every browser that opens the app is treated as an anonymous user identified by a UUID stored in `localStorage`.

### Anonymous User ID

`frontend/src/lib/localUser.ts` manages the anonymous identity:

- `getOrCreateAnonymousUserId()` — reads `speak_anonymous_user_id` from `localStorage`; generates and stores a new UUID if absent.
- `getAnonymousUserId()` — reads the key without creating one (returns `null` if unset).

The ID is generated once per browser profile and persists across refreshes. It is not tied to a real account.

### Session and Attempt IDs

`frontend/src/lib/sessionIds.ts` provides two ID generators:

- `createSessionId()` — prefixed `sess_<uuid>`, generated when a scenario is selected.
- `createAttemptId()` — prefixed `att_<uuid>`, reserved for future per-utterance tracking.

`sessionId` is generated client-side at session start (not at save time), making it a stable idempotency key for future backend writes.

### Session Records

`frontend/src/lib/sessionHistory.ts` defines `SessionRecord`. Key fields stored in `localStorage` under `speak_session_history`:

| Field | Source |
|---|---|
| `id` | Generated at save time (localStorage record key) |
| `sessionId` | Generated when scenario selected (`createSessionId`) |
| `userId` | Anonymous user ID from `localUser.ts` |
| `createdAt` / `dateTime` | ISO timestamp at session end |
| `overall`, `confidence`, `tempo`, `fillers`, `clarity` | Computed from `scoring.ts` |
| `totalWords` | Word count across user transcript entries |
| `scenarioId`, `scenarioTitle` | From selected scenario |
| `transcriptPreview` | First 3 user utterances |

### Attempt Records (type only — not yet persisted)

`AttemptRecord` in `sessionHistory.ts` defines the intended shape for per-utterance tracking. Each attempt maps to one user speech turn: local metrics + AI analysis at that moment. No storage or retrieval is implemented yet — the type exists to make future work straightforward.

### Migration Path to Real Auth + Database

When user accounts are added:

1. **Replace anonymous ID** — integrate an auth provider (Clerk, Supabase Auth, etc.). Replace `getOrCreateAnonymousUserId()` with the provider's `userId`. The `userId` field already exists on `SessionRecord` and `AttemptRecord` — no schema changes needed.
2. **Migrate localStorage to backend** — add `POST /sessions` and `GET /sessions` endpoints. Replace `saveSession` / `loadSessions` with API calls. Use `sessionId` as a deduplication key to merge existing local sessions on first login.
3. **Implement attempt tracking** — wire `createAttemptId()` into `useMicrophone.ts` (one per final transcript result). Add `saveAttempt(record: AttemptRecord)` backed by a database table. Enables per-turn analysis, retry comparisons, and longitudinal improvement tracking.

---

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
