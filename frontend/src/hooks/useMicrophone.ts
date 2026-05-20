"use client";

import { useRef, useCallback, useEffect } from "react";
import { useConversationStore } from "@/store/conversationStore";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { generateCoachResponse } from "@/lib/coachResponses";

export function useMicrophone() {
  const {
    micStatus,
    setMicStatus,
    setMicError,
    setStatus,
    addTranscriptEntry,
  } = useConversationStore();

  // Buffer interim results so we only commit final transcripts
  const interimBufferRef = useRef<string>("");

  const handleResult = useCallback(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        interimBufferRef.current = "";
        addTranscriptEntry({ speaker: "user", text, timestamp: Date.now() });
        setTimeout(() => {
          addTranscriptEntry({
            speaker: "ai",
            text: generateCoachResponse(text),
            timestamp: Date.now(),
          });
        }, 700);
      } else {
        interimBufferRef.current = text;
      }
    },
    [addTranscriptEntry],
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
