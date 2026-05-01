import { useEffect, useRef } from "react";

export function useKeyboardShortcut(shortcut: string, callback: () => void) {
  const lastKeyRef = useRef<string | null>(null);
  const timerRef = useRef<Timer | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea or select
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.hasAttribute("contenteditable");

      if (isInput) return;

      const key = event.key.toLowerCase();
      const parts = shortcut.toLowerCase().split(" ");

      if (parts.length === 1) {
        if (key === parts[0]) {
          event.preventDefault();
          callback();
        }
      } else if (parts.length === 2) {
        if (lastKeyRef.current === parts[0] && key === parts[1]) {
          event.preventDefault();
          callback();
          lastKeyRef.current = null;
        } else {
          lastKeyRef.current = key;
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            lastKeyRef.current = null;
          }, 1000); // Reset sequence after 1 second
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [shortcut, callback]);
}
