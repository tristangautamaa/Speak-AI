import { create } from "zustand";

type ConversationStatus = "idle" | "connecting" | "active" | "paused";
export type MicStatus = "off" | "requesting" | "listening" | "error" | "paused";
export type SocketStatus = "disconnected" | "connecting" | "connected";

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

  setStatus: (status: ConversationStatus) => void;
  toggleMute: () => void;
  setMetrics: (metrics: Partial<Metrics>) => void;
  addTranscriptEntry: (entry: Omit<TranscriptEntry, "id">) => void;

  setMicStatus: (status: MicStatus) => void;
  setMicError: (error: string | null) => void;

  setSocketStatus: (status: SocketStatus) => void;
  setBackendActive: (active: boolean) => void;

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

  setMicStatus: (micStatus) => set({ micStatus }),
  setMicError: (micError) => set({ micError }),

  setSocketStatus: (socketStatus) => set({ socketStatus }),
  setBackendActive: (backendActive) => set({ backendActive }),

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
    }),
}));
