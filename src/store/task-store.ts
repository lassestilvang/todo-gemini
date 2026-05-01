import { create } from "zustand";
import type { Task } from "@/types";

// This will be a more complex type once relations are included
type TaskWithRelations = Task;

interface TaskState {
  tasks: TaskWithRelations[];
  searchResults: TaskWithRelations[];
  counts: { today: number; inbox: number; all: number };
  isLoading: boolean;
  error: string | null;
  fetchTasks: (listId?: string, showCompleted?: boolean) => Promise<void>;
  fetchTodayTasks: (showCompleted?: boolean) => Promise<void>;
  fetchNext7DaysTasks: (showCompleted?: boolean) => Promise<void>;
  fetchUpcomingTasks: (showCompleted?: boolean) => Promise<void>;
  searchTasks: (query: string) => Promise<void>;
  clearSearchResults: () => void;
  fetchCounts: () => Promise<void>;
  addTask: (
    newTask: Omit<
      Task,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "completed"
      | "recurring"
      | "actualTime"
    >,
  ) => Promise<void>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  setError: (error: string | null) => void;
  fetchTaskById: (taskId: string) => Promise<TaskWithRelations | null>;
  _fetchTasksInternal: (url: string, errorMessage: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  searchResults: [],
  counts: { today: 0, inbox: 0, all: 0 },
  isLoading: false,
  error: null,
  fetchTasks: async (listId, showCompleted) => {
    let url = listId ? `/api/tasks?listId=${listId}` : "/api/tasks";
    if (showCompleted !== undefined) {
      url += `${listId ? "&" : "?"}showCompleted=${showCompleted}`;
    }
    await get()._fetchTasksInternal(url, "Failed to fetch tasks");
  },
  fetchTodayTasks: async (showCompleted) => {
    let url = "/api/tasks/today";
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    await get()._fetchTasksInternal(url, "Failed to fetch today's tasks");
  },
  fetchNext7DaysTasks: async (showCompleted) => {
    let url = "/api/tasks/next-7-days";
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    await get()._fetchTasksInternal(url, "Failed to fetch next 7 days tasks");
  },
  fetchUpcomingTasks: async (showCompleted) => {
    let url = "/api/tasks/upcoming";
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    await get()._fetchTasksInternal(url, "Failed to fetch upcoming tasks");
  },
  _fetchTasksInternal: async (url: string, errorMessage: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(errorMessage);
      const tasks = await response.json();
      set({ tasks });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : errorMessage,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  searchTasks: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/search?query=${query}`);
      if (!response.ok) throw new Error("Search failed");
      const searchResults = await response.json();
      set({ searchResults });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Search failed" });
    } finally {
      set({ isLoading: false });
    }
  },
  clearSearchResults: () => set({ searchResults: [] }),
  fetchCounts: async () => {
    try {
      const response = await fetch("/api/tasks/counts");
      if (!response.ok) throw new Error("Failed to fetch counts");
      const counts = await response.json();
      set({ counts });
    } catch (err) {
      console.error("Failed to fetch counts:", err);
    }
  },
  addTask: async (newTask) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) throw new Error("Failed to add task");
      const createdTask = await response.json();
      set((state) => ({ tasks: [...state.tasks, createdTask] }));
      get().fetchCounts();
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to add task" });
    } finally {
      set({ isLoading: false });
    }
  },
  updateTask: async (taskId, updatedTask) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });
      if (!response.ok) throw new Error("Failed to update task");
      const returnedTask = await response.json();

      const updateRecursive = (
        tasks: TaskWithRelations[],
      ): TaskWithRelations[] => {
        return tasks.map((task) => {
          if (task.id === taskId) {
            return { ...returnedTask, subTasks: task.subTasks };
          }
          if (task.subTasks && task.subTasks.length > 0) {
            return { ...task, subTasks: updateRecursive(task.subTasks) };
          }
          return task;
        });
      };

      set((state) => ({
        tasks: updateRecursive(state.tasks),
        searchResults: updateRecursive(state.searchResults),
      }));
      get().fetchCounts();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update task",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  deleteTask: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete task");

      const deleteRecursive = (
        tasks: TaskWithRelations[],
      ): TaskWithRelations[] => {
        return tasks
          .filter((task) => task.id !== taskId)
          .map((task) => {
            if (task.subTasks && task.subTasks.length > 0) {
              return { ...task, subTasks: deleteRecursive(task.subTasks) };
            }
            return task;
          });
      };

      set((state) => ({
        tasks: deleteRecursive(state.tasks),
        searchResults: deleteRecursive(state.searchResults),
      }));
      get().fetchCounts();
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete task",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  clearCompletedTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/tasks?completed=true", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to clear completed tasks");

      set((state) => ({
        tasks: state.tasks.filter((t) => !t.completed),
        searchResults: state.searchResults.filter((t) => !t.completed),
      }));
      get().fetchCounts();
    } catch (err) {
      set({
        error:
          err instanceof Error
            ? err.message
            : "Failed to clear completed tasks",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  setError: (error) => set({ error }),
  fetchTaskById: async (taskId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch task");
      const task = await response.json();
      return task;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch task",
      });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },
}));
