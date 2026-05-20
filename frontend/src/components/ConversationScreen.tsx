"use client";

import TranscriptPanel from "./TranscriptPanel";
import MetricsPanel from "./MetricsPanel";
import MicButton from "./MicButton";
import { useConversationStore } from "@/store/conversationStore";
import { useScoring } from "@/hooks/useScoring";

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

        {/* Mic button */}
        <div className="flex items-center justify-center py-8 border-t border-white/[0.05] bg-gradient-to-t from-black/40 to-transparent">
          <MicButton size="lg" />
        </div>
      </div>

      {/* Right panel — Metrics */}
      <div className="w-80 xl:w-96 shrink-0 overflow-y-auto px-5 py-6">
        <MetricsPanel />
      </div>
    </div>
  );
}
