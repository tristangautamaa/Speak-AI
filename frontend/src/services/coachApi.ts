const BACKEND = "http://127.0.0.1:8000";

interface Metrics {
  confidence: number;
  tempo: number;
  fillers: number;
  clarity: number;
}

export interface CoachApiResponse {
  coachResponse: string;
  practiceAgain: boolean;
  focusArea: string;
}

export async function requestCoachResponse(
  userText: string,
  metrics: Metrics,
): Promise<CoachApiResponse> {
  const res = await fetch(`${BACKEND}/coach/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userText, metrics }),
  });
  if (!res.ok) throw new Error(`coach api ${res.status}`);
  return res.json() as Promise<CoachApiResponse>;
}
