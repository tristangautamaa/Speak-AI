"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSessions, type SessionRecord } from "@/lib/sessionHistory";

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#818cf8" : "#f59e0b";

  return (
    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="text-center">
        <p className="text-2xl font-bold tabular-nums" style={{ color }}>{score}</p>
        <p className="text-[10px] text-white/30">/ 100</p>
      </div>
    </div>
  );
}

function TrendIndicator({ latest, previous }: { latest: number; previous: number | null }) {
  if (previous === null) {
    return <span className="text-xs text-white/25">First session</span>;
  }
  const delta = latest - previous;
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2L10 7H2L6 2Z" fill="currentColor" />
        </svg>
        +{delta} vs last
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 10L2 5H10L6 10Z" fill="currentColor" />
        </svg>
        {delta} vs last
      </span>
    );
  }
  return <span className="text-xs text-white/30">Same as last</span>;
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "#34d399" : value >= 60 ? "#818cf8" : "#f59e0b";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-white/40">{label}</span>
        <span className="text-white/60 tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SessionRow({ session, index }: { session: SessionRecord; index: number }) {
  const date = new Date(session.dateTime);
  const dateStr = date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  const color =
    session.overall >= 80 ? "text-emerald-400" : session.overall >= 60 ? "text-indigo-400" : "text-amber-400";

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-white/20 tabular-nums w-4">{index + 1}</span>
        <div>
          <p className="text-sm text-white/70">
            {dateStr}
            {session.scenarioTitle && (
              <span className="ml-2 text-xs text-indigo-400/70">{session.scenarioTitle}</span>
            )}
          </p>
          <p className="text-xs text-white/25">{timeStr} &middot; {session.totalWords} words</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-3 text-xs text-white/30">
          <span>C {session.confidence}%</span>
          <span>Cl {session.clarity}%</span>
          <span>F {session.fillers}</span>
        </div>
        <span className={`text-base font-bold tabular-nums ${color}`}>{session.overall}</span>
      </div>
    </div>
  );
}

export default function ProgressDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    setSessions(loadSessions());
  }, []);

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M3 3V21H21" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M7 16L11 10L15 13L20 7" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-white/50 text-sm">No sessions yet.</p>
          <p className="text-white/25 text-xs mt-1">Complete a practice session to see your progress.</p>
        </div>
        <button
          onClick={() => router.push("/conversation")}
          className="px-5 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
        >
          Start Practicing
        </button>
      </div>
    );
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
  );
  const latest = sorted[0];
  const previous = sorted[1] ?? null;

  const avgOverall = Math.round(sessions.reduce((s, r) => s + r.overall, 0) / sessions.length);
  const avgConfidence = Math.round(sessions.reduce((s, r) => s + r.confidence, 0) / sessions.length);
  const avgClarity = Math.round(sessions.reduce((s, r) => s + r.clarity, 0) / sessions.length);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white/90">Your Progress</h1>
          <p className="text-xs text-white/30 mt-1">{sessions.length} session{sessions.length !== 1 ? "s" : ""} completed</p>
        </div>
        <button
          onClick={() => router.push("/conversation")}
          className="px-4 py-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors"
        >
          New Session
        </button>
      </div>

      {/* Latest score + trend */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex items-center gap-8">
        <ScoreRing score={latest.overall} />
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Latest Score</p>
          <p className="text-2xl font-bold text-white/90">
            {latest.overall >= 80 ? "Excellent" : latest.overall >= 60 ? "Good" : "Keep Practicing"}
          </p>
          <TrendIndicator latest={latest.overall} previous={previous?.overall ?? null} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Sessions", value: String(sessions.length), sub: "total" },
          { label: "Avg Score", value: String(avgOverall), sub: "overall" },
          { label: "Best", value: String(Math.max(...sessions.map((s) => s.overall))), sub: "overall" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white/80 tabular-nums">{value}</p>
            <p className="text-xs text-white/30 mt-0.5">{label}</p>
            <p className="text-[10px] text-white/15">{sub}</p>
          </div>
        ))}
      </div>

      {/* Average metric bars */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30">Average Breakdown</p>
        <MetricBar label="Confidence" value={avgConfidence} />
        <MetricBar label="Clarity" value={avgClarity} />
        <MetricBar label="Overall" value={avgOverall} />
      </div>

      {/* Recent sessions list */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/30 py-3 border-b border-white/[0.04]">
          Recent Sessions
        </p>
        {sorted.slice(0, 10).map((session, i) => (
          <SessionRow key={session.id} session={session} index={i} />
        ))}
      </div>
    </div>
  );
}
