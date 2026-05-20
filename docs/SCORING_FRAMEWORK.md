# SPEAK — Scoring Framework

## Philosophy

Scores should feel like a mirror, not a grade. The goal is to give the user a concrete signal about how they're speaking so they know what to work on — not to shame them. All scores default to 0 at session start and update live as the user speaks.

Scores are session-scoped: they reflect the user's aggregate performance since the session started, not just the most recent utterance.

---

## Four Metrics

### 1. Confidence (0–100)

Measures how assertive and filler-free the user's speech is.

**Current implementation:**
```
confidence = 100 − (filler_count × 5)
minimum = 10
```

Filler words reduce confidence because hesitation words signal uncertainty to listeners. The score starts at 100 and decays with each filler detected.

**Filler patterns detected:** `uh`, `um`, `umm`, `like`, `kind of`, `maybe`

**Display:** Higher is better. 100 = no fillers detected.

---

### 2. Tempo (0–100, normalized)

Measures speaking pace relative to the ideal conversational rate.

**Current implementation:**
```
raw_wpm = total_user_words / elapsed_minutes
normalized_tempo = (raw_wpm / 140) × 100       if wpm ≤ 140
                 = 100 − ((raw_wpm − 140) × 0.5) if wpm > 140
minimum = 20
```

Ideal speaking pace is approximately 140 words per minute (WPM) for coached, confident speech. Speaking much faster or slower than this reduces clarity for the listener.

**Display:** Higher is better. 100 = ideal pace (~140 WPM).

---

### 3. Clarity (0–100)

Measures how focused and concise the user's speech is across the session.

**Current implementation:**
```
words_over_threshold = max(0, total_words − 50)
clarity = 100 − (words_over_threshold × 0.5)
minimum = 20
```

Very long, rambling responses lose clarity. The score starts at 100 and decays gently once the session exceeds 50 total words, penalizing verbosity.

**Note:** This is a rough proxy for clarity. Future versions will use LLM analysis (sentence structure, logical flow, vocabulary precision) for a more meaningful clarity score.

**Display:** Higher is better. 100 = concise.

---

### 4. Fillers (0–100, inverted count)

A direct count of filler words, normalized to a 0–100 bar for display.

**Current implementation:**
```
normalized_fillers = max(0, 100 − (filler_count × 10))
```

**Display:** Higher is better. 100 = zero fillers. 0 = 10 or more fillers detected.

This metric is separate from Confidence because it is useful to show raw filler frequency to the user as a behavior-change signal.

---

## Score Sources

All scoring logic lives in `frontend/src/lib/scoring.ts`:

| Function | Purpose |
|---|---|
| `scoreTranscript(entries)` | Computes raw confidence, tempo (WPM), clarity, fillers from transcript |
| `normalizeTempo(wpm)` | Converts raw WPM to 0–100 score |
| `normalizeFillers(count)` | Converts raw filler count to 0–100 bar |

The `useScoring` hook in `frontend/src/hooks/useScoring.ts` wires these functions to the Zustand store, recalculating on every transcript update.

---

## Future Improvements

- **Confidence:** Factor in sentence length, declarative vs. hedged phrasing (requires LLM)
- **Tempo:** Per-utterance tempo rather than session average (surfaces rushes and stalls)
- **Clarity:** Semantic clarity via LLM — logical flow, vocabulary precision, conciseness
- **Fillers:** Per-utterance filler count so the user sees which turn had the most
- **New metric — Energy:** Volume variance, pitch range (requires audio analysis)
- **New metric — Structure:** Opening/closing strength, use of signposting language
