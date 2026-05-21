const BACKEND = "http://127.0.0.1:8000";

export interface SessionReview {
  summary: string;
  strength: string;
  improvement: string;
  nextExercise: string;
}

interface TranscriptItem {
  speaker: "user" | "ai";
  text: string;
}

interface ReviewMetrics {
  confidence: number;
  tempo: number;
  fillers: number;
  clarity: number;
  totalWords: number;
}

interface SessionReviewRequest {
  scenarioTitle: string | null;
  transcript: TranscriptItem[];
  metrics: ReviewMetrics;
}

export async function requestSessionReview(
  req: SessionReviewRequest,
): Promise<SessionReview> {
  const res = await fetch(`${BACKEND}/coach/session-review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`session review api ${res.status}`);
  return res.json() as Promise<SessionReview>;
}
