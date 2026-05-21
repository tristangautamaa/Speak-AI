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
│       ├── services/      # coachApi.ts (backend), socket.ts (stub)
│       └── store/         # Zustand global state
├── backend/           # FastAPI Python server
├── docs/              # Architecture, scoring, sprint log, product brief
├── CLAUDE.md          # AI coding agent context
├── AGENTS.md          # AI coding agent rules
└── README.md          # This file
```

## Requirements

- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- Chrome browser (Web Speech API required)
- OpenAI API key

## Setup

### Backend environment

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env         # macOS/Linux
```

Open `backend/.env` and replace `your_api_key_here` with your actual OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

## Running the App

### Backend (required for AI coaching)

```bash
cd backend
venv\Scripts\activate          # Windows
# source venv/bin/activate      # macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

API available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Frontend

```bash
cd frontend
npm install       # first time only
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in Chrome.

> **Note:** The frontend falls back to local rule-based coach replies if the backend is unreachable.

## Using the App

1. Navigate to `/conversation`
2. Click the mic button to start a session
3. Speak naturally — your words are transcribed live
4. Aria (the AI coach) responds with feedback after each turn
5. Watch your metrics update in real time: confidence, tempo, clarity, fillers

## Current Features

- Live browser speech-to-text (Web Speech API, Chrome only)
- Real-time transcript display
- AI coaching replies via OpenAI (with local rule-based fallback)
- Communication metrics: confidence, tempo, clarity, filler word count
- Session summary with overall score, strengths, and suggested exercises

## Not Yet Implemented

- Server-side transcription (Deepgram)
- AI voice output (ElevenLabs)
- User accounts, sessions, or progress history
- Database or backend persistence
- Mobile support (laptop web only)

## Docs

- [Product Brief](docs/PRODUCT_BRIEF.md)
- [Technical Architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Scoring Framework](docs/SCORING_FRAMEWORK.md)
- [Sprint Log](docs/SPRINT_LOG.md)
