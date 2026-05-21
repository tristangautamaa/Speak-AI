# SPEAK — Sprint Log

## Sprint 0 — Foundation (Complete)

**Goal:** Get a working end-to-end coaching loop running in the browser with no external dependencies.

### Completed

- [x] Project monorepo structure: `frontend/` (Next.js) + `backend/` (FastAPI stub)
- [x] Next.js App Router setup with TypeScript and Tailwind CSS
- [x] Landing page (`/`)
- [x] Conversation practice screen (`/conversation`)
- [x] `useSpeechRecognition` hook — wraps Web Speech API with auto-restart on silence
- [x] `useMicrophone` hook — microphone permission and stream management
- [x] `coachResponses.ts` — rule-based coach reply generator (filler detection, length-based branching)
- [x] `scoring.ts` — pure scoring functions: confidence, tempo, clarity, filler count
- [x] `useScoring` hook — wires scoring to Zustand on transcript changes
- [x] `conversationStore.ts` — Zustand global state for transcript, metrics, mic/socket status
- [x] `ConversationScreen` — main orchestrator component
- [x] `TranscriptPanel` — scrolling transcript display
- [x] `MetricsPanel` — live metric bars
- [x] `MicButton` — start/stop with mic state visualization
- [x] `Navbar` — top navigation bar
- [x] `socket.ts` — WebSocket service stub (not yet connected)
- [x] Git repository initialized

---

## Sprint 1 — Coaching Loop & Summary (Complete)

**Goal:** Improve the coaching feel so a user completes a session and notices real improvement.

### Completed

- [x] Session summary screen (`/summary`) — score ring, metric breakdown, insight cards
- [x] `SessionSummary` component — overall score, per-metric rows, strength/improvement cards, suggested exercise
- [x] Session history persisted to `localStorage` via `sessionHistory.ts`
- [x] Follow-up retry prompts — coach suggests re-attempt; "Try again" button in transcript
- [x] `addRetryPrompt` in Zustand store

---

## Sprint 2 — AI Coaching & Progress (Complete)

**Goal:** Replace rule-based coaching with OpenAI-powered responses and give users a view of their progress over time.

### Completed

- [x] FastAPI backend (`backend/main.py`) — `/coach/respond` and `/coach/session-review` endpoints
- [x] OpenAI `gpt-4o-mini` coach responses — structured JSON output with `coachResponse`, `practiceAgain`, `focusArea`, `nextPrompt`
- [x] Scenario system (`scenarios.ts`) — 4 practice scenarios: HR Manager, Teacher, Colleague, Businessperson
- [x] `ScenarioPicker` component — shown before conversation starts; selects persona and coaching focus
- [x] Scenario-specific coaching prompts — per-scenario system instructions in `main.py`
- [x] Follow-up prompts from AI — `nextPrompt` field appended to coach response in transcript
- [x] AI session review — `/coach/session-review` endpoint; `SessionSummary` shows AI-generated summary, strength, improvement, next exercise
- [x] Session review loading skeleton — animated placeholder while review loads
- [x] Static fallback — if AI review is unavailable, rule-based strength/improvement cards shown
- [x] Coach response source indicator — dev-only label shows "OpenAI" or "Local fallback"
- [x] Progress dashboard (`/progress`) — `ProgressDashboard` component with score trend, averages, session list

---

## Sprint 3 — Stabilization (Complete)

**Goal:** Improve reliability and developer clarity without adding new features.

### Completed

- [x] TypeScript: zero type errors across all frontend files (confirmed clean at end of sprint)
- [x] `backend/.env` confirmed not tracked by git; gitignore covers all `.env*` patterns
- [x] Dead code removed: `entries` alias in `TranscriptPanel`
- [x] `reset()` in `conversationStore` now clears all session state (`selectedScenario`, `sessionReview`, `sessionReviewLoading`) — previously these had to be cleared manually in ConversationScreen's mount effect
- [x] `saveSession()` in `sessionHistory.ts` now has try/catch — prevents uncaught crash on localStorage quota exceeded
- [x] `getOrCreateAnonymousUserId()` and `getAnonymousUserId()` in `localUser.ts` now have try/catch — prevents crash in Safari private mode or restricted environments
- [x] ConversationScreen mount effect simplified: single `reset()` call handles all state clearing
- [x] CLAUDE.md updated to reflect Sprint 3 architecture (Practice Again, Attempt Comparison, anonymous user, session replay, feedback widget)
- [x] SPRINT_LOG.md updated

---

## Future Sprints (Backlog)

- **Sprint 4:** Deepgram integration for server-side transcription
- **Sprint 5:** ElevenLabs voice output for coach
- **Sprint 6:** User accounts, session history sync, cross-device progress
- **Sprint 7:** Onboarding flow, expanded scenario library
