// ─────────────────────────────────────────────────────────────
// LastMinute — usePriorityScores Custom Hook
// ─────────────────────────────────────────────────────────────

import { useMemo } from "react";
import { useTaskStore } from "../store/taskStore";
import { PriorityTier, TaskStatus } from "@lastminute/types";

export const usePriorityScores = () => {
  const { tasks } = useTaskStore();

  const metrics = useMemo(() => {
    const activeTasks = tasks.filter(
      (t) => t.status === TaskStatus.Open || t.status === TaskStatus.InProgress
    );

    const counts = {
      [PriorityTier.Critical]: 0,
      [PriorityTier.High]: 0,
      [PriorityTier.Medium]: 0,
      [PriorityTier.Low]: 0,
    };

    let totalScoreSum = 0;
    let nextCriticalTask = null;
    let closestDeadlineMs = Infinity;

    for (const task of activeTasks) {
      // Increment tier counts
      if (task.priorityTier in counts) {
        counts[task.priorityTier]++;
      }

      totalScoreSum += task.priorityScore;

      // Find next critical/high task closest to deadline
      const deadlineTime = new Date(task.deadline).getTime();
      const now = Date.now();
      if (
        (task.priorityTier === PriorityTier.Critical || task.priorityTier === PriorityTier.High) &&
        deadlineTime > now &&
        deadlineTime < closestDeadlineMs
      ) {
        closestDeadlineMs = deadlineTime;
        nextCriticalTask = task;
      }
    }

    const averageScore =
      activeTasks.length > 0 ? Math.round(totalScoreSum / activeTasks.length) : 0;

    return {
      activeTasksCount: activeTasks.length,
      counts,
      averageScore,
      nextCriticalTask,
    };
  }, [tasks]);

  return metrics;
};
