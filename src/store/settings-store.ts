import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  showCompleted: boolean;
  toggleShowCompleted: () => void;
  setShowCompleted: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showCompleted: true,
      toggleShowCompleted: () =>
        set((state) => ({ showCompleted: !state.showCompleted })),
      setShowCompleted: (show) => set({ showCompleted: show }),
    }),
    {
      name: "todo-settings",
    },
  ),
);
