"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConversationStore } from "@/store/conversationStore";
import { normalizeTempo, normalizeFillers } from "@/lib/scoring";
import { type AttemptComparisonSummary, loadSessions } from "@/lib/sessionHistory";
import { verdict as computeVerdict } from "@/components/AttemptComparisonCard";

type FeedbackRating = "helpful" | "somewhat" | "not_useful";

interface FeedbackRecord {
  id: string;
  timestamp: string;
  rating: FeedbackRating;
  comment: string;
  scenarioTitle: string | null;
  overallScore: number;
}

function saveFeedback(record: Omit<FeedbackRecord, "id">): void {
  try {
    const raw = localStorage.getItem("speak_feedback");
    const existing: FeedbackRecord[] = raw ? (JSON.parse(raw) as FeedbackRecord[]) : [];
    existing.push({ ...record, id: crypto.randomUUID() });
    localStorage.setItem("speak_feedback", JSON.stringify(existing));
  } catch {
    // localStorage unavailable
  }
}

const RATINGS: { key: FeedbackRating; label: string }[] = [
  { key: "helpful", label: "Helpful" },
  { key: "somewhat", label: "Somewhat" },
  { key: "not_useful", label: "Not useful" },
];

function FeedbackSection({
  scenarioTitle,
  overallScore,
}: {
  scenarioTitle: string | null;
  overallScore: number;
}) {
  const [rating, setRating] = useState<FeedbackRating | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-center">
        <p className="text-sm text-white/50">Thanks for your feedback.</p>
      </div>
    );
  }

  function handleSubmit() {
    if (!rating) return;
    saveFeedback({
      timestamp: new Date().toISOString(),
      rating,
      comment: comment.trim(),
      scenarioTitle,
      overallScore,
    });
    setSubmitted(true);
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
        Was this feedback useful?
      </p>
      <div className="flex gap-2">
        {RATINGS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRating(key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
              rating === key
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                : "bg-white/[0.03] border-white/[0.08] text-white/40 hover:bg-white/[0.06] hover:text-white/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {rating && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What should Aria improve? (optional)"
            rows={2}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/60 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/[0.15] transition-colors"
          />
          <button
            onClick={handleSubmit}
            className="self-start px-5 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 transition-colors"
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}

type ReplayFilter = "all" | "user" | "ai";

const REPLAY_FILTERS: { key: ReplayFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "user", label: "Your speaking" },
  { key: "ai", label: "Aria coaching" },
];

interface ReplayEntry {
  id: string;
  speaker: "user" | "ai";
  text: string;
}

function SessionReplay({ transcript }: { transcript: ReplayEntry[] }) {
  const [filter, setFilter] = useState<ReplayFilter>("all");

  if (transcript.length === 0) return null;

  const visible =
    filter === "all"
      ? transcript
      : transcript.filter((e) => e.speaker === (filter === "user" ? "user" : "ai"));

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Session Replay
        </p>
        <div className="flex gap-1">
          {REPLAY_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filter === key
                  ? "bg-white/[0.08] text-white/70"
                  : "text-white/25 hover:text-white/50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
        {visible.map((entry) => (
          <div
            key={entry.id}
            className={`flex gap-2.5 ${entry.speaker === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[10px] font-medium mt-0.5 ${
                entry.speaker === "ai"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {entry.speaker === "ai" ? "A" : "Y"}
            </div>
            <div
              className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line max-w-[85%] ${
                entry.speaker === "ai"
                  ? "bg-white/[0.04] text-white/60 rounded-tl-sm"
                  : "bg-indigo-500/[0.08] text-white/70 rounded-tr-sm"
              }`}
            >
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${
                  entry.speaker === "ai" ? "text-indigo-400/60" : "text-white/30"
                }`}
              >
                {entry.speaker === "ai" ? "Aria" : "You"}
              </span>
              {entry.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type MetricKey = "confidence" | "tempo" | "fillers" | "clarity";

const METRIC_LABELS: Record<MetricKey, string> = {
  confidence: "Confidence",
  tempo: "Tempo",
  fillers: "Filler Control",
  clarity: "Clarity",
};

const STRENGTH_MESSAGES: Record<MetricKey, string> = {
  confidence: "You spoke with strong conviction — minimal hesitation words.",
  tempo: "Your pacing was natural and easy to follow.",
  fillers: "You kept filler words under control throughout the session.",
  clarity: "Your answers were concise and to the point.",
};

const IMPROVEMENT_MESSAGES: Record<MetricKey, string> = {
  confidence: "Work on reducing filler words to project more authority.",
  tempo: "Aim for 120–160 wpm — find your natural rhythm.",
  fillers: 'Catch yourself before "uh", "um", or "like" — pause instead.',
  clarity: "Keep answers shorter and more focused.",
};

const EXERCISES: Record<MetricKey, string> = {
  confidence: "Power Stance: stand tall, project your voice, deliver one idea per breath.",
  tempo: "Slow Read: read a paragraph aloud at half speed, landing each word.",
  fillers: "Pause Practice: speak a sentence, stop fully, then continue — no filler bridges.",
  clarity: "One-Sentence Drill: summarize your last answer in exactly one sentence.",
};

function ScoreRing({ score }: { score: number }) {
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#818cf8" : "#f59e0b";

  return (
    <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
      <svg
        className="absolute inset-0 -rotate-90"
        width="144"
        height="144"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="text-center">
        <p className="text-4xl font-bold tabular-nums" style={{ color }}>
          {score}
        </p>
        <p className="text-xs text-white/30 mt-0.5">/ 100</p>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-white/50">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold text-white/80">{value}</span>
        {sub && <span className="text-xs text-white/25 ml-2">{sub}</span>}
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <div className="h-2.5 bg-white/10 rounded-full w-1/4 mb-4" />
        <div className="h-2.5 bg-white/[0.07] rounded-full w-full mb-2.5" />
        <div className="h-2.5 bg-white/[0.07] rounded-full w-5/6 mb-2.5" />
        <div className="h-2.5 bg-white/[0.07] rounded-full w-4/6" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 h-24" />
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 h-24" />
      </div>
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 h-16" />
    </div>
  );
}

function ImprovementMoment({ s }: { s: AttemptComparisonSummary }) {
  const isPositive = s.verdict.startsWith("Cleaner") || s.verdict.startsWith("A bit");

  function DeltaRow({
    label,
    before,
    after,
    lowerIsBetter = false,
  }: {
    label: string;
    before: number;
    after: number;
    lowerIsBetter?: boolean;
  }) {
    const improved = lowerIsBetter ? after < before : after > before;
    const same = after === before;
    return (
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/35">{label}</span>
        <span
          className={`text-[11px] font-medium tabular-nums ${
            same ? "text-white/40" : improved ? "text-emerald-400" : "text-red-400/80"
          }`}
        >
          {before} → {after}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
        Improvement Moment
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-0.5">
            Original
          </span>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3 italic">
            &ldquo;{s.originalText}&rdquo;
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-0.5">
            Retry
          </span>
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3 italic">
            &ldquo;{s.retryText}&rdquo;
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.04]">
        <DeltaRow label="Fillers" before={s.fillerBefore} after={s.fillerAfter} lowerIsBetter />
        <DeltaRow label="Words" before={s.wordCountBefore} after={s.wordCountAfter} />
        {s.aiConfidenceBefore !== null && s.aiConfidenceAfter !== null && (
          <DeltaRow
            label="AI Confidence"
            before={Math.round(s.aiConfidenceBefore)}
            after={Math.round(s.aiConfidenceAfter)}
          />
        )}
      </div>

      <div className="pt-2 border-t border-white/[0.04]">
        <p
          className={`text-[11px] leading-relaxed ${
            isPositive ? "text-emerald-400/80" : "text-amber-400/80"
          }`}
        >
          {s.verdict}
        </p>
      </div>
    </div>
  );
}

export default function SessionSummary() {
  const router = useRouter();
  const { metrics, transcript, selectedScenario, sessionReview, sessionReviewLoading, latestAttemptComparison } =
    useConversationStore();

  const userEntries = transcript.filter((e) => e.speaker === "user");

  if (userEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7V12C2 16.5 6.5 20.7 12 22C17.5 20.7 22 16.5 22 12V7L12 2Z"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <div>
          <p className="text-white/50 text-sm">No session found.</p>
          <p className="text-white/25 text-xs mt-1">Start a conversation first.</p>
        </div>
        <button
          onClick={() => router.push("/conversation")}
          className="px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
        >
          Go to Practice
        </button>
      </div>
    );
  }

  const tempoPct = normalizeTempo(metrics.tempo);
  const fillerPct = normalizeFillers(metrics.fillers);

  const normalized: Record<MetricKey, number> = {
    confidence: metrics.confidence,
    tempo: tempoPct,
    fillers: fillerPct,
    clarity: metrics.clarity,
  };

  const overall = Math.round(
    (normalized.confidence + normalized.tempo + normalized.fillers + normalized.clarity) / 4,
  );

  const totalWords = userEntries
    .flatMap((e) => e.text.split(/\s+/).filter(Boolean))
    .length;

  const sorted = (Object.entries(normalized) as [MetricKey, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const strengthKey = sorted[0][0];
  const improvementKey = sorted[sorted.length - 1][0];

  const overallLabel =
    overall >= 80 ? "Excellent" : overall >= 60 ? "Good" : "Keep Practicing";

  const comparisonSummary: AttemptComparisonSummary | null = (() => {
    if (latestAttemptComparison) {
      return {
        originalText: latestAttemptComparison.original.transcriptText,
        retryText: latestAttemptComparison.retry.transcriptText,
        fillerBefore: latestAttemptComparison.original.fillerCount,
        fillerAfter: latestAttemptComparison.retry.fillerCount,
        wordCountBefore: latestAttemptComparison.original.wordCount,
        wordCountAfter: latestAttemptComparison.retry.wordCount,
        aiConfidenceBefore: latestAttemptComparison.original.aiScores?.confidence ?? null,
        aiConfidenceAfter: latestAttemptComparison.retry.aiScores?.confidence ?? null,
        verdict: computeVerdict(latestAttemptComparison),
      };
    }
    const sessions = loadSessions();
    return sessions[sessions.length - 1]?.attemptComparisonSummary ?? null;
  })();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white/90">Session Summary</h1>
          <p className="text-xs text-white/30 mt-1">
            {selectedScenario
              ? `${selectedScenario.title} · Here's how your practice went.`
              : "Here's how your practice went."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/progress")}
            className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 text-sm font-medium hover:bg-white/[0.07] hover:text-white/70 transition-colors"
          >
            View Progress
          </button>
          <button
            onClick={() => router.push("/conversation")}
            className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Overall score */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-center gap-8">
        <ScoreRing score={overall} />
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
            Overall Score
          </p>
          <p className="text-2xl font-bold text-white/90">{overallLabel}</p>
          <p className="text-sm text-white/40 mt-1">
            {totalWords} words spoken &middot; {metrics.fillers} filler
            {metrics.fillers !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-2">
        <MetricRow
          label="Confidence"
          value={`${Math.round(metrics.confidence)}%`}
        />
        <MetricRow
          label="Tempo"
          value={`${metrics.tempo} wpm`}
          sub={`${tempoPct}% score`}
        />
        <MetricRow
          label="Filler Words"
          value={String(metrics.fillers)}
          sub={`${fillerPct}% score`}
        />
        <MetricRow
          label="Clarity"
          value={`${Math.round(metrics.clarity)}%`}
        />
        <MetricRow label="Total Words" value={String(totalWords)} />
      </div>

      {/* Improvement Moment — live from Zustand, or persisted from last saved session */}
      {comparisonSummary && <ImprovementMoment s={comparisonSummary} />}

      {/* AI session review — loading skeleton, AI result, or static fallback */}
      {sessionReviewLoading && <ReviewSkeleton />}

      {!sessionReviewLoading && sessionReview && (
        <>
          {/* AI summary */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/30 mb-3">
              Aria&apos;s Review
            </p>
            <p className="text-sm text-white/70 leading-relaxed">{sessionReview.summary}</p>
          </div>

          {/* AI insight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70 mb-2">
                Main Strength
              </p>
              <p className="text-sm text-white/70 leading-relaxed">{sessionReview.strength}</p>
            </div>
            <div className="bg-amber-500/[0.05] border border-amber-500/20 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70 mb-2">
                Improve Next
              </p>
              <p className="text-sm text-white/70 leading-relaxed">{sessionReview.improvement}</p>
            </div>
          </div>

          {/* AI next exercise */}
          <div className="bg-indigo-500/[0.05] border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400/70 mb-2">
              Next Exercise
            </p>
            <p className="text-sm text-white/70 leading-relaxed">{sessionReview.nextExercise}</p>
          </div>
        </>
      )}

      {!sessionReviewLoading && !sessionReview && (
        <>
          {/* Static insight cards — fallback when AI review unavailable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-500/[0.05] border border-emerald-500/20 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70 mb-2">
                Main Strength
              </p>
              <p className="text-sm font-medium text-white/80">
                {METRIC_LABELS[strengthKey]}
              </p>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                {STRENGTH_MESSAGES[strengthKey]}
              </p>
            </div>
            <div className="bg-amber-500/[0.05] border border-amber-500/20 rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/70 mb-2">
                Improve Next
              </p>
              <p className="text-sm font-medium text-white/80">
                {METRIC_LABELS[improvementKey]}
              </p>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed">
                {IMPROVEMENT_MESSAGES[improvementKey]}
              </p>
            </div>
          </div>

          <div className="bg-indigo-500/[0.05] border border-indigo-500/20 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400/70 mb-2">
              Suggested Exercise
            </p>
            <p className="text-sm text-white/70 leading-relaxed">
              {EXERCISES[improvementKey]}
            </p>
          </div>
        </>
      )}

      <SessionReplay transcript={transcript} />

      <FeedbackSection
        scenarioTitle={selectedScenario?.title ?? null}
        overallScore={overall}
      />
    </div>
  );
}
