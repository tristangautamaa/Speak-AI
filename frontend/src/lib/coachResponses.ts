const FILLER_WORDS = ["uh", "um", "like", "kind of", "you know", "sort of", "maybe"];

const FILLER_PATTERN = new RegExp(
  `\\b(${FILLER_WORDS.join("|")})\\b`,
  "gi",
);

const GREETING_PATTERN = /\b(hello|hi|hey|good morning|good afternoon|good evening|what's up|howdy)\b/i;

// Words that suggest nervous fast speech
const NERVOUS_PATTERN = /\b(sorry|i mean|actually|basically|honestly|literally|obviously)\b/gi;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function countFillers(text: string): number {
  return (text.match(FILLER_PATTERN) ?? []).length;
}

export function shouldShowRetry(userText: string): boolean {
  const words = userText.trim().split(/\s+/).filter(Boolean);
  if (words.length > 50) return true;
  return (userText.match(FILLER_PATTERN) ?? []).length > 0;
}

export function generateCoachResponse(userText: string): string {
  const trimmed = userText.trim();
  const lower = trimmed.toLowerCase();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const fillerCount = countFillers(trimmed);
  const nervousCount = (trimmed.match(NERVOUS_PATTERN) ?? []).length;

  // Greeting
  if (wordCount <= 5 && GREETING_PATTERN.test(lower)) {
    return pick([
      "Hey! Great to work with you. Tell me something you feel good at — anything at all.",
      "Hi there. Let's start easy — what's been on your mind today?",
      "Good to have you here. Start whenever you're ready. No rush.",
    ]);
  }

  // Very short answer
  if (wordCount <= 6) {
    return pick([
      "Good start. Can you build on that with one more sentence?",
      "I hear you. Tell me a little more — take your time.",
      "Nice. Now give me the full thought — you've got this.",
    ]);
  }

  // Filler-heavy (3+ fillers)
  if (fillerCount >= 3) {
    return pick([
      "I noticed a few 'um's in there — totally normal. Try that again and replace each one with a short pause.",
      "Good energy. Let's clean it up: wherever you'd say 'uh' or 'like', just stop and breathe instead.",
      "You had some great ideas buried in there. Say it again — this time, silence instead of fillers.",
    ]);
  }

  // Some fillers (1–2)
  if (fillerCount >= 1) {
    return pick([
      "Almost filler-free — nice. One more try and drop that last 'um'.",
      "You're getting cleaner. Next time, pause instead of filling the gap.",
      "Good. One filler snuck in — just catch it early and you're solid.",
    ]);
  }

  // Long rambling answer (50+ words)
  if (wordCount > 50) {
    return pick([
      "Lots of good stuff in there. Now say the core idea in one sentence — just the heart of it.",
      "I'm with you. Can you cut that down to 15 words? Try it.",
      "Strong thoughts. Now be ruthless — what's the one thing you really want them to remember?",
    ]);
  }

  // Nervous qualifiers mixed with fast speech
  if (nervousCount >= 2) {
    return pick([
      "Slow down just a touch. You don't need to qualify everything — you already know this.",
      "Drop the 'basically' and 'honestly' — your words are strong enough without them.",
      "Own it. Say that again without softening it. You sound more confident than you think.",
    ]);
  }

  // Clear confident answer (no fillers, reasonable length)
  if (fillerCount === 0 && wordCount >= 10 && wordCount <= 50) {
    return pick([
      "That was clean and clear. Notice how that felt — that's your baseline.",
      "Really good. No hesitation, solid pace. Keep building on that.",
      "Nice delivery. If you paused just a beat at the end, it'd land even harder.",
      "That's it. Clear, direct, confident. Do it again and it'll feel natural.",
    ]);
  }

  // Everyday fallback
  return pick([
    "Good. Keep going — what else is on your mind?",
    "I'm listening. Take a breath and continue.",
    "Solid. Now say that again like you mean every word.",
    "Nice. Push a little further — one more idea.",
  ]);
}
