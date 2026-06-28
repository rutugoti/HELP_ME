import type { UUID } from "./common.js";

/** WebSocket event types pushed from server to client. */
export enum WebSocketEventType {
  TaskPriorityUpdated = "task.priority-updated",
  TaskActionReady = "task.action-ready",
  RecommendationNew = "recommendation.new",
  NotificationNew = "notification.new",
  FocusBlockBooked = "focus-block.booked",
}

/** Base WebSocket message envelope. */
export interface WebSocketMessage<T = unknown> {
  readonly type: WebSocketEventType;
  readonly payload: T;
  readonly timestamp: string;
}

/** Payload for task.priority-updated event. */
export interface TaskPriorityUpdatedPayload {
  readonly taskId: UUID;
  readonly totalScore: number;
  readonly deadlineProximityScore: number;
  readonly dependencyImpactScore: number;
  readonly consequenceSeverityScore: number;
  readonly priorityTier: string;
}

/** Payload for task.action-ready event. */
export interface TaskActionReadyPayload {
  readonly taskId: UUID;
}

/** Payload for focus-block.booked event. */
export interface FocusBlockBookedPayload {
  readonly blockId: UUID;
  readonly taskId: UUID;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly durationMinutes: number;
}
