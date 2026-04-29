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
    return text;
  }
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return parts;
}
