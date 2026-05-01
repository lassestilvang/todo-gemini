import { NextRequest, NextResponse } from "next/server";
import { getDb, createTaskHistoryEntry } from "@/lib/db"; // Import createTaskHistoryEntry
import { taskUpdateApiSchema } from "@/lib/schemas";
import { z } from "zod";
import { addDays, addWeeks, addMonths, parseISO } from "date-fns";
import { createId } from "@paralleldrive/cuid2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  const task = await db.get(
    `SELECT t.*, l.name as listName, l.color as listColor
     FROM tasks t
     LEFT JOIN lists l ON t.listId = l.id
     WHERE t.id = ?`,
    id,
  );
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

    // Handle Recurring tasks
    if (body.completed === true) {
      const task = await db.get("SELECT * FROM tasks WHERE id = ?", id);
      if (task && task.recurring && task.recurring !== "NONE") {
        const nextId = createId();
        let nextDate = task.date ? parseISO(task.date) : new Date();
        let nextDeadline = task.deadline ? parseISO(task.deadline) : null;

        switch (task.recurring) {
          case "DAILY":
            nextDate = addDays(nextDate, 1);
            if (nextDeadline) nextDeadline = addDays(nextDeadline, 1);
            break;
          case "WEEKLY":
            nextDate = addWeeks(nextDate, 1);
            if (nextDeadline) nextDeadline = addWeeks(nextDeadline, 1);
            break;
          case "MONTHLY":
            nextDate = addMonths(nextDate, 1);
            if (nextDeadline) nextDeadline = addMonths(nextDeadline, 1);
            break;
        }

        await db.run(
          `INSERT INTO tasks (
            id, name, description, date, deadline, reminder, estimate, priority, listId, parentId, recurring
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          nextId,
          task.name,
          task.description,
          nextDate.toISOString(),
          nextDeadline?.toISOString() || null,
          task.reminder,
          task.estimate,
          task.priority,
          task.listId,
          task.parentId,
          task.recurring,
        );
        await createTaskHistoryEntry(
          nextId,
          `Task created (Recurring from ${task.name})`,
        );
      }
    }

    const updatedTask = await db.get(
      `SELECT t.*, l.name as listName, l.color as listColor
       FROM tasks t
       LEFT JOIN lists l ON t.listId = l.id
       WHERE t.id = ?`,
      id,
    );
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
