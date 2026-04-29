import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { Database } from "sqlite";
import { Task } from "@/types";
import { createId } from "@paralleldrive/cuid2";

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

  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tasks_listId ON tasks(listId);`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tasks_parentId ON tasks(parentId);`,
  );
  await db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);`);
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline);`,
  );
  await db.exec(
    `CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);`,
  );

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

  // Fetch the initial set of tasks based on the query (top-level tasks)
  const topLevelTasks: Task[] = await db.all(query, ...params);
  if (topLevelTasks.length === 0) return [];

  // Helper to get all descendant IDs to fetch all subtasks in one go
  // Alternatively, we can fetch all tasks that have these topLevelTasks as ancestors
  // For a simple hierarchy, we'll fetch all tasks that are NOT top-level but belong to the same lists
  // But a more robust way for any view is to just fetch the children recursively or fetch all related

  // Let's stick to a slightly smarter "fetch all children of these parents" approach
  // or fetch all tasks that might be relevant to the current view.

  // If we are in a list view, we can just fetch all tasks for that list.
  // If we are in "Today" etc, it's trickier.

  // For now, let's optimize the "fetch all" by at least filtering by completed if requested.
  const allTasksQuery = showCompleted
    ? "SELECT * FROM tasks"
    : "SELECT * FROM tasks WHERE completed = 0";

  const allTasks: Task[] = await db.all(allTasksQuery);

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
    // We already filtered by completed in the SQL query if showCompleted is false
    task.subTasks = subTasks.map((st) => attachSubtasks(st));
    return task;
  };

  return topLevelTasks
    .filter((t) => showCompleted || !t.completed)
    .map((t) => attachSubtasks(t));
}

export async function createTaskHistoryEntry(taskId: string, change: string) {
  const db = await getDb();
  const id = createId();
  await db.run(
    "INSERT INTO task_history (id, taskId, change) VALUES (?, ?, ?)",
    id,
    taskId,
    change,
  );
}
