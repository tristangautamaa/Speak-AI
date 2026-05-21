"use client";

import { useRef, useCallback, useEffect } from "react";
import { useConversationStore } from "@/store/conversationStore";
import { useSpeechRecognition } from "./useSpeechRecognition";
import { generateCoachResponse, shouldShowRetry } from "@/lib/coachResponses";
import { requestCoachResponse } from "@/services/coachApi";
import { countFillers } from "@/lib/scoring";

export function useMicrophone() {
  const {
    micStatus,
    setMicStatus,
    setMicError,
    setStatus,
    addTranscriptEntry,
    setCoachResponseSource,
    setLatestAiAnalysis,
    setPendingRetryOriginalAttempt,
    setLatestAttemptComparison,
    metrics,
    selectedScenario,
  } = useConversationStore();

  // Buffer interim results so we only commit final transcripts
  const interimBufferRef = useRef<string>("");
  // Refs keep latest values accessible in callbacks without causing re-creation
  const metricsRef = useRef(metrics);
  useEffect(() => { metricsRef.current = metrics; }, [metrics]);
  const scenarioRef = useRef(selectedScenario);
  useEffect(() => { scenarioRef.current = selectedScenario; }, [selectedScenario]);

  const handleResult = useCallback(
    async (text: string, isFinal: boolean) => {
      if (isFinal) {
        interimBufferRef.current = "";
        const pendingSnapshot = useConversationStore.getState().pendingRetryOriginalAttempt;
        addTranscriptEntry({ speaker: "user", text, timestamp: Date.now() });
        try {
          const sc = scenarioRef.current;
          const scenarioContext = sc
            ? { scenarioId: sc.id, persona: sc.persona, coachingFocus: sc.coachingFocus, tone: sc.tone }
            : undefined;
          const result = await requestCoachResponse(text, metricsRef.current, scenarioContext);
          setCoachResponseSource("openai");
          setLatestAiAnalysis(
            result.aiScores ?? null,
            result.detectedIssues ?? [],
            result.rewriteSuggestion ?? null,
          );
          if (pendingSnapshot) {
            setPendingRetryOriginalAttempt(null);
            setLatestAttemptComparison({
              original: pendingSnapshot,
              retry: {
                transcriptText: text,
                fillerCount: countFillers(text),
                wordCount: text.split(/\s+/).filter(Boolean).length,
                aiScores: result.aiScores ?? null,
              },
            });
          }
          const displayText = result.nextPrompt
            ? `${result.coachResponse}\n${result.nextPrompt}`
            : result.coachResponse;
          addTranscriptEntry({
            speaker: "ai",
            text: displayText,
            timestamp: Date.now(),
            showRetry: result.practiceAgain,
          });
        } catch {
          // Backend unavailable — fall back to local rule-based response
          setCoachResponseSource("fallback");
          setLatestAiAnalysis(null, [], null);
          if (pendingSnapshot) {
            setPendingRetryOriginalAttempt(null);
            setLatestAttemptComparison({
              original: pendingSnapshot,
              retry: {
                transcriptText: text,
                fillerCount: countFillers(text),
                wordCount: text.split(/\s+/).filter(Boolean).length,
                aiScores: null,
              },
            });
          }
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
    [addTranscriptEntry, setCoachResponseSource, setLatestAiAnalysis, setPendingRetryOriginalAttempt, setLatestAttemptComparison],
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
