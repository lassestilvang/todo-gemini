import { create } from "zustand";
import type { Task } from "@/types";

// This will be a more complex type once relations are included
type TaskWithRelations = Task;

interface TaskState {
  tasks: TaskWithRelations[];
  searchResults: TaskWithRelations[];
  counts: { today: number; inbox: number; all: number };
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
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  searchResults: [],
  counts: { today: 0, inbox: 0, all: 0 },
  fetchTasks: async (listId, showCompleted) => {
    let url = listId ? `/api/tasks?listId=${listId}` : "/api/tasks";
    if (showCompleted !== undefined) {
      url += `${listId ? "&" : "?"}showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  fetchTodayTasks: async (showCompleted) => {
    let url = "/api/tasks/today";
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  fetchNext7DaysTasks: async (showCompleted) => {
    let url = "/api/tasks/next-7-days";
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  fetchUpcomingTasks: async (showCompleted) => {
    let url = "/api/tasks/upcoming";
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  searchTasks: async (query) => {
    const response = await fetch(`/api/tasks/search?query=${query}`);
    const searchResults = await response.json();
    set({ searchResults });
  },
  clearSearchResults: () => set({ searchResults: [] }),
  fetchCounts: async () => {
    const response = await fetch("/api/tasks/counts");
    const counts = await response.json();
    set({ counts });
  },
  addTask: async (newTask) => {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTask),
    });
    const createdTask = await response.json();
    set((state) => ({ tasks: [...state.tasks, createdTask] }));
    get().fetchCounts();
  },
  updateTask: async (taskId, updatedTask) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTask),
    });
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
  },
  deleteTask: async (taskId) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });

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
  },
}));
