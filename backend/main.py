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
    scenarioId: str | None = None
    persona: str | None = None
    coachingFocus: list[str] | None = None
    tone: str | None = None

class AiScores(BaseModel):
    confidence: float
    clarity: float
    conciseness: float
    presence: float

class CoachResponse(BaseModel):
    coachResponse: str
    practiceAgain: bool
    focusArea: str
    nextPrompt: str | None = None
    aiScores: AiScores | None = None
    detectedIssues: list[str] = []
    rewriteSuggestion: str | None = None


class TranscriptItem(BaseModel):
    speaker: str
    text: str

class SessionMetrics(BaseModel):
    confidence: float
    tempo: float
    fillers: float
    clarity: float
    totalWords: int

class SessionReviewRequest(BaseModel):
    scenarioTitle: str | None = None
    transcript: list[TranscriptItem]
    metrics: SessionMetrics

class SessionReviewResponse(BaseModel):
    summary: str
    strength: str
    improvement: str
    nextExercise: str


_SCENARIO_INSTRUCTIONS: dict[str, str] = {
    "hr_manager": """\
SCENARIO — HR Manager interview practice.
You are playing a warm but professional HR manager. You are also coaching the user's communication.

Behavior rules:
- Reward structured, confident answers. If the answer is vague or rambling, gently push for a result or outcome ("What happened next?" / "What was the impact?") — this nudges STAR thinking without naming it.
- If the user uses softeners ("I think", "maybe", "kind of", "I guess", "sort of") — quote the exact word and offer a one-sentence stronger rewrite.
- Flag filler words by name.
- Coaching focus: confidence, clarity, structured answers.

nextPrompt rules:
- practiceAgain false → one natural interview-style follow-up question.
  Examples: "Now tell me about a challenge you handled recently." | "Can you give me one concrete example from your experience?" | "What was the outcome of that situation?" | "Tell me about a time you had to work under pressure."
- practiceAgain true → a retry instruction that names what to fix.
  Examples: "Try that again — this time end with a clear result." | "Say it again without 'I think' — own the statement." """,

    "teacher": """\
SCENARIO — Teacher explanation practice.
You are playing a supportive teacher. You are also coaching the user's communication.

Behavior rules:
- Reward plain language. If the user uses jargon or complex phrasing, quote it and suggest a simpler alternative.
- Flag long, winding sentences — point out where the user lost the thread.
- Flag filler words by name.
- Coaching focus: clarity, articulation, conciseness. Short sentences win.

nextPrompt rules:
- practiceAgain false → ask the user to simplify, re-explain, or give a concrete example.
  Examples: "Can you explain that again in simpler words?" | "Give me one concrete example." | "How would you explain this to someone who has never heard of it?" | "What is the one sentence that captures the whole idea?"
- practiceAgain true → a retry instruction focused on simplicity.
  Examples: "Say the same thing again, but use shorter sentences." | "Try again — aim for plain words a ten-year-old would understand." """,

    "colleague": """\
SCENARIO — Colleague workplace conversation practice.
You are playing a friendly colleague in a casual professional conversation. You are also coaching the user's communication.

Behavior rules:
- Keep your tone warm, natural, and conversational — never formal or stiff.
- Note if the user sounds tense, robotic, or over-rehearsed, and name it specifically.
- Encourage them to speak like themselves. If they use stilted phrasing, quote it and suggest how a real colleague would say it.
- Flag filler words by name only if they are frequent — occasional ones are fine.
- Coaching focus: comfort, natural flow, everyday confidence.

nextPrompt rules:
- practiceAgain false → a casual, natural follow-up that continues the conversation.
  Examples: "That makes sense — what happened next?" | "How did the team respond?" | "And how did it all turn out?" | "Interesting — what did you do about it?"
- practiceAgain true → a casual retry nudge.
  Examples: "Say that again more naturally, like you're talking to a friend." | "Try once more — relax and just tell me." """,

    "businessman": """\
SCENARIO — Businessperson pitch practice.
You are playing a sharp businessperson who values brevity and conviction. You are also coaching the user's communication.

Behavior rules:
- Be direct. Cut praise short. Get to the point in your response.
- Immediately call out softeners by quoting the exact words: "I think", "maybe", "kind of", "sort of", "I guess", "I feel like". These weaken the pitch.
- After calling out a weak phrase, always provide a one-sentence stronger rewrite.
- Reward bold, clear claims. If the user was punchy and direct, say so.
- Flag filler words by name.
- Coaching focus: confidence, conciseness, persuasion. Fewer words, stronger claims.

nextPrompt rules:
- practiceAgain false → one sharp, business-focused follow-up question.
  Examples: "Why should someone care about that idea?" | "What is the strongest reason this would work?" | "Give me that in one crisp sentence." | "What problem does this actually solve?"
- practiceAgain true → a direct retry with a stronger target.
  Examples: "Say that again, bolder and shorter — cut everything that softens it." | "Try once more — one clear claim, no qualifiers." """,
}

