import os
import json
import socketio
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import AsyncOpenAI

load_dotenv()
_openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- FastAPI app ---
app = FastAPI(title="Speak Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Socket.IO server ---
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

# Wrap FastAPI with Socket.IO ASGI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)


# --- Pydantic models ---

class Metrics(BaseModel):
    confidence: float
    tempo: float
    fillers: float
    clarity: float

class CoachRequest(BaseModel):
    userText: str
    metrics: Metrics

class CoachResponse(BaseModel):
    coachResponse: str
    practiceAgain: bool
    focusArea: str


_SYSTEM_PROMPT = """You are Aria, a friendly AI communication coach in the SPEAK app. Help users speak with calm confidence.

Style rules:
- One or two sentences max. Warm, direct, practical.
- Coach one thing at a time.
- Filler-heavy speech → encourage a cleaner retry.
- Clear confident speech → reinforce and validate.
- Rambling speech (many words) → ask for the core idea in one sentence.
- Never sound academic or robotic.

You receive the user's spoken text and session metrics (confidence 0-100, tempo wpm, fillers count, clarity 0-100).

Respond ONLY with valid JSON:
{
  "coachResponse": "your short coaching message",
  "practiceAgain": true or false,
  "focusArea": "confidence" | "tempo" | "fillers" | "clarity" | "conciseness"
}

Set practiceAgain to true when the user should retry the same idea (too many fillers, too long, etc.).
Set focusArea to the most important area to improve, or "confidence" if delivery was solid."""


# --- HTTP routes ---

@app.get("/")
async def root():
    return {"message": "Speak backend alive"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "speak-backend"}


@app.post("/coach/respond", response_model=CoachResponse)
async def coach_respond(req: CoachRequest) -> CoachResponse:
    user_message = (
        f"User said: \"{req.userText}\"\n"
        f"Metrics — confidence: {req.metrics.confidence:.0f}, "
        f"tempo: {req.metrics.tempo:.0f} wpm, "
        f"fillers: {req.metrics.fillers:.0f}, "
        f"clarity: {req.metrics.clarity:.0f}"
    )
    try:
        completion = await _openai.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )
        data = json.loads(completion.choices[0].message.content or "{}")
        return CoachResponse(
            coachResponse=str(data.get("coachResponse", "Good effort. Keep going.")),
            practiceAgain=bool(data.get("practiceAgain", False)),
            focusArea=str(data.get("focusArea", "confidence")),
        )
    except Exception:
        return CoachResponse(
            coachResponse="Good effort. Take a breath and try again.",
            practiceAgain=False,
            focusArea="confidence",
        )


# --- Socket.IO events ---

@sio.event
async def connect(sid, environ):
    print(f"[socket] connected: {sid}")
    await sio.emit("connection_ack", {"status": "connected"}, to=sid)


@sio.event
async def disconnect(sid):
    print(f"[socket] disconnected: {sid}")


@sio.event
async def start_listening(sid, data):
    print(f"[socket] start_listening from {sid}: {data}")
    await sio.emit("backend_status", {"status": "listening"}, to=sid)


@sio.event
async def stop_listening(sid, data=None):
    await sio.emit("backend_status", {"status": "stopped"}, to=sid)


@sio.event
async def transcript_chunk(sid, data):
    # data expected: { "text": "..." }
    text = data.get("text", "") if isinstance(data, dict) else str(data)
    print(f"[transcript] {sid}: {text}")
    await sio.emit("transcript_received", {"text": text}, to=sid)
