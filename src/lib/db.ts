import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { Database } from "sqlite";
import { Task } from "@/types";
import cuid from "cuid"; // Import cuid

let db: Database | null = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: "./todo.db",
      driver: sqlite3.Database,
    });
  }
  return db;
}

export async function initializeDb() {
  const db = await getDb();

  await db.exec(`
        CREATE TABLE IF NOT EXISTS lists (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#ffffff',
            icon TEXT DEFAULT '📝',
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            date TEXT,
            deadline TEXT,
            reminder TEXT,
            estimate INTEGER DEFAULT 0,
            actualTime INTEGER,
            priority TEXT DEFAULT 'NONE',
            completed BOOLEAN DEFAULT 0,
            recurring TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
            listId TEXT NOT NULL,
            parentId TEXT,
            FOREIGN KEY (listId) REFERENCES lists (id) ON DELETE CASCADE,
            FOREIGN KEY (parentId) REFERENCES tasks (id) ON DELETE NO ACTION ON UPDATE NO ACTION
        );
    `);

  await db.exec(`
        CREATE TABLE IF NOT EXISTS task_history (
            id TEXT PRIMARY KEY,
            change TEXT NOT NULL,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
            taskId TEXT NOT NULL,
            FOREIGN KEY (taskId) REFERENCES tasks (id) ON DELETE CASCADE
        );
    `);

  console.log("Database initialized");
}

export async function fetchTasksWithSubtasks(
  query: string,
  params: unknown[],
  showCompleted: boolean,
): Promise<Task[]> {
  const db = await getDb();

  // Fetch the initial set of tasks based on the query
  const initialTasks: Task[] = await db.all(query, ...params);
  if (initialTasks.length === 0) return [];

  // Fetch all tasks to build the full tree in memory
  // This avoids N+1 problems. For a local todo app, this is efficient enough.
  const allTasks: Task[] = await db.all("SELECT * FROM tasks");

  // Create a map for quick lookup of subtasks
  const taskMap = new Map<string, Task[]>();
  allTasks.forEach((task) => {
    if (task.parentId) {
      const children = taskMap.get(task.parentId) || [];
      children.push(task);
      taskMap.set(task.parentId, children);
    }
  });

  // Recursive function to attach subtasks
  const attachSubtasks = (task: Task) => {
    let subTasks = taskMap.get(task.id) || [];
    if (!showCompleted) {
      subTasks = subTasks.filter((st) => !st.completed);
    }
    task.subTasks = subTasks.map((st) => attachSubtasks(st));
    return task;
  };

  let results = initialTasks;
  if (!showCompleted) {
    results = results.filter((t) => !t.completed);
  }

  return results.map((t) => attachSubtasks(t));
}

export async function createTaskHistoryEntry(taskId: string, change: string) {
  const db = await getDb();
  const id = cuid();
  await db.run(
    "INSERT INTO task_history (id, taskId, change) VALUES (?, ?, ?)",
    id,
    taskId,
    change,
  );
}
