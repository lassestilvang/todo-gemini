import { NextResponse, NextRequest } from "next/server";
import {
  getDb,
  fetchTasksWithSubtasks,
  createTaskHistoryEntry,
} from "@/lib/db"; // Import createTaskHistoryEntry
import { createId } from "@paralleldrive/cuid2";
import { taskApiSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
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

    const tasks = await fetchTasksWithSubtasks(
      query,
      params,
      showCompleted,
      listId,
    );
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Tasks GET API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const body = taskApiSchema.parse(json);
    const {
      name,
      description,
      date,
      deadline,
      reminder,
      estimate,
      priority,
      listId,
      parentId,
    } = body;
    const id = createId();
    const db = await getDb();
    await db.run(
      `INSERT INTO tasks (
        id, name, description, date, deadline, reminder, estimate, priority, listId, parentId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      name,
      description ?? null,
      date ?? null,
      deadline ?? null,
      reminder ?? null,
      estimate ?? 0,
      priority ?? "NONE",
      listId,
      parentId ?? null,
    );
    const newTask = await db.get("SELECT * FROM tasks WHERE id = ?", id);
    await createTaskHistoryEntry(id, `Task created: ${name}`); // Create history entry
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
