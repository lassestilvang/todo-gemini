import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SortOption = "date" | "priority" | "name" | "createdAt";

interface SettingsState {
  showCompleted: boolean;
  sortBy: SortOption;
  toggleShowCompleted: () => void;
  setShowCompleted: (show: boolean) => void;
  setSortBy: (option: SortOption) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showCompleted: true,
      sortBy: "createdAt",
      toggleShowCompleted: () =>
        set((state) => ({ showCompleted: !state.showCompleted })),
      setShowCompleted: (show) => set({ showCompleted: show }),
      setSortBy: (option) => set({ sortBy: option }),
    }),
    {
      name: "todo-settings",
    },
  ),
);
