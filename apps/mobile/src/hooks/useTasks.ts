// ─────────────────────────────────────────────────────────────
// LastMinute — useTasks Custom Hook
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useTaskStore } from "../store/taskStore";
import { TaskListQuery } from "@lastminute/schemas";

export const useTasks = (initialQuery: TaskListQuery = { limit: 50 }) => {
  const { tasks, isLoading, error, fetchTasks, startTask, completeTask } = useTaskStore();
  const [query, setQuery] = useState<TaskListQuery>(initialQuery);

  useEffect(() => {
    fetchTasks(query);
  }, [query, fetchTasks]);

  const refetch = async () => {
    await fetchTasks(query);
  };

  const updateFilters = (newFilters: Partial<TaskListQuery>) => {
    setQuery((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    tasks,
    isLoading,
    error,
    refetch,
    updateFilters,
    startTask,
    completeTask,
    query,
  };
};
