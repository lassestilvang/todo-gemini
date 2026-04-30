import { create } from "zustand";
import type { List } from "@/types";

interface ListState {
  lists: List[];
  isLoading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  addList: (
    newList: Omit<List, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateList: (id: string, updatedList: Partial<List>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  isLoading: false,
  error: null,
  fetchLists: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/lists");
      if (!response.ok) throw new Error("Failed to fetch lists");
      const lists = await response.json();
      set({ lists });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch lists",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  addList: async (newList) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newList),
      });
      if (!response.ok) throw new Error("Failed to add list");
      const createdList = await response.json();
      set((state) => ({ lists: [...state.lists, createdList] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to add list" });
    } finally {
      set({ isLoading: false });
    }
  },
  updateList: async (id, updatedList) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedList),
      });
      if (!response.ok) throw new Error("Failed to update list");
      const returnedList = await response.json();
      set((state) => ({
        lists: state.lists.map((list) =>
          list.id === id ? returnedList : list,
        ),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to update list",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  deleteList: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete list");
      set((state) => ({
        lists: state.lists.filter((list) => list.id !== id),
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to delete list",
      });
    } finally {
      set({ isLoading: false });
    }
  },
  setError: (error) => set({ error }),
}));
