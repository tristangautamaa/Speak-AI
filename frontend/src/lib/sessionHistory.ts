import type { AiScores } from "@/services/coachApi";

export interface SessionRecord {
  id: string;
  sessionId?: string;
  userId?: string;
  createdAt?: string;
  dateTime: string;
  overall: number;
  confidence: number;
  tempo: number;
  fillers: number;
  clarity: number;
  totalWords: number;
  scenarioId?: string;
  scenarioTitle?: string;
  transcriptPreview?: string[];
  attemptComparisonSummary?: AttemptComparisonSummary;
}

// Future: one AttemptRecord per user utterance within a session.
// Not persisted yet — add saveAttempt() and loadAttempts() when backend is ready.
export interface AttemptRecord {
  attemptId: string;
  sessionId: string;
  userId: string;
  transcriptText: string;
  createdAt: string;
  localMetrics: {
    confidence: number;
    tempo: number;
    fillers: number;
    clarity: number;
  };
  aiScores: AiScores | null;
  detectedIssues: string[];
  rewriteSuggestion: string | null;
}

export interface AttemptComparisonSummary {
  originalText: string;
  retryText: string;
  fillerBefore: number;
  fillerAfter: number;
  wordCountBefore: number;
  wordCountAfter: number;
  aiConfidenceBefore: number | null;
  aiConfidenceAfter: number | null;
  verdict: string;
}

const STORAGE_KEY = "speak_session_history";

export function loadSessions(): SessionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveSession(record: Omit<SessionRecord, "id">): void {
  const sessions = loadSessions();
  sessions.push({ ...record, id: crypto.randomUUID() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
