"use client";

import { useConversationStore } from "@/store/conversationStore";
import { normalizeTempo, normalizeFillers } from "@/lib/scoring";

interface MetricCardProps {
  label: string;
  displayValue: string;
  progressPct: number;
  description: string;
  color: string;
  bgColor: string;
  barColor: string;
  icon: React.ReactNode;
  isActive: boolean;
  trend?: "good" | "warn" | "bad" | null;
}

function MetricCard({
  label,
  displayValue,
  progressPct,
  description,
  color,
  bgColor,
  barColor,
  icon,
  isActive,
  trend,
}: MetricCardProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
            {icon}
          </div>
          <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive && trend && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                trend === "good"
                  ? "bg-emerald-400"
                  : trend === "warn"
                  ? "bg-amber-400"
                  : "bg-red-400"
              }`}
            />
          )}
          <span className={`text-xl font-semibold tabular-nums ${isActive ? color : "text-white/20"}`}>
            {isActive ? displayValue : "--"}
          </span>
        </div>
      </div>

      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${isActive ? barColor : "bg-white/5"}`}
          style={{ width: `${isActive ? progressPct : 0}%` }}
        />
      </div>

      <p className="text-xs text-white/25 leading-relaxed">{description}</p>
    </div>
  );
}

function trendFor(value: number, thresholds: [number, number]): "good" | "warn" | "bad" {
  if (value >= thresholds[0]) return "good";
  if (value >= thresholds[1]) return "warn";
  return "bad";
}

export default function MetricsPanel() {
  const { metrics, status } = useConversationStore();
  const isActive = status === "active";

  const tempoPct = normalizeTempo(metrics.tempo);
  const fillerPct = normalizeFillers(metrics.fillers);

  const cards: MetricCardProps[] = [
    {
      label: "Confidence",
      displayValue: `${Math.round(metrics.confidence)}%`,
      progressPct: metrics.confidence,
      description:
        "Drops 5 points per filler word detected. Keep it above 80 for strong delivery.",
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      barColor: "bg-indigo-500/60",
      trend: trendFor(metrics.confidence, [80, 60]),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L10 6H14L11 9L12 13L8 10.5L4 13L5 9L2 6H6L8 2Z" fill="#818cf8" />
        </svg>
      ),
      isActive,
    },
    {
      label: "Tempo",
      displayValue: `${metrics.tempo} wpm`,
      progressPct: tempoPct,
      description: "Words per minute. Ideal range is 120–160 for clear communication.",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      barColor: "bg-violet-500/60",
      trend: trendFor(tempoPct, [70, 40]),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#a78bfa" strokeWidth="1.5" />
          <path d="M8 5V8L10 10" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      isActive,
    },
    {
      label: "Fillers",
      displayValue: String(metrics.fillers),
      progressPct: fillerPct,
      description: 'Filler words detected: "uh", "um", "like", "kind of", "maybe". Lower is better.',
      color: metrics.fillers === 0 ? "text-emerald-400" : metrics.fillers < 4 ? "text-amber-400" : "text-red-400",
      bgColor: "bg-amber-500/10",
      barColor: metrics.fillers === 0 ? "bg-emerald-500/60" : metrics.fillers < 4 ? "bg-amber-500/60" : "bg-red-500/60",
      trend: metrics.fillers === 0 ? "good" : metrics.fillers < 4 ? "warn" : "bad",
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 3V8" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="8" cy="11" r="1" fill="#fbbf24" />
          <circle cx="8" cy="8" r="6" stroke="#fbbf24" strokeWidth="1.5" />
        </svg>
      ),
      isActive,
    },
    {
      label: "Clarity",
      displayValue: `${Math.round(metrics.clarity)}%`,
      progressPct: metrics.clarity,
      description: "Decreases as transcript length grows. Stay concise for a higher score.",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      barColor: "bg-emerald-500/60",
      trend: trendFor(metrics.clarity, [75, 50]),
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M2 8C2 8 4 4 8 4C12 4 14 8 14 8C14 8 12 12 8 12C4 12 2 8 2 8Z" stroke="#34d399" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill="#34d399" />
        </svg>
      ),
      isActive,
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Live Metrics
        </h2>
        {isActive ? (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-xs text-white/20">Start a session to see data</span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 flex-1">
        {cards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>
    </div>
  );
}
