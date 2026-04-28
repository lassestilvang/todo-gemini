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
  let tasks: Task[] = await db.all(query, ...params);

  // Filter out completed tasks if showCompleted is false
  if (!showCompleted) {
    tasks = tasks.filter((task) => !task.completed);
  }

  // Fetch subtasks for each task
  for (const task of tasks) {
    const subTasksQuery = "SELECT * FROM tasks WHERE parentId = ?";
    const subTasks = await fetchTasksWithSubtasks(
      subTasksQuery,
      [task.id],
      showCompleted,
    );
    task.subTasks = subTasks;
  }

  return tasks;
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
