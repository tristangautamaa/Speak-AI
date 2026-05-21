"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TranscriptPanel from "./TranscriptPanel";
import MetricsPanel from "./MetricsPanel";
import AttemptComparisonCard, { verdict } from "./AttemptComparisonCard";
import MicButton from "./MicButton";
import ScenarioPicker from "./ScenarioPicker";
import OnboardingGuide, { hasSeenOnboarding } from "./OnboardingGuide";
import { useConversationStore } from "@/store/conversationStore";
import { useScoring } from "@/hooks/useScoring";
import { normalizeTempo, normalizeFillers } from "@/lib/scoring";
import { saveSession } from "@/lib/sessionHistory";
import { getOrCreateAnonymousUserId } from "@/lib/localUser";
import { createSessionId } from "@/lib/sessionIds";
import { requestSessionReview } from "@/services/sessionReviewApi";

function StatusBar() {
  const { micStatus } = useConversationStore();
  const listening = micStatus === "listening";

  if (!listening) return null;

  return (
    <div className="flex items-center justify-center gap-3 py-2 px-4 border-b border-white/[0.05] bg-black/20">
      <span className="flex items-center gap-1.5 text-[11px] text-indigo-300 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block animate-pulse" />
        Listening
      </span>
    </div>
  );
}

function AIAvatar() {
  const { status } = useConversationStore();
  const isActive = status === "active";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-full bg-indigo-500/10 scale-125 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-0 rounded-full bg-indigo-500/5 scale-150" />
          </>
        )}
        <div
          className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center avatar-glow ${
            isActive
              ? "border-indigo-500/60 bg-indigo-500/10"
              : "border-white/10 bg-white/[0.03]"
          }`}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="16" r="8" fill="#818cf8" opacity="0.9" />
            <path
              d="M4 36C4 27.163 11.163 20 20 20C28.837 20 36 27.163 36 36"
              stroke="#818cf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-white/70">Aria</p>
        <p className="text-xs text-white/30">
          {isActive ? (
            <span className="flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Speaking
            </span>
          ) : (
            "AI Coach"
          )}
        </p>
      </div>
    </div>
  );
}

export default function ConversationScreen() {
  useScoring();
  const router = useRouter();
  const { transcript, reset, addTranscriptEntry, selectedScenario, setSelectedScenario, setSessionId, setUserId } =
    useConversationStore();

  const [showOnboarding, setShowOnboarding] = useState(() => !hasSeenOnboarding());

  // On mount: reset all conversation state and restore stable anonymous userId
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    reset();
    setUserId(getOrCreateAnonymousUserId());
  }, []);

  // When a scenario is selected: assign a new sessionId and seed the opening prompt
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedScenario) return;
    setSessionId(createSessionId());
    addTranscriptEntry({
      speaker: "ai",
      text: selectedScenario.openingPrompt,
      timestamp: Date.now(),
    });
  }, [selectedScenario]);

  const hasSession = transcript.some((e) => e.speaker === "user");

  if (showOnboarding) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#080b12]">
        <OnboardingGuide onStart={() => setShowOnboarding(false)} />
      </div>
    );
  }

  if (!selectedScenario) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#080b12] relative">
        <ScenarioPicker />
        <button
          onClick={() => setShowOnboarding(true)}
          className="absolute top-4 right-5 text-[11px] text-white/25 hover:text-white/50 transition-colors"
        >
          Show guide
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#080b12]">
      {/* Left panel */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-white/[0.05]">
        <StatusBar />

        {/* AI Avatar section */}
        <div className="flex items-center justify-center py-10 border-b border-white/[0.05] bg-gradient-to-b from-indigo-500/[0.03] to-transparent">
          <AIAvatar />
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-hidden px-6 py-5">
          <TranscriptPanel />
        </div>

        {/* Mic button + End Session */}
        <div className="flex items-center justify-center gap-5 py-8 border-t border-white/[0.05] bg-gradient-to-t from-black/40 to-transparent">
          <MicButton size="lg" />
          {hasSession && (
            <button
              onClick={() => {
                const { metrics, transcript, selectedScenario: sc, sessionId, userId, latestAttemptComparison } =
                  useConversationStore.getState();
                const userEntries = transcript.filter((e) => e.speaker === "user");
                const totalWords = userEntries
                  .flatMap((e) => e.text.split(/\s+/).filter(Boolean))
                  .length;
                const tempoPct = normalizeTempo(metrics.tempo);
                const fillerPct = normalizeFillers(metrics.fillers);
                const overall = Math.round(
                  (metrics.confidence + tempoPct + fillerPct + metrics.clarity) / 4,
                );

                const now = new Date().toISOString();
                saveSession({
                  sessionId: sessionId ?? undefined,
                  userId: userId ?? undefined,
                  createdAt: now,
                  dateTime: now,
                  overall,
                  confidence: Math.round(metrics.confidence),
                  tempo: metrics.tempo,
                  fillers: metrics.fillers,
                  clarity: Math.round(metrics.clarity),
                  totalWords,
                  scenarioId: sc?.id,
                  scenarioTitle: sc?.title,
                  transcriptPreview: transcript
                    .filter((e) => e.speaker === "user")
                    .slice(0, 3)
                    .map((e) => e.text),
                  attemptComparisonSummary: latestAttemptComparison
                    ? {
                        originalText: latestAttemptComparison.original.transcriptText,
                        retryText: latestAttemptComparison.retry.transcriptText,
                        fillerBefore: latestAttemptComparison.original.fillerCount,
                        fillerAfter: latestAttemptComparison.retry.fillerCount,
                        wordCountBefore: latestAttemptComparison.original.wordCount,
                        wordCountAfter: latestAttemptComparison.retry.wordCount,
                        aiConfidenceBefore: latestAttemptComparison.original.aiScores?.confidence ?? null,
                        aiConfidenceAfter: latestAttemptComparison.retry.aiScores?.confidence ?? null,
                        verdict: verdict(latestAttemptComparison),
                      }
                    : undefined,
                });

                // Fire session review — non-blocking, summary page handles loading state
                useConversationStore.getState().setSessionReview(null);
                useConversationStore.getState().setSessionReviewLoading(true);
                requestSessionReview({
                  scenarioTitle: sc?.title ?? null,
                  transcript: transcript.map((e) => ({ speaker: e.speaker, text: e.text })),
                  metrics: {
                    confidence: Math.round(metrics.confidence),
                    tempo: metrics.tempo,
                    fillers: metrics.fillers,
                    clarity: Math.round(metrics.clarity),
                    totalWords,
                  },
                })
                  .then((review) => {
                    useConversationStore.getState().setSessionReview(review);
                    useConversationStore.getState().setSessionReviewLoading(false);
                  })
                  .catch(() => {
                    useConversationStore.getState().setSessionReviewLoading(false);
                  });

                router.push("/summary");
              }}
              className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs font-medium hover:bg-white/[0.07] hover:text-white/60 transition-colors"
            >
              End Session
            </button>
          )}
        </div>
      </div>

      {/* Right panel — Metrics */}
      <div className="w-80 xl:w-96 shrink-0 overflow-y-auto px-5 py-6 flex flex-col">
        <MetricsPanel />
        <AttemptComparisonCard />
        <div className="mt-auto pt-6">
          <button
            onClick={() => setShowOnboarding(true)}
            className="text-[11px] text-white/20 hover:text-white/45 transition-colors"
          >
            Show guide
          </button>
        </div>
      </div>
    </div>
  );
}
