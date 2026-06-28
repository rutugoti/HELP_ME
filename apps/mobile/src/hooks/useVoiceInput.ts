// ─────────────────────────────────────────────────────────────
// LastMinute — useVoiceInput Hook
// Manages voice recognition lifecycle, transcript state,
// and AI-powered parsing for task creation.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from "react";
import * as voiceService from "../services/voice";
import type { VoiceStatus, VoiceResult } from "../services/voice";
import * as analytics from "../services/analytics";

interface ParsedVoiceTask {
  title: string;
  description: string;
  category: string;
}

interface UseVoiceInputReturn {
  /** Current voice recognition status. */
  status: VoiceStatus;
  /** Whether the service is actively listening. */
  isListening: boolean;
  /** Whether the service is processing audio. */
  isProcessing: boolean;
  /** The latest transcript text. */
  transcript: string;
  /** Confidence score (0-1) of the latest transcript. */
  confidence: number;
  /** Parsed task from the transcript (available after processing). */
  parsedTask: ParsedVoiceTask | null;
  /** Error message if recognition failed. */
  error: string | null;
  /** Start listening for voice input. */
  startListening: () => Promise<void>;
  /** Stop listening and process the result. */
  stopListening: () => Promise<void>;
  /** Cancel without processing. */
  cancel: () => void;
  /** Reset all state. */
  reset: () => void;
}

export const useVoiceInput = (): UseVoiceInputReturn => {
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [parsedTask, setParsedTask] = useState<ParsedVoiceTask | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    const unsubStatus = voiceService.onStatusChange((newStatus) => {
      if (isMounted.current) {
        setStatus(newStatus);
        if (newStatus === "error") {
          setError("Voice recognition failed. Please try again.");
        }
      }
    });

    const unsubResult = voiceService.onResult((result: VoiceResult) => {
      if (!isMounted.current) return;

      setTranscript(result.transcript);
      setConfidence(result.confidence);

      if (result.isFinal && result.transcript.trim()) {
        // Auto-parse the transcript into a task
        voiceService.processTranscript(result.transcript).then((parsed) => {
          if (isMounted.current) {
            setParsedTask(parsed);
          }
        });
      }
    });

    return () => {
      isMounted.current = false;
      unsubStatus();
      unsubResult();
    };
  }, []);

  const startListening = useCallback(async () => {
    setError(null);
    setTranscript("");
    setConfidence(0);
    setParsedTask(null);
    analytics.track("voice_input_started");

    try {
      await voiceService.startListening();
    } catch {
      setError("Failed to start voice recognition.");
      setStatus("error");
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await voiceService.stopListening();
      analytics.track("voice_input_completed");
    } catch {
      setError("Failed to stop voice recognition.");
    }
  }, []);

  const cancel = useCallback(() => {
    voiceService.cancelListening();
    setTranscript("");
    setConfidence(0);
    setParsedTask(null);
    setError(null);
  }, []);

  const reset = useCallback(() => {
    voiceService.cancelListening();
    setStatus("idle");
    setTranscript("");
    setConfidence(0);
    setParsedTask(null);
    setError(null);
  }, []);

  return {
    status,
    isListening: status === "listening",
    isProcessing: status === "processing",
    transcript,
    confidence,
    parsedTask,
    error,
    startListening,
    stopListening,
    cancel,
    reset,
  };
};
