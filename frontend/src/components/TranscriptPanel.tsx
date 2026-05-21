"use client";

import { useConversationStore } from "@/store/conversationStore";
import { countFillers } from "@/lib/scoring";
import { useCallback, useEffect, useRef } from "react";

export default function TranscriptPanel() {
  const { transcript, status, addRetryPrompt, coachResponseSource, setPendingRetryOriginalAttempt } = useConversationStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Only the last real AI entry with showRetry gets the button
  const lastRetryId = [...transcript]
    .reverse()
    .find((e) => e.speaker === "ai" && e.showRetry)?.id ?? null;

  const handleRetry = useCallback(() => {
    const { transcript: tx, latestAiScores } = useConversationStore.getState();
    const lastUserEntry = [...tx].reverse().find((e) => e.speaker === "user");
    if (lastUserEntry) {
      const words = lastUserEntry.text.split(/\s+/).filter(Boolean);
      setPendingRetryOriginalAttempt({
        transcriptText: lastUserEntry.text,
        fillerCount: countFillers(lastUserEntry.text),
        wordCount: words.length,
        aiScores: latestAiScores,
      });
    }
    addRetryPrompt();
  }, [addRetryPrompt, setPendingRetryOriginalAttempt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
          Transcript
        </h2>
        {process.env.NODE_ENV === "development" && coachResponseSource !== null && (
          <span className="text-[10px] text-white/25 font-mono">
            Coach: {coachResponseSource === "openai" ? "OpenAI" : "Local fallback"}
          </span>
        )}
        {status === "active" && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            Live
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {transcript.map((entry) => (
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
            <div className="flex flex-col gap-2 max-w-[80%]">
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  entry.speaker === "ai"
                    ? "bg-white/5 text-white/80 rounded-tl-sm"
                    : "bg-indigo-500/15 text-white/90 rounded-tr-sm"
                }`}
              >
                {entry.text}
              </div>
              {entry.id === lastRetryId && (
                <button
                  onClick={handleRetry}
                  className="self-start px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300/70 text-xs font-medium hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors"
                >
                  Try again
                </button>
              )}
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
