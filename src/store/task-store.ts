import { create } from 'zustand';
import type { Task } from '@/types';

// This will be a more complex type once relations are included
type TaskWithRelations = Task; 

interface TaskState {
  tasks: TaskWithRelations[];
  fetchTasks: (listId?: string, showCompleted?: boolean) => Promise<void>;
  fetchTodayTasks: (showCompleted?: boolean) => Promise<void>;
  fetchNext7DaysTasks: (showCompleted?: boolean) => Promise<void>;
  fetchUpcomingTasks: (showCompleted?: boolean) => Promise<void>;
  searchTasks: (query: string) => Promise<void>; // New function
  addTask: (newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'recurring' | 'actualTime'>) => Promise<void>;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  fetchTasks: async (listId, showCompleted) => {
    let url = listId ? `/api/tasks?listId=${listId}` : '/api/tasks';
    if (showCompleted !== undefined) {
      url += `${listId ? '&' : '?'}showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  fetchTodayTasks: async (showCompleted) => {
    let url = '/api/tasks/today';
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  fetchNext7DaysTasks: async (showCompleted) => {
    let url = '/api/tasks/next-7-days';
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  fetchUpcomingTasks: async (showCompleted) => {
    let url = '/api/tasks/upcoming';
    if (showCompleted !== undefined) {
      url += `?showCompleted=${showCompleted}`;
    }
    const response = await fetch(url);
    const tasks = await response.json();
    set({ tasks });
  },
  searchTasks: async (query) => { // New function implementation
    const response = await fetch(`/api/tasks/search?query=${query}`);
    const tasks = await response.json();
    set({ tasks });
  },
  addTask: async (newTask) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newTask),
    });
    const createdTask = await response.json();
    set((state) => ({ tasks: [...state.tasks, createdTask] }));
  },
  updateTask: async (taskId, updatedTask) => {
    const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTask),
    });
    const returnedTask = await response.json();
    set((state) => ({
        tasks: state.tasks.map((task) =>
            task.id === taskId ? returnedTask : task
        ),
    }));
  },
  deleteTask: async (taskId) => {
    await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
    });
    set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },
}));