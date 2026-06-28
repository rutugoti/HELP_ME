// ─────────────────────────────────────────────────────────────
// LastMinute — Task Zustand Store
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { TaskListItem, UUID } from "@lastminute/types";
import { TaskListQuery } from "@lastminute/schemas";
import { api } from "../services/api";
import { tasksApi } from "@lastminute/api-client";

interface TaskState {
  tasks: TaskListItem[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: (query?: TaskListQuery) => Promise<void>;
  startTask: (taskId: UUID) => Promise<boolean>;
  completeTask: (taskId: UUID) => Promise<boolean>;
  setTasks: (tasks: TaskListItem[]) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.listTasks(api, query);
      if (response.status === "success") {
        set({ tasks: response.data, isLoading: false });
      } else {
        set({
          error: (response.data as unknown as string) || "Failed to fetch tasks",
          isLoading: false,
        });
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "An error occurred while fetching tasks";
      set({ error: errMsg, isLoading: false });
    }
  },

  startTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.startTask(api, taskId);
      if (response.status === "success") {
        // Refresh local task list
        const updatedTasks = get().tasks.map((task) =>
          task.id === taskId ? { ...task, ...response.data } : task
        );
        set({ tasks: updatedTasks as TaskListItem[], isLoading: false });
        return true;
      } else {
        set({
          error: (response.data as unknown as string) || "Failed to start task",
          isLoading: false,
        });
        return false;
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "An error occurred while starting the task";
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  completeTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await tasksApi.completeTask(api, taskId);
      if (response.status === "success") {
        // Refresh local task list
        const updatedTasks = get().tasks.map((task) =>
          task.id === taskId ? { ...task, ...response.data } : task
        );
        set({ tasks: updatedTasks as TaskListItem[], isLoading: false });
        return true;
      } else {
        set({
          error: (response.data as unknown as string) || "Failed to complete task",
          isLoading: false,
        });
        return false;
      }
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : "An error occurred while completing the task";
      set({ error: errMsg, isLoading: false });
      return false;
    }
  },

  setTasks: (tasks) => set({ tasks }),
}));