_PROMPT_TEMPLATE = """\
You are Aria, a communication coach in the SPEAK app.

{scenario_block}
Output ONLY valid JSON — no extra text, no markdown:
{{
  "coachResponse": "string",
  "practiceAgain": true | false,
  "focusArea": "fillers" | "confidence" | "tempo" | "clarity" | "conciseness",
  "nextPrompt": "string or null",
  "aiScores": {{
    "confidence": 0-100,
    "clarity": 0-100,
    "conciseness": 0-100,
    "presence": 0-100
  }},
  "detectedIssues": ["string"],
  "rewriteSuggestion": "string or null"
}}

coachResponse must be exactly 2 sentences:
1. One encouragement or in-character sentence.
2. One specific observation — name the exact issue, quote the user's actual words when relevant.
   If filler/hesitation words were detected, name them exactly (e.g. "you said 'um' and 'kind of'").

Rules for practiceAgain:
- true → user had hesitation words, too many fillers, rambled, or sounded very uncertain
- false → user was reasonably clear and confident

Rules for focusArea:
- "fillers" → hesitation/filler words detected
- "confidence" → uncertain but no fillers
- "tempo" → tempo metric flags an issue and no stronger issue exists
- "clarity" → clarity metric is low and no stronger issue exists
- "conciseness" → text was long and rambling

Rules for nextPrompt:
- If a scenario is active: always return a nextPrompt (see scenario-specific rules above).
- If practiceAgain is true: nextPrompt is a retry instruction that names what to fix (from scenario rules).
- If practiceAgain is false: nextPrompt is one natural follow-up question (from scenario rules).
- If no scenario is active: null.
- Keep nextPrompt to one sentence — direct and conversational.

Rules for aiScores (all integers 0–100):
- confidence: assertive word choice, absence of hedges ("I think", "maybe", "I guess"), decisive phrasing. Short/neutral input → 60–70.
- clarity: logical flow, simple vocabulary, easy to follow. Short/neutral input → 60–70.
- conciseness: no rambling, no repeated points, no padding. Short direct answer scores high. Short/neutral input → 65–75.
- presence: holistic calm/controlled/composed delivery inferred from text quality and the provided metrics (filler count, confidence). Short/neutral input → 60–70.

Rules for detectedIssues:
- 0–3 concrete issues observed in the text. Examples: "Used 'I think' twice — weakens authority", "Repeated the same point twice", "Sentence structure lost focus mid-answer".
- Empty array if no issues.

Rules for rewriteSuggestion:
- If the user's answer had one clear improvable sentence: provide ONE rewrite of that sentence only — no preamble.
- null if no specific rewrite is useful (very short input or already strong).

Never be vague. Always name the specific observable issue or strength.\
"""

def _build_system_prompt(scenario_id: str | None) -> str:
    block = _SCENARIO_INSTRUCTIONS.get(scenario_id or "", "")
    scenario_block = f"{block}\n\n" if block else ""
    return _PROMPT_TEMPLATE.format(scenario_block=scenario_block)


# --- HTTP routes ---

@app.get("/")
async def root():
    return {"message": "Speak backend alive"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "speak-backend"}


_FILLER_WORDS = {"uh", "um", "like", "you know", "kind of", "kinda", "sort of",
                 "basically", "literally", "actually", "maybe", "i think", "i guess",
                 "i mean", "right", "so", "well"}

def _detect_fillers(text: str) -> list[str]:
    lower = text.lower()
    found = []
    for fw in _FILLER_WORDS:
        if f" {fw} " in f" {lower} " or lower.startswith(fw + " ") or lower.endswith(" " + fw):
            found.append(f"'{fw}'")
    return found


