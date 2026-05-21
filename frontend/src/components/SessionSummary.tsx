"use client";

import { useRouter } from "next/navigation";
import { useConversationStore } from "@/store/conversationStore";
import { normalizeTempo, normalizeFillers } from "@/lib/scoring";

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

export default function SessionSummary() {
  const router = useRouter();
  const { metrics, transcript } = useConversationStore();

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

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white/90">Session Summary</h1>
          <p className="text-xs text-white/30 mt-1">Here's how your practice went.</p>
        </div>
        <button
          onClick={() => router.push("/conversation")}
          className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
        >
          Practice Again
        </button>
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

      {/* Insight cards */}
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

      {/* Suggested exercise */}
      <div className="bg-indigo-500/[0.05] border border-indigo-500/20 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400/70 mb-2">
          Suggested Exercise
        </p>
        <p className="text-sm text-white/70 leading-relaxed">
          {EXERCISES[improvementKey]}
        </p>
      </div>
    </div>
  );
}
