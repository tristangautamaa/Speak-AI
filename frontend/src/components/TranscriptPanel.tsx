"use client";

import { useConversationStore } from "@/store/conversationStore";
import { useEffect, useRef } from "react";

const PLACEHOLDER_TRANSCRIPT = [
  {
    id: "1",
    speaker: "ai" as const,
    text: "Hi, I'm your AI communication coach. Tell me about a situation where you'd like to improve your confidence.",
    timestamp: Date.now() - 12000,
  },
  {
    id: "2",
    speaker: "user" as const,
    text: "Um, I usually struggle with, uh, public speaking. Like presentations at work.",
    timestamp: Date.now() - 8000,
  },
  {
    id: "3",
    speaker: "ai" as const,
    text: "That's a great starting point. Let's work on that together. Try introducing yourself as if you're starting a presentation right now.",
    timestamp: Date.now() - 4000,
  },
];

export default function TranscriptPanel() {
  const { transcript, status } = useConversationStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  const entries = transcript.length > 0 ? transcript : PLACEHOLDER_TRANSCRIPT;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Transcript
        </h2>
        {status === "active" && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Live
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={`flex gap-3 ${entry.speaker === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-medium ${
                entry.speaker === "ai"
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "bg-white/10 text-white/60"
              }`}
            >
              {entry.speaker === "ai" ? "AI" : "You"}
            </div>
            <div
              className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                entry.speaker === "ai"
                  ? "bg-white/5 text-white/80 rounded-tl-sm"
                  : "bg-indigo-500/15 text-white/90 rounded-tr-sm"
              }`}
            >
              {entry.text}
            </div>
          </div>
        ))}

        {status === "active" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 shrink-0 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-medium text-indigo-400">
              AI
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white/5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
