"use client";

import { useEffect } from "react";
import { useConversationStore } from "@/store/conversationStore";
import { scoreTranscript } from "@/lib/scoring";

export function useScoring() {
  const { transcript, status, setMetrics } = useConversationStore();

  useEffect(() => {
    if (status !== "active") return;
    const scored = scoreTranscript(transcript);
    setMetrics(scored);
  }, [transcript, status, setMetrics]);
}