@app.post("/coach/respond", response_model=CoachResponse)
async def coach_respond(req: CoachRequest) -> CoachResponse:
    detected = _detect_fillers(req.userText)
    filler_note = (
        f"Hesitation/filler words detected in text: {', '.join(detected)}."
        if detected else "No obvious filler words detected."
    )
    word_count = len(req.userText.split())
    user_message = (
        f"User said: \"{req.userText}\"\n"
        f"Word count: {word_count}\n"
        f"{filler_note}\n"
        f"Metrics — confidence: {req.metrics.confidence:.0f}/100, "
        f"tempo: {req.metrics.tempo:.0f} wpm, "
        f"fillers: {req.metrics.fillers:.0f}, "
        f"clarity: {req.metrics.clarity:.0f}/100"
    )
    try:
        system_prompt = _build_system_prompt(req.scenarioId)
        completion = await _openai.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
        )
        data = json.loads(completion.choices[0].message.content or "{}")
        raw_next = data.get("nextPrompt")

        raw_scores = data.get("aiScores")
        ai_scores: AiScores | None = None
        if isinstance(raw_scores, dict):
            try:
                ai_scores = AiScores(
                    confidence=float(raw_scores.get("confidence", 65)),
                    clarity=float(raw_scores.get("clarity", 65)),
                    conciseness=float(raw_scores.get("conciseness", 65)),
                    presence=float(raw_scores.get("presence", 65)),
                )
            except Exception:
                ai_scores = None

        raw_issues = data.get("detectedIssues", [])
        detected_issues = [str(i) for i in raw_issues] if isinstance(raw_issues, list) else []

        raw_rewrite = data.get("rewriteSuggestion")
        rewrite_suggestion = str(raw_rewrite) if raw_rewrite else None

        return CoachResponse(
            coachResponse=str(data.get("coachResponse", "Good effort. Keep going.")),
            practiceAgain=bool(data.get("practiceAgain", False)),
            focusArea=str(data.get("focusArea", "confidence")),
            nextPrompt=str(raw_next) if raw_next else None,
            aiScores=ai_scores,
            detectedIssues=detected_issues,
            rewriteSuggestion=rewrite_suggestion,
        )
    except Exception:
        return CoachResponse(
            coachResponse="Good effort. Take a breath and try again.",
            practiceAgain=False,
            focusArea="confidence",
            nextPrompt=None,
        )


_SESSION_REVIEW_PROMPT = """You are Aria, a friendly communication coach in the SPEAK app.

Review the user's practice session and write a short, honest, personalized summary.

Output ONLY valid JSON — no extra text, no markdown:
{
  "summary": "string",
  "strength": "string",
  "improvement": "string",
  "nextExercise": "string"
}

Field rules:
- summary: 2–3 sentences. Describe how the session went overall. Name at least one specific observation — mention actual hesitation words if detected, note if they rushed or rambled, or call out a moment of strong clarity. Sound like a coach writing a quick debrief, not an evaluator filling a form.
- strength: 1–2 sentences. Name one real thing they did well — tie it to a specific moment or their actual words when possible.
- improvement: 1–2 sentences. Name one concrete thing to work on — specific, not generic.
- nextExercise: 1 sentence. One short, practical exercise they can do right now to address the improvement area.

Tone: direct, warm, honest. Not academic. No filler openers like "Great job!" or "Overall, you did well."
Always address the user as "you" — never "the user".
If the session was short or metrics are low, be honest but kind."""


@app.post("/coach/session-review", response_model=SessionReviewResponse)
async def session_review(req: SessionReviewRequest) -> SessionReviewResponse:
    scenario_line = f"Scenario: {req.scenarioTitle}" if req.scenarioTitle else "Scenario: General practice"
    m = req.metrics
    metrics_line = (
        f"Metrics — confidence: {m.confidence:.0f}%, tempo: {m.tempo:.0f} wpm, "
        f"filler words: {m.fillers:.0f}, clarity: {m.clarity:.0f}%, total words: {m.totalWords}"
    )
    transcript_lines = "\n".join(
        f"[{'You' if item.speaker == 'user' else 'Aria'}] {item.text}"
        for item in req.transcript
    )
    user_message = f"{scenario_line}\n{metrics_line}\n\nTranscript:\n{transcript_lines}"
    try:
        completion = await _openai.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": _SESSION_REVIEW_PROMPT},
                {"role": "user", "content": user_message},
            ],
        )
        data = json.loads(completion.choices[0].message.content or "{}")
        return SessionReviewResponse(
            summary=str(data.get("summary", "Good session. Keep practicing.")),
            strength=str(data.get("strength", "You showed up and practiced — that matters.")),
            improvement=str(data.get("improvement", "Keep working on clarity and confidence.")),
            nextExercise=str(data.get("nextExercise", "Read a paragraph aloud and record yourself.")),
        )
    except Exception:
        return SessionReviewResponse(
            summary="Good effort this session. Review your metrics below to see where you stand.",
            strength="You showed up and practiced — consistency is the foundation of improvement.",
            improvement="Focus on reducing filler words and speaking with more conviction.",
            nextExercise="Speak one idea aloud, pause fully, then continue — no filler bridges.",
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
