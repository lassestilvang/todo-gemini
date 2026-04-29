import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isPast, parseISO } from "date-fns";
import { Task } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOverdue(task: Task): boolean {
  if (task.completed) {
    return false;
  }
  if (task.deadline) {
    return isPast(parseISO(task.deadline));
  }
  if (task.date) {
    return isPast(parseISO(task.date));
  }
  return false;
}

export function highlightText(text: string, query: string) {
  if (!query.trim()) {
    return [text];
  }
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts;
}

export function sortTasks(tasks: Task[], sortBy: string): Task[] {
  const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };

  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return priorityMap[b.priority] - priorityMap[a.priority];
      case "date":
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case "name":
        return a.name.localeCompare(b.name);
      case "createdAt":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
}
