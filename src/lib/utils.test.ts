import { expect, test, describe } from "bun:test";
import { cn, isOverdue } from "./utils";
import { Task } from "@/types";

describe("cn", () => {
  test("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", "", "class2")).toBe("class1 class2");
    expect(cn("class1", null, "class2")).toBe("class1 class2");
    expect(cn("class1", undefined, "class2")).toBe("class1 class2");
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
    expect(cn("class1", "class2 class3")).toBe("class1 class2 class3");
  });
});

describe("isOverdue", () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  test("should return false if task is completed", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: yesterday.toISOString(),
      deadline: null,
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: true,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(false);
  });

  test("should return true if task has an overdue deadline", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: null,
      deadline: yesterday.toISOString(),
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: false,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(true);
  });

  test("should return true if task has an overdue date", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: yesterday.toISOString(),
      deadline: null,
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: false,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(true);
  });

  test("should return false if task is not overdue (future date)", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: tomorrow.toISOString(),
      deadline: null,
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: false,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(false);
  });

  test("should return false if task is not overdue (future deadline)", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: null,
      deadline: tomorrow.toISOString(),
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: false,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(false);
  });

  test("should return false if task date is today", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
      deadline: null,
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: false,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(false);
  });

  test("should return false if task has no date or deadline", () => {
    const task: Task = {
      id: "1",
      name: "Test Task",
      description: null,
      date: null,
      deadline: null,
      reminder: null,
      estimate: 0,
      actualTime: null,
      priority: "NONE",
      completed: false,
      recurring: null,
      createdAt: "",
      updatedAt: "",
      listId: "list1",
      parentId: null,
    };
    expect(isOverdue(task)).toBe(false);
  });
});
