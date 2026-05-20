"use client";

import { useRef, useCallback } from "react";

// Minimal types for the Web Speech API (Chrome-only, not in all TS dom libs)
interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): { transcript: string };
  [index: number]: { transcript: string };
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult;
  [index: number]: ISpeechRecognitionResult;
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => ISpeechRecognition;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as Record<string, unknown>;
  return (
    (w["SpeechRecognition"] as SpeechRecognitionConstructor | undefined) ??
    (w["webkitSpeechRecognition"] as SpeechRecognitionConstructor | undefined) ??
    null
  );
}

interface SpeechRecognitionOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onNoSpeech?: () => void;
  onEnd: () => void;
}

export function useSpeechRecognition({ onResult, onError, onNoSpeech, onEnd }: SpeechRecognitionOptions) {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isRunningRef = useRef(false);

  const start = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionConstructor();

    if (!SpeechRecognitionAPI) {
      onError("Speech recognition is not supported in this browser. Use Chrome.");
      return;
    }

    if (isRunningRef.current) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript.trim();
        if (text) {
          onResult(text, result.isFinal);
        }
      }
    };

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        isRunningRef.current = false;
        onNoSpeech?.();
        return;
      }
      const messages: Record<string, string> = {
        "not-allowed": "Microphone permission denied.",
        "audio-capture": "No microphone found.",
        "network": "Network error during recognition.",
      };
      onError(messages[event.error] ?? `Speech error: ${event.error}`);
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be running (Chrome stops after silence)
      if (isRunningRef.current) {
        try {
          recognition.start();
        } catch {
          // May already be restarting; ignore
        }
      } else {
        onEnd();
      }
    };

    recognitionRef.current = recognition;
    isRunningRef.current = true;

    try {
      recognition.start();
    } catch {
      onError("Failed to start speech recognition.");
      isRunningRef.current = false;
    }
  }, [onResult, onError, onNoSpeech, onEnd]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }, []);

  return { start, stop };
}
