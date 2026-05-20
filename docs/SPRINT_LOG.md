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

### Known Gaps from Sprint 0

- Backend is scaffolded but not connected
- Coach responses are rule-based, not LLM-powered
- No persistence — session resets on refresh
- Chrome-only (Web Speech API limitation)

---

## Sprint 1 — Next Priorities

**Goal:** Improve the coaching feel so a user completes a session and notices real improvement.

### Candidate Tasks

- [ ] Improve `coachResponses.ts` with more varied, scenario-specific responses
- [ ] Add session summary screen after stopping conversation
- [ ] Persist session score to localStorage (no backend needed)
- [ ] Improve `MetricsPanel` visual design — make progress more motivating
- [ ] Add "try again" prompt flow — coach suggests a specific re-attempt
- [ ] Add filler word highlighting in transcript
- [ ] Smooth out UX: loading states, transition animations, error messages

### Not in Sprint 1

- LLM integration (not until local loop is polished)
- Backend WebSocket activation
- Auth or database
- Mobile support

---

## Future Sprints (Backlog)

- **Sprint 2:** Deepgram integration for server-side transcription
- **Sprint 3:** LLM coaching via Claude / OpenAI API
- **Sprint 4:** ElevenLabs voice output for coach
- **Sprint 5:** User accounts, session history, progress over time
- **Sprint 6:** Onboarding flow, scenario library (job interviews, presentations, etc.)
