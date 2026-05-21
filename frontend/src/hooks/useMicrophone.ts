"use client";

import { useRef, useCallback, useEffect } from "react";
import { useConversationStore } from "@/store/conversationStore";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { generateCoachResponse, shouldShowRetry } from "@/lib/coachResponses";
import { requestCoachResponse } from "@/services/coachApi";

export function useMicrophone() {
  const {
    micStatus,
    setMicStatus,
    setMicError,
    setStatus,
    addTranscriptEntry,
    setCoachResponseSource,
    metrics,
  } = useConversationStore();

  // Buffer interim results so we only commit final transcripts
  const interimBufferRef = useRef<string>("");
  // Ref keeps latest metrics accessible in the callback without causing re-creation
  const metricsRef = useRef(metrics);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);

  const handleResult = useCallback(
    async (text: string, isFinal: boolean) => {
      if (isFinal) {
        interimBufferRef.current = "";
        addTranscriptEntry({ speaker: "user", text, timestamp: Date.now() });
        try {
          const result = await requestCoachResponse(text, metricsRef.current);
          setCoachResponseSource("openai");
          addTranscriptEntry({
            speaker: "ai",
            text: result.coachResponse,
            timestamp: Date.now(),
            showRetry: result.practiceAgain,
          });
        } catch {
          // Backend unavailable — fall back to local rule-based response
          setCoachResponseSource("fallback");
          addTranscriptEntry({
            speaker: "ai",
            text: generateCoachResponse(text),
            timestamp: Date.now(),
            showRetry: shouldShowRetry(text),
          });
        }
      } else {
        interimBufferRef.current = text;
      }
    },
    [addTranscriptEntry, setCoachResponseSource],
  );

  const handleError = useCallback(
    (error: string) => {
      setMicStatus("error");
      setMicError(error);
      setStatus("idle");
    },
    [setMicStatus, setMicError, setStatus],
  );

  const handleNoSpeech = useCallback(() => {
    setMicStatus("paused");
    setMicError(null);
    setStatus("idle");
  }, [setMicStatus, setMicError, setStatus]);

  const handleEnd = useCallback(() => {
    setMicStatus("off");
    setStatus("idle");
  }, [setMicStatus, setStatus]);

  const { start: startRecognition, stop: stopRecognition } =
    useSpeechRecognition({
      onResult: handleResult,
      onError: handleError,
      onNoSpeech: handleNoSpeech,
      onEnd: handleEnd,
    });

  const start = useCallback(() => {
    if (micStatus === "listening") return;
    setMicStatus("requesting");
    setMicError(null);

    // Request mic permission first so we can surface a clear error
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setMicStatus("listening");
        setStatus("active");
        startRecognition();
      })
      .catch(() => {
        setMicStatus("error");
        setMicError("Microphone permission denied.");
        setStatus("idle");
      });
  }, [micStatus, setMicStatus, setMicError, setStatus, startRecognition]);

  const stop = useCallback(() => {
    stopRecognition();
    interimBufferRef.current = "";
    setMicStatus("off");
    setStatus("idle");
  }, [stopRecognition, setMicStatus, setStatus]);

  const toggle = useCallback(() => {
    if (micStatus === "listening") {
      stop();
    } else {
      start();
    }
  }, [micStatus, start, stop]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
    };
  }, [stopRecognition]);

  return { micStatus, start, stop, toggle };
}
