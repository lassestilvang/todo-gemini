import { create } from 'zustand';
import type { List } from '@/types';

interface ListState {
  lists: List[];
  fetchLists: () => Promise<void>;
  addList: (newList: Omit<List, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const useListStore = create<ListState>((set) => ({
  lists: [],
  fetchLists: async () => {
    const response = await fetch('/api/lists');
    const lists = await response.json();
    set({ lists });
  },
  addList: async (newList) => {
    const response = await fetch('/api/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newList),
    });
    const createdList = await response.json();
    set((state) => ({ lists: [...state.lists, createdList] }));
  },
}));
