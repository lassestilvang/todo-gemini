import { NextRequest, NextResponse } from "next/server";
import { getDb, createTaskHistoryEntry } from "@/lib/db"; // Import createTaskHistoryEntry
import { taskUpdateApiSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  const task = await db.get("SELECT * FROM tasks WHERE id = ?", id);
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  const history = await db.all(
    "SELECT * FROM task_history WHERE taskId = ? ORDER BY createdAt DESC",
    id,
  );
  return NextResponse.json({ ...task, history });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const body = taskUpdateApiSchema.parse(json);

    const db = await getDb();

    const fields: string[] = [];
    const values: unknown[] = [];
    const changes: string[] = []; // To track changes for history

    const fieldMap: Record<string, string> = {
      name: "Name",
      description: "Description",
      date: "Date",
      deadline: "Deadline",
      reminder: "Reminder",
      estimate: "Estimate",
      priority: "Priority",
      completed: "Completed status",
      parentId: "Parent task",
    };

    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(key === "completed" ? (value ? 1 : 0) : value);
        changes.push(`${fieldMap[key] || key} changed to: ${value}`);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    fields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await db.run(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      ...values,
    );

    // Create history entries for all changes
    for (const change of changes) {
      await createTaskHistoryEntry(id, change);
    }

    const updatedTask = await db.get("SELECT * FROM tasks WHERE id = ?", id);
    return NextResponse.json({ ...updatedTask });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  await db.run("DELETE FROM tasks WHERE id = ?", id);
  return new NextResponse(null, { status: 204 });
}
