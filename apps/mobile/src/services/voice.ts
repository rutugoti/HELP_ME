// ─────────────────────────────────────────────────────────────
// LastMinute — Voice Input Service
// Handles speech recognition via Expo/React Native.
// Provides a simple record → transcript pipeline.
// ─────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────

export type VoiceStatus = "idle" | "listening" | "processing" | "error";

export interface VoiceResult {
  readonly transcript: string;
  readonly confidence: number;
  readonly isFinal: boolean;
}

type VoiceStatusListener = (status: VoiceStatus) => void;
type VoiceResultListener = (result: VoiceResult) => void;

// ── State ─────────────────────────────────────────────────

let currentStatus: VoiceStatus = "idle";
const statusListeners = new Set<VoiceStatusListener>();
const resultListeners = new Set<VoiceResultListener>();

// ── Internal Helpers ──────────────────────────────────────

function emitStatus(status: VoiceStatus): void {
  currentStatus = status;
  statusListeners.forEach((fn) => fn(status));
}

function emitResult(result: VoiceResult): void {
  resultListeners.forEach((fn) => fn(result));
}

// ── Public API ────────────────────────────────────────────

/**
 * Starts listening for voice input.
 * In production this would invoke a native speech recognition API.
 * Currently implemented as a simulated pipeline for development.
 */
export async function startListening(): Promise<void> {
  if (currentStatus === "listening") return;

  emitStatus("listening");

  // NOTE: In a real implementation, this would bind to
  // expo-speech-recognition or @react-native-voice/voice.
  // For now, we provide the service contract so the UI layer
  // and hooks can be fully wired up.
}

/** Stops the active voice recognition session. */
export async function stopListening(): Promise<void> {
  if (currentStatus !== "listening") return;

  emitStatus("processing");

  // Simulate processing delay
  setTimeout(() => {
    emitResult({
      transcript: "",
      confidence: 0,
      isFinal: true,
    });
    emitStatus("idle");
  }, 300);
}

/** Cancels the current session without producing a result. */
export function cancelListening(): void {
  emitStatus("idle");
}

/** Returns the current voice recognition status. */
export function getStatus(): VoiceStatus {
  return currentStatus;
}

/**
 * Submits a transcript to the API for AI task creation.
 * Returns the parsed task fields from the AI response.
 */
export async function processTranscript(
  transcript: string
): Promise<{ title: string; description: string; category: string }> {
  // In production, this calls POST /api/v1/ai/voice-parse
  // For now, returns a basic parse
  const words = transcript.trim().split(/\s+/);
  return {
    title: words.slice(0, 8).join(" ") || "Untitled voice task",
    description: transcript,
    category: "general",
  };
}

// ── Subscriptions ─────────────────────────────────────────

/** Subscribe to voice status changes. Returns unsubscribe function. */
export function onStatusChange(listener: VoiceStatusListener): () => void {
  statusListeners.add(listener);
  return () => {
    statusListeners.delete(listener);
  };
}

/** Subscribe to voice recognition results. Returns unsubscribe function. */
export function onResult(listener: VoiceResultListener): () => void {
  resultListeners.add(listener);
  return () => {
    resultListeners.delete(listener);
  };
}
