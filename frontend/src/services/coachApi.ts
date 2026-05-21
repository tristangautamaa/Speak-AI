const BACKEND = "http://127.0.0.1:8000";

interface Metrics {
  confidence: number;
  tempo: number;
  fillers: number;
  clarity: number;
}

export interface ScenarioContext {
  scenarioId: string;
  persona: string;
  coachingFocus: string[];
  tone: string;
}

export interface AiScores {
  confidence: number;
  clarity: number;
  conciseness: number;
  presence: number;
}

export interface CoachApiResponse {
  coachResponse: string;
  practiceAgain: boolean;
  focusArea: string;
  nextPrompt: string | null;
  aiScores: AiScores | null;
  detectedIssues: string[];
  rewriteSuggestion: string | null;
}

export async function requestCoachResponse(
  userText: string,
  metrics: Metrics,
  scenario?: ScenarioContext,
): Promise<CoachApiResponse> {
  const res = await fetch(`${BACKEND}/coach/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userText, metrics, ...scenario }),
  });
  if (!res.ok) throw new Error(`coach api ${res.status}`);
  return res.json() as Promise<CoachApiResponse>;
}
