import { create } from "zustand";
import { type ConversationScenario } from "@/lib/scenarios";
import { type SessionReview } from "@/services/sessionReviewApi";
import { type AiScores } from "@/services/coachApi";

export interface RetryAttemptSnapshot {
  transcriptText: string;
  fillerCount: number;
  wordCount: number;
  aiScores: AiScores | null;
}

export interface AttemptComparison {
  original: RetryAttemptSnapshot;
  retry: RetryAttemptSnapshot;
}

type ConversationStatus = "idle" | "connecting" | "active" | "paused";
export type MicStatus = "off" | "requesting" | "listening" | "error" | "paused";
export type SocketStatus = "disconnected" | "connecting" | "connected";
export type CoachResponseSource = "openai" | "fallback" | null;

interface Metrics {
  confidence: number;
  tempo: number;
  fillers: number;
  clarity: number;
}

interface TranscriptEntry {
  id: string;
  speaker: "user" | "ai";
  text: string;
  timestamp: number;
  showRetry?: boolean;
}

interface ConversationState {
  status: ConversationStatus;
  isMuted: boolean;
  metrics: Metrics;
  transcript: TranscriptEntry[];

  micStatus: MicStatus;
  micError: string | null;

  socketStatus: SocketStatus;
  backendActive: boolean;
  coachResponseSource: CoachResponseSource;

  selectedScenario: ConversationScenario | null;
  sessionReview: SessionReview | null;
  sessionReviewLoading: boolean;

  sessionId: string | null;
  userId: string | null;

  latestAiScores: AiScores | null;
  latestDetectedIssues: string[];
  latestRewriteSuggestion: string | null;

  pendingRetryOriginalAttempt: RetryAttemptSnapshot | null;
  latestAttemptComparison: AttemptComparison | null;

  setStatus: (status: ConversationStatus) => void;
  toggleMute: () => void;
  setMetrics: (metrics: Partial<Metrics>) => void;
  addTranscriptEntry: (entry: Omit<TranscriptEntry, "id">) => void;
  addRetryPrompt: () => void;

  setMicStatus: (status: MicStatus) => void;
  setMicError: (error: string | null) => void;

  setSocketStatus: (status: SocketStatus) => void;
  setBackendActive: (active: boolean) => void;
  setCoachResponseSource: (source: CoachResponseSource) => void;

  setSelectedScenario: (scenario: ConversationScenario | null) => void;
  setSessionReview: (review: SessionReview | null) => void;
  setSessionReviewLoading: (loading: boolean) => void;

  setSessionId: (id: string | null) => void;
  setUserId: (id: string) => void;

  setLatestAiAnalysis: (scores: AiScores | null, issues: string[], rewrite: string | null) => void;

  setPendingRetryOriginalAttempt: (attempt: RetryAttemptSnapshot | null) => void;
  setLatestAttemptComparison: (comparison: AttemptComparison | null) => void;

  reset: () => void;
}

const defaultMetrics: Metrics = {
  confidence: 0,
  tempo: 0,
  fillers: 0,
  clarity: 0,
};

export const useConversationStore = create<ConversationState>((set) => ({
  status: "idle",
  isMuted: false,
  metrics: defaultMetrics,
  transcript: [],

  micStatus: "off",
  micError: null,

  socketStatus: "disconnected",
  backendActive: false,
  coachResponseSource: null,

  selectedScenario: null,
  sessionReview: null,
  sessionReviewLoading: false,

  sessionId: null,
  userId: null,

  latestAiScores: null,
  latestDetectedIssues: [],
  latestRewriteSuggestion: null,

  pendingRetryOriginalAttempt: null,
  latestAttemptComparison: null,

  setStatus: (status) => set({ status }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  setMetrics: (metrics) =>
    set((state) => ({ metrics: { ...state.metrics, ...metrics } })),
  addTranscriptEntry: (entry) =>
    set((state) => ({
      transcript: [
        ...state.transcript,
        { ...entry, id: crypto.randomUUID() },
      ],
    })),
  addRetryPrompt: () =>
    set((state) => ({
      transcript: [
        ...state.transcript,
        {
          id: crypto.randomUUID(),
          speaker: "ai",
          text: "Great. Say the same idea again, but slower and with fewer filler words.",
          timestamp: Date.now(),
        },
      ],
    })),

  setMicStatus: (micStatus) => set({ micStatus }),
  setMicError: (micError) => set({ micError }),

  setSocketStatus: (socketStatus) => set({ socketStatus }),
  setBackendActive: (backendActive) => set({ backendActive }),
  setCoachResponseSource: (coachResponseSource) => set({ coachResponseSource }),

  setSelectedScenario: (selectedScenario) => set({ selectedScenario }),
  setSessionReview: (sessionReview) => set({ sessionReview }),
  setSessionReviewLoading: (sessionReviewLoading) => set({ sessionReviewLoading }),

  setSessionId: (sessionId) => set({ sessionId }),
  setUserId: (userId) => set({ userId }),

  setLatestAiAnalysis: (latestAiScores, latestDetectedIssues, latestRewriteSuggestion) =>
    set({ latestAiScores, latestDetectedIssues, latestRewriteSuggestion }),

  setPendingRetryOriginalAttempt: (pendingRetryOriginalAttempt) => set({ pendingRetryOriginalAttempt }),
  setLatestAttemptComparison: (latestAttemptComparison) => set({ latestAttemptComparison }),

  reset: () =>
    set({
      status: "idle",
      isMuted: false,
      metrics: defaultMetrics,
      transcript: [],
      micStatus: "off",
      micError: null,
      socketStatus: "disconnected",
      backendActive: false,
      coachResponseSource: null,
      sessionId: null,
      latestAiScores: null,
      latestDetectedIssues: [],
      latestRewriteSuggestion: null,
      pendingRetryOriginalAttempt: null,
      latestAttemptComparison: null,
    }),
}));
