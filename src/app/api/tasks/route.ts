import { NextResponse, NextRequest } from "next/server";
import {
  getDb,
  fetchTasksWithSubtasks,
  createTaskHistoryEntry,
} from "@/lib/db"; // Import createTaskHistoryEntry
import cuid from "cuid";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("listId");
  const showCompleted = searchParams.get("showCompleted") === "true"; // Convert to boolean

  let query = "SELECT * FROM tasks WHERE parentId IS NULL"; // Only fetch top-level tasks
  const params = [];
  const conditions = [];

  if (listId) {
    conditions.push("listId = ?");
    params.push(listId);
  }

  if (conditions.length > 0) {
    query += " AND " + conditions.join(" AND ");
  }

  const tasks = await fetchTasksWithSubtasks(query, params, showCompleted);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const {
    name,
    description,
    date,
    deadline,
    reminder,
    estimate,
    priority,
    listId,
    parentId, // Added parentId
  } = data;
  const id = cuid();
  const db = await getDb();
  await db.run(
    `INSERT INTO tasks (
      id, name, description, date, deadline, reminder, estimate, priority, listId, parentId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    name,
    description || null,
    date || null,
    deadline || null,
    reminder || null,
    estimate || 0,
    priority || "NONE",
    listId,
    parentId || null, // Added parentId
  );
  const newTask = await db.get("SELECT * FROM tasks WHERE id = ?", id);
  await createTaskHistoryEntry(id, `Task created: ${name}`); // Create history entry
  return NextResponse.json(newTask, { status: 201 });
}
