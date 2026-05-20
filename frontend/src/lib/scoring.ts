export interface ScoredMetrics {
  confidence: number;
  tempo: number;
  clarity: number;
  fillers: number;
}

interface Entry {
  speaker: "user" | "ai";
  text: string;
  timestamp: number;
}

const FILLER_PATTERNS: RegExp[] = [
  /\buh\b/gi,
  /\bumm?\b/gi,
  /\blike\b/gi,
  /\bkind\s+of\b/gi,
  /\bmaybe\b/gi,
];

const BASE = 100;
const FILLER_CONFIDENCE_PENALTY = 5;
const LONG_TRANSCRIPT_WORD_THRESHOLD = 50;
const CLARITY_PENALTY_PER_WORD = 0.5;
const IDEAL_WPM = 140;

export function scoreTranscript(entries: Entry[]): ScoredMetrics {
  const userEntries = entries.filter((e) => e.speaker === "user");

  if (userEntries.length === 0) {
    return { confidence: BASE, tempo: 0, clarity: BASE, fillers: 0 };
  }

  const fullText = userEntries.map((e) => e.text).join(" ");
  const words = fullText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  let fillers = 0;
  for (const pattern of FILLER_PATTERNS) {
    const matches = fullText.match(pattern);
    if (matches) fillers += matches.length;
  }

  const confidence = Math.max(10, BASE - fillers * FILLER_CONFIDENCE_PENALTY);

  const elapsedMinutes = Math.max(
    0.05,
    (Date.now() - entries[0].timestamp) / 60_000,
  );
  const tempo = Math.round(wordCount / elapsedMinutes);

  const overThreshold = Math.max(0, wordCount - LONG_TRANSCRIPT_WORD_THRESHOLD);
  const clarity = Math.max(20, BASE - overThreshold * CLARITY_PENALTY_PER_WORD);

  return { confidence, tempo, clarity, fillers };
}

export function normalizeTempo(wpm: number): number {
  if (wpm <= 0) return 0;
  // 140 wpm → 100, <80 or >200 taper off
  if (wpm <= IDEAL_WPM) {
    return Math.round((wpm / IDEAL_WPM) * 100);
  }
  const over = wpm - IDEAL_WPM;
  return Math.max(20, Math.round(100 - over * 0.5));
}

export function normalizeFillers(count: number): number {
  // 0 fillers → 100 (full bar, good), 10+ → 0
  return Math.max(0, 100 - count * 10);
}
