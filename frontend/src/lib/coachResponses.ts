const FILLER_WORDS = ["uh", "um", "like", "maybe", "kind of", "you know", "sort of"];

export function generateCoachResponse(userText: string): string {
  const words = userText.trim().split(/\s+/);
  const lower = userText.toLowerCase();

  if (words.length <= 3) {
    return "Hey, good to hear you. Let's start simple — tell me about your day in 2-3 sentences.";
  }

  const hasFiller = FILLER_WORDS.some((filler) =>
    new RegExp(`\\b${filler}\\b`, "i").test(lower)
  );

  if (hasFiller) {
    return "Good start. I noticed a few hesitation words there. Try saying the same idea again with fewer fillers and a slower tempo.";
  }

  if (words.length > 50) {
    return "You have a lot of ideas there. Let's make it sharper — try summarizing that in one clear sentence.";
  }

  return "Nice. That was clear. Now try adding a little more confidence and let your words land.";
}
