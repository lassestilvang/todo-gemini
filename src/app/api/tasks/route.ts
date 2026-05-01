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

    let query = `
      SELECT t.*, l.name as listName, l.color as listColor
      FROM tasks t
      LEFT JOIN lists l ON t.listId = l.id
      WHERE t.parentId IS NULL
    `;
    const params = [];
    const conditions = [];

    if (listId) {
      conditions.push("t.listId = ?");
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const completedOnly = searchParams.get("completed") === "true";

    if (!completedOnly) {
      return NextResponse.json(
        {
          error: "Only clearing completed tasks is supported via this endpoint",
        },
        { status: 400 },
      );
    }

    const db = await getDb();
    await db.run("DELETE FROM tasks WHERE completed = 1");

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Tasks DELETE API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
