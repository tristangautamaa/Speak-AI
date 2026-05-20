"use client";

import { useMicrophone } from "@/hooks/useMicrophone";
import { useConversationStore, type MicStatus } from "@/store/conversationStore";

interface MicButtonProps {
  size?: "sm" | "lg";
}

function label(micStatus: MicStatus): string {
  if (micStatus === "listening") return "Session Active";
  if (micStatus === "requesting") return "Requesting...";
  if (micStatus === "error") return "Mic Error";
  if (micStatus === "paused") return "Listening Paused";
  return "Start Session";
}

export default function MicButton({ size = "lg" }: MicButtonProps) {
  const { micStatus, toggle } = useMicrophone();
  const { micError } = useConversationStore();

  const isListening = micStatus === "listening";
  const isRequesting = micStatus === "requesting";
  const isError = micStatus === "error";
  const isPaused = micStatus === "paused";
  const isOff = micStatus === "off" || isError || isPaused;

  const dim = size === "lg" ? "w-20 h-20" : "w-12 h-12";
  const iconSize = size === "lg" ? 28 : 18;

  return (
    <div className="flex flex-col items-center gap-3">
      {size === "lg" && isListening && (
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Microphone Active
        </span>
      )}

      <div className="relative">
        {isListening && (
          <span className="absolute inset-0 rounded-full bg-indigo-500/30 pulse-ring" />
        )}
        <button
          onClick={toggle}
          disabled={isRequesting}
          aria-label={isListening ? "Stop microphone" : "Start microphone"}
          className={`
            relative ${dim} rounded-full flex items-center justify-center
            transition-all duration-200
            ${isRequesting ? "cursor-wait opacity-60" : "cursor-pointer"}
            ${
              isError
                ? "bg-red-500/20 border border-red-500/30 hover:bg-red-500/30"
                : isPaused
                ? "bg-white/[0.07] border border-white/10 hover:bg-white/[0.12]"
                : isOff
                ? "bg-white/10 border border-white/10 hover:bg-white/15"
                : isListening
                ? "bg-indigo-500 hover:bg-indigo-400 shadow-lg shadow-indigo-500/40"
                : isRequesting
                ? "bg-indigo-500/40 border border-indigo-500/30"
                : "bg-indigo-500/60 hover:bg-indigo-500/80"
            }
          `}
        >
          {isOff ? (
            <MicOffIcon size={iconSize} />
          ) : (
            <MicIcon size={iconSize} />
          )}
        </button>
      </div>

      {size === "lg" && (
        <>
          <span className={`text-xs tracking-widest uppercase ${isError ? "text-red-400/70" : isPaused ? "text-white/50" : "text-white/30"}`}>
            {label(micStatus)}
          </span>
          {isError && micError && (
            <span className="text-xs text-red-400/60 max-w-[160px] text-center leading-tight">
              {micError}
            </span>
          )}
          {isPaused && (
            <span className="text-xs text-white/30 max-w-[160px] text-center leading-tight">
              Click mic to continue.
            </span>
          )}
        </>
      )}
    </div>
  );
}

function MicIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" fill="white" />
      <path
        d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MicOffIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 9V13C9 14.6569 10.3431 16 12 16C13.6569 16 15 14.6569 15 13V11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="9" y="2" width="6" height="8" rx="3" fill="white" opacity="0.4" />
      <path
        d="M5 11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line x1="12" y1="18" x2="12" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="3" y1="3" x2="21" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
