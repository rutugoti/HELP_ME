// ─────────────────────────────────────────────────────────────
// LastMinute — useWebSocket Hook
// Connects/disconnects the WebSocket based on auth state
// and provides a subscribe function for real-time events.
// ─────────────────────────────────────────────────────────────

import { useEffect, useCallback, useState } from "react";
import * as ws from "../services/websocket";
import type { WSEvent, WSEventType } from "../services/websocket";
import { useAuthStore } from "../store/authStore";

interface UseWebSocketOptions {
  /** If true, auto-connect when the hook mounts and the user is authenticated. Default: true. */
  autoConnect?: boolean;
}

interface UseWebSocketReturn {
  /** Whether the WebSocket is currently connected. */
  isConnected: boolean;
  /** Manually connect the WebSocket. */
  connect: () => void;
  /** Manually disconnect the WebSocket. */
  disconnect: () => void;
  /** Subscribe to a specific event type. Returns an unsubscribe function. */
  on: (type: WSEventType, handler: (payload: unknown) => void) => () => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}): UseWebSocketReturn => {
  const { autoConnect = true } = options;
  const accessToken = useAuthStore((s) => s.accessToken);
  const [isConnected, setIsConnected] = useState(ws.isConnected());

  // Track connection status via polling (lightweight)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(ws.isConnected());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-connect when user is authenticated
  useEffect(() => {
    if (autoConnect && accessToken) {
      ws.connect();
    }
    return () => {
      // Don't disconnect on unmount — the connection is shared
    };
  }, [autoConnect, accessToken]);

  const connect = useCallback(() => {
    ws.connect();
  }, []);

  const disconnect = useCallback(() => {
    ws.disconnect();
  }, []);

  const on = useCallback((type: WSEventType, handler: (payload: unknown) => void) => {
    return ws.subscribe((event: WSEvent) => {
      if (event.type === type) {
        handler(event.payload);
      }
    });
  }, []);

  return { isConnected, connect, disconnect, on };
};
