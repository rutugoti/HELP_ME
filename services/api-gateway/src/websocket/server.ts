// ─────────────────────────────────────────────────────────────
// LastMinute — WebSocket Server
// Authenticated WebSocket connections for real-time push events per Api.md.
// Events: task.priority-updated, task.action-ready, recommendation.new,
//         notification.new, focus-block.booked
// ─────────────────────────────────────────────────────────────

import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer, IncomingMessage } from "http";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { logger } from "../config/logger.js";
import type { WebSocketEventType } from "@lastminute/types";

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface WebSocketPayload {
  type: WebSocketEventType;
  payload: unknown;
  timestamp: string;
}

/** Map of userId → Set of active WebSocket connections. */
const connections = new Map<string, Set<AuthenticatedSocket>>();

/**
 * Initializes the WebSocket server on the same HTTP server as the gateway.
 */
export function initWebSocketServer(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: AuthenticatedSocket, req: IncomingMessage) => {
    // Authenticate via query parameter token
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (!token) {
      ws.close(4001, "Authentication required.");
      return;
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
      ws.userId = payload.userId;
      ws.isAlive = true;

      // Register connection
      if (!connections.has(payload.userId)) {
        connections.set(payload.userId, new Set());
      }
      connections.get(payload.userId)!.add(ws);

      logger.info("WebSocket connection established", { userId: payload.userId });

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      ws.on("close", () => {
        if (ws.userId) {
          const userConns = connections.get(ws.userId);
          if (userConns) {
            userConns.delete(ws);
            if (userConns.size === 0) {
              connections.delete(ws.userId);
            }
          }
          logger.info("WebSocket connection closed", { userId: ws.userId });
        }
      });

      ws.on("error", (err) => {
        logger.error("WebSocket error", { userId: ws.userId, error: err.message });
      });
    } catch {
      ws.close(4001, "Invalid or expired token.");
    }
  });

  // Heartbeat ping interval to detect dead connections
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const socket = ws as AuthenticatedSocket;
      if (socket.isAlive === false) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30000);

  wss.on("close", () => {
    clearInterval(heartbeatInterval);
  });

  logger.info("WebSocket server initialized on /ws");
  return wss;
}

/**
 * Pushes a real-time event to a specific user's active WebSocket connections.
 */
export function pushToUser(userId: string, event: WebSocketPayload): void {
  const userConns = connections.get(userId);
  if (!userConns || userConns.size === 0) {
    logger.debug("No active WebSocket connections for user, event not delivered", {
      userId,
      eventType: event.type,
    });
    return;
  }

  const message = JSON.stringify(event);
  for (const ws of userConns) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }

  logger.debug("Pushed WebSocket event to user", {
    userId,
    eventType: event.type,
    connectionCount: userConns.size,
  });
}

/**
 * Returns the number of active connections (useful for health checks).
 */
export function getActiveConnectionCount(): number {
  let count = 0;
  for (const conns of connections.values()) {
    count += conns.size;
  }
  return count;
}
