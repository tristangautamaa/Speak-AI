"use client";

import { useConversationStore, type AttemptComparison } from "@/store/conversationStore";

function delta(original: number, retry: number): { value: string; improved: boolean; same: boolean } {
  const diff = retry - original;
  return {
    value: diff === 0 ? String(retry) : `${original} → ${retry}`,
    improved: diff < 0,
    same: diff === 0,
  };
}

function aiScoreDelta(original: number | undefined, retry: number | undefined) {
  if (original == null || retry == null) return null;
  const diff = Math.round(retry) - Math.round(original);
  return {
    value: `${Math.round(original)} → ${Math.round(retry)}`,
    improved: diff > 0,
    same: diff === 0,
  };
}

export function verdict(comparison: AttemptComparison): string {
  const fillerDelta = comparison.original.fillerCount - comparison.retry.fillerCount;
  const confidenceDelta =
    comparison.original.aiScores && comparison.retry.aiScores
      ? comparison.retry.aiScores.confidence - comparison.original.aiScores.confidence
      : null;
  const wordDelta = comparison.original.wordCount - comparison.retry.wordCount;

  const stronglyImproved =
    fillerDelta >= 2 || (confidenceDelta !== null && confidenceDelta >= 10);
  const slightlyImproved =
    fillerDelta >= 1 || wordDelta >= 3 || (confidenceDelta !== null && confidenceDelta >= 4);

  if (stronglyImproved) return "Cleaner. You sounded more direct this time.";
  if (slightlyImproved) return "A bit smoother. Keep tightening your language.";
  return "Still a little hesitant. Try one shorter sentence.";
}

function Row({
  label,
  d,
}: {
  label: string;
  d: { value: string; improved: boolean; same: boolean } | null;
}) {
  if (!d) return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/35">{label}</span>
      <span
        className={`text-[11px] font-medium tabular-nums ${
          d.same ? "text-white/40" : d.improved ? "text-emerald-400" : "text-red-400/80"
        }`}
      >
        {d.value}
      </span>
    </div>
  );
}

export default function AttemptComparisonCard() {
  const comparison = useConversationStore((s) => s.latestAttemptComparison);
  if (!comparison) return null;

  const fillers = delta(comparison.original.fillerCount, comparison.retry.fillerCount);
  const words = delta(comparison.original.wordCount, comparison.retry.wordCount);
  const oAi = comparison.original.aiScores;
  const rAi = comparison.retry.aiScores;
  const confidence = aiScoreDelta(oAi?.confidence, rAi?.confidence);
  const clarity = aiScoreDelta(oAi?.clarity, rAi?.clarity);
  const conciseness = aiScoreDelta(oAi?.conciseness, rAi?.conciseness);
  const presence = aiScoreDelta(oAi?.presence, rAi?.presence);
  const v = verdict(comparison);
  const isPositive = v.startsWith("Cleaner") || v.startsWith("A bit");

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/20">
          Attempt Comparison
        </h2>
      </div>
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Row label="Fillers" d={fillers} />
          <Row label="Words" d={words} />
          {confidence && <Row label="AI Confidence" d={confidence} />}
          {clarity && <Row label="AI Clarity" d={clarity} />}
          {conciseness && <Row label="AI Conciseness" d={conciseness} />}
          {presence && <Row label="AI Presence" d={presence} />}
        </div>
        <div className="pt-2 border-t border-white/[0.04]">
          <p
            className={`text-[11px] leading-relaxed ${
              isPositive ? "text-emerald-400/80" : "text-amber-400/80"
            }`}
          >
            {v}
          </p>
        </div>
      </div>
    </div>
  );
}
