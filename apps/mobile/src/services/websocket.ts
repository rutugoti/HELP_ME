// ─────────────────────────────────────────────────────────────
// LastMinute — WebSocket Service
// Manages a persistent WebSocket connection for real-time
// events: priority changes, notifications, task updates.
// ─────────────────────────────────────────────────────────────

import { config } from "../constants/config";
import { useAuthStore } from "../store/authStore";

// ── Types ─────────────────────────────────────────────────

export type WSEventType =
  | "task:updated"
  | "task:priority_changed"
  | "notification:new"
  | "calendar:sync_complete"
  | "ai:recommendation"
  | "connection:ack"
  | "ping";

export interface WSEvent<T = unknown> {
  readonly type: WSEventType;
  readonly payload: T;
  readonly timestamp: string;
}

type WSEventHandler = (event: WSEvent) => void;

// ── State ─────────────────────────────────────────────────

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY_MS = 1000;

const handlers = new Set<WSEventHandler>();

// ── Public API ────────────────────────────────────────────

/** Opens a WebSocket connection with auth token. */
export function connect(): void {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return; // already connected or connecting
  }

  const token = useAuthStore.getState().accessToken;
  if (!token) return;

  const url = `${config.wsUrl}/ws?token=${encodeURIComponent(token)}`;
  ws = new WebSocket(url);

  ws.onopen = () => {
    reconnectAttempts = 0;
  };

  ws.onmessage = (messageEvent: MessageEvent) => {
    try {
      const event = JSON.parse(String(messageEvent.data)) as WSEvent;
      handlers.forEach((handler) => handler(event));
    } catch {
      // Ignore malformed messages
    }
  };

  ws.onerror = () => {
    // Error handling is done in onclose
  };

  ws.onclose = () => {
    ws = null;
    scheduleReconnect();
  };
}

/** Gracefully closes the WebSocket. */
export function disconnect(): void {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS; // prevent auto-reconnect
  if (ws) {
    ws.close();
    ws = null;
  }
}

/** Registers a handler to receive WebSocket events. Returns an unsubscribe function. */
export function subscribe(handler: WSEventHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

/** Returns true if the WebSocket is currently open. */
export function isConnected(): boolean {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

/** Sends a JSON-serialised message through the WebSocket. */
export function send<T>(type: string, payload: T): void {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

// ── Internal ──────────────────────────────────────────────

function scheduleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) return;

  const delay = Math.min(BASE_RECONNECT_DELAY_MS * Math.pow(2, reconnectAttempts), 30000);
  reconnectAttempts++;

  reconnectTimer = setTimeout(() => {
    connect();
  }, delay);
}
