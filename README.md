# SPEAK — AI Communication Coach

SPEAK is a web-only laptop MVP that helps users speak with calm confidence. Users practice speaking, get live transcription, receive AI coaching feedback, and track communication metrics.

## Project Structure

```
speak/
├── frontend/          # Next.js web app (the product)
│   └── src/
│       ├── app/           # Pages: / (landing), /conversation (practice)
│       ├── components/    # UI: Navbar, ConversationScreen, MetricsPanel, etc.
│       ├── hooks/         # Speech recognition, microphone, scoring
│       ├── lib/           # Pure logic: scoring.ts, coachResponses.ts
│       ├── services/      # WebSocket client (stub)
│       └── store/         # Zustand global state
├── backend/           # FastAPI Python server (not yet connected)
├── docs/              # Architecture, scoring, sprint log, product brief
├── CLAUDE.md          # AI coding agent context
├── AGENTS.md          # AI coding agent rules
└── README.md          # This file
```

## Requirements

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend, optional for current MVP)
- Chrome browser (Web Speech API required)

## Running the App

### Frontend (required)

```bash
cd frontend
npm install       # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome.

### Backend (optional — not yet connected)

```bash
cd backend
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
uvicorn main:app --reload
```

API available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Using the App

1. Navigate to `/conversation`
2. Click the mic button to start a session
3. Speak naturally — your words are transcribed live
4. The AI coach responds with feedback after each turn
5. Watch your metrics update in real time: confidence, tempo, clarity, fillers

## Current Features

- Live browser speech-to-text (Web Speech API, Chrome only)
- Real-time transcript display
- Rule-based coach response after each speaking turn
- Communication metrics: confidence, tempo, clarity, filler word count

## Not Yet Implemented

- Server-side transcription (Deepgram)
- AI voice output (ElevenLabs)
- LLM coaching replies (OpenAI / Claude API)
- User accounts, sessions, or progress history
- Database or backend persistence
- Mobile support (laptop web only)

## Docs

- [Product Brief](docs/PRODUCT_BRIEF.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Scoring Framework](docs/SCORING_FRAMEWORK.md)
- [Sprint Log](docs/SPRINT_LOG.md)
