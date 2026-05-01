import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isPast, parseISO, isBefore, startOfToday } from "date-fns";
import { Task } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isOverdue(task: Task): boolean {
  if (task.completed) {
    return false;
  }

  const today = startOfToday();

  if (task.deadline) {
    const deadlineDate = parseISO(task.deadline);
    // If deadline is just a date (no time), use isBefore today
    if (task.deadline.length <= 10) {
      return isBefore(deadlineDate, today);
    }
    return isPast(deadlineDate);
  }

  if (task.date) {
    const taskDate = parseISO(task.date);
    return isBefore(taskDate, today);
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
      case "priority": {
        const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // If priority is same, sort by date
        return (a.deadline || a.date || "").localeCompare(
          b.deadline || b.date || "",
        );
      }
      case "date": {
        const dateA = a.deadline || a.date || "9999-12-31";
        const dateB = b.deadline || b.date || "9999-12-31";
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        return priorityMap[b.priority] - priorityMap[a.priority];
      }
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

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ""}`.trim();
  }
  return `${minutes}m`;
}
