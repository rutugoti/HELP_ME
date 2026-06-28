// ─────────────────────────────────────────────────────────────
// LastMinute — useOfflineQueue Hook
// Exposes offline queue state and replay controls to the UI.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback } from "react";
import * as offlineService from "../services/offline";
import type { QueuedOperation, OfflineAction } from "../services/offline";
import { tasksApi, goalsApi, notificationsApi } from "@lastminute/api-client";
import { api } from "../services/api";
import type { CreateTaskInput, UpdateTaskInput } from "@lastminute/schemas";

interface UseOfflineQueueReturn {
  /** Current queued operations. */
  queue: ReadonlyArray<QueuedOperation>;
  /** Number of pending operations. */
  pendingCount: number;
  /** Whether the queue is currently being replayed. */
  isProcessing: boolean;
  /** Enqueue a new operation for offline replay. */
  enqueue: (action: OfflineAction, payload: unknown) => Promise<void>;
  /** Replay all queued operations. */
  replay: () => Promise<{ succeeded: number; failed: number }>;
  /** Clear the entire queue. */
  clear: () => Promise<void>;
}

export const useOfflineQueue = (): UseOfflineQueueReturn => {
  const [queue, setQueue] = useState<ReadonlyArray<QueuedOperation>>(offlineService.getQueue());
  const [isProcessing, setIsProcessing] = useState(false);

  // Load persisted queue on mount and subscribe to changes
  useEffect(() => {
    offlineService.loadQueue();

    const unsub = offlineService.onQueueChange((updatedQueue) => {
      setQueue(updatedQueue);
      setIsProcessing(offlineService.isQueueProcessing());
    });
    return unsub;
  }, []);

  const enqueue = useCallback(async (action: OfflineAction, payload: unknown) => {
    await offlineService.enqueue(action, payload);
  }, []);

  const replay = useCallback(async () => {
    setIsProcessing(true);
    const result = await offlineService.processQueue(async (op) => {
      return executeOperation(op);
    });
    setIsProcessing(false);
    return result;
  }, []);

  const clear = useCallback(async () => {
    await offlineService.clearQueue();
  }, []);

  return {
    queue,
    pendingCount: queue.length,
    isProcessing,
    enqueue,
    replay,
    clear,
  };
};

// ── Operation Executor ────────────────────────────────────

async function executeOperation(op: QueuedOperation): Promise<boolean> {
  try {
    switch (op.action) {
      case "task:create":
        await tasksApi.createTask(api, op.payload as CreateTaskInput);
        return true;
      case "task:update": {
        const { taskId, input } = op.payload as { taskId: string; input: UpdateTaskInput };
        await tasksApi.updateTask(api, taskId, input);
        return true;
      }
      case "task:start":
        await tasksApi.startTask(api, op.payload as string);
        return true;
      case "task:complete":
        await tasksApi.completeTask(api, op.payload as string);
        return true;
      case "goal:create":
        // Payload shape matches CreateGoalInput
        await goalsApi.createGoal(api, op.payload as Parameters<typeof goalsApi.createGoal>[1]);
        return true;
      case "habit:log": {
        const { category, input } = op.payload as {
          category: string;
          input?: Parameters<typeof goalsApi.logHabit>[2];
        };
        await goalsApi.logHabit(api, category, input);
        return true;
      }
      case "notification:read":
        await notificationsApi.markRead(api, op.payload as string);
        return true;
      case "notification:acted":
        await notificationsApi.markActed(api, op.payload as string);
        return true;
      default:
        return false;
    }
  } catch {
    return false;
  }
}
