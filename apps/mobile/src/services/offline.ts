// ─────────────────────────────────────────────────────────────
// LastMinute — Offline Queue Service
// Queues mutating API calls when offline and replays them
// when connectivity is restored.
// ─────────────────────────────────────────────────────────────

import { config } from "../constants/config";
import * as storage from "./storage";

// ── Types ─────────────────────────────────────────────────

export type OfflineAction =
  | "task:create"
  | "task:update"
  | "task:start"
  | "task:complete"
  | "goal:create"
  | "habit:log"
  | "notification:read"
  | "notification:acted";

export interface QueuedOperation {
  readonly id: string;
  readonly action: OfflineAction;
  readonly payload: unknown;
  readonly enqueuedAt: string;
  retryCount: number;
}

type QueueChangeListener = (queue: ReadonlyArray<QueuedOperation>) => void;

// ── State ─────────────────────────────────────────────────

let queue: QueuedOperation[] = [];
let isProcessing = false;
const listeners = new Set<QueueChangeListener>();

const STORAGE_KEY = config.offlineQueueStorageKey;
const MAX_RETRIES = 5;

// ── Persistence ───────────────────────────────────────────

/** Loads the offline queue from secure storage. */
export async function loadQueue(): Promise<void> {
  const saved = await storage.getSecureJSON<QueuedOperation[]>(STORAGE_KEY);
  queue = saved ?? [];
  notifyListeners();
}

/** Persists the current queue to storage. */
async function persistQueue(): Promise<void> {
  await storage.setSecureJSON(STORAGE_KEY, queue);
}

// ── Public API ────────────────────────────────────────────

/** Enqueues a new operation for offline replay. */
export async function enqueue(action: OfflineAction, payload: unknown): Promise<void> {
  const operation: QueuedOperation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    payload,
    enqueuedAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(operation);
  await persistQueue();
  notifyListeners();
}

/** Removes a specific operation from the queue (e.g. after successful replay). */
export async function dequeue(operationId: string): Promise<void> {
  queue = queue.filter((op) => op.id !== operationId);
  await persistQueue();
  notifyListeners();
}

/** Returns the current queue snapshot. */
export function getQueue(): ReadonlyArray<QueuedOperation> {
  return queue;
}

/** Returns the number of pending operations. */
export function getPendingCount(): number {
  return queue.length;
}

/**
 * Processes all queued operations sequentially.
 * Called when network connectivity is restored.
 * @param executor — function that executes a single operation against the API
 */
export async function processQueue(
  executor: (op: QueuedOperation) => Promise<boolean>
): Promise<{ succeeded: number; failed: number }> {
  if (isProcessing || queue.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  isProcessing = true;
  let succeeded = 0;
  let failed = 0;

  // Process in FIFO order
  const snapshot = [...queue];
  for (const operation of snapshot) {
    try {
      const success = await executor(operation);
      if (success) {
        await dequeue(operation.id);
        succeeded++;
      } else {
        operation.retryCount++;
        if (operation.retryCount >= MAX_RETRIES) {
          await dequeue(operation.id);
          failed++;
        }
      }
    } catch {
      operation.retryCount++;
      if (operation.retryCount >= MAX_RETRIES) {
        await dequeue(operation.id);
        failed++;
      }
    }
  }

  await persistQueue();
  isProcessing = false;
  notifyListeners();

  return { succeeded, failed };
}

/** Clears the entire offline queue. */
export async function clearQueue(): Promise<void> {
  queue = [];
  await persistQueue();
  notifyListeners();
}

/** Returns true if the queue is currently being processed. */
export function isQueueProcessing(): boolean {
  return isProcessing;
}

// ── Subscriptions ─────────────────────────────────────────

/** Subscribe to queue changes. Returns unsubscribe function. */
export function onQueueChange(listener: QueueChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  const snapshot = [...queue];
  listeners.forEach((fn) => fn(snapshot));
}
