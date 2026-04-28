import { NextRequest, NextResponse } from "next/server";
import { getDb, createTaskHistoryEntry } from "@/lib/db"; // Import createTaskHistoryEntry

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
  const { id } = await params;
  const data = await request.json();
  const {
    name,
    description,
    date,
    deadline,
    reminder,
    estimate,
    priority,
    completed,
    parentId, // Added parentId
  } = data;
  const db = await getDb();

  const fields = [];
  const values = [];
  const changes = []; // To track changes for history

  if (name !== undefined) {
    fields.push("name = ?");
    values.push(name);
    changes.push(`Name changed to: ${name}`);
  }
  if (description !== undefined) {
    fields.push("description = ?");
    values.push(description);
    changes.push(`Description changed to: ${description}`);
  }
  if (date !== undefined) {
    fields.push("date = ?");
    values.push(date);
    changes.push(`Date changed to: ${date}`);
  }
  if (deadline !== undefined) {
    fields.push("deadline = ?");
    values.push(deadline);
    changes.push(`Deadline changed to: ${deadline}`);
  }
  if (reminder !== undefined) {
    fields.push("reminder = ?");
    values.push(reminder);
    changes.push(`Reminder changed to: ${reminder}`);
  }
  if (estimate !== undefined) {
    fields.push("estimate = ?");
    values.push(estimate);
    changes.push(`Estimate changed to: ${estimate}`);
  }
  if (priority !== undefined) {
    fields.push("priority = ?");
    values.push(priority);
    changes.push(`Priority changed to: ${priority}`);
  }
  if (completed !== undefined) {
    fields.push("completed = ?");
    values.push(completed ? 1 : 0);
    changes.push(`Completed status changed to: ${completed}`);
  }
  if (parentId !== undefined) {
    // Added parentId update
    fields.push("parentId = ?");
    values.push(parentId);
    changes.push(`Parent task changed to: ${parentId}`);
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  fields.push("updatedAt = CURRENT_TIMESTAMP");
  values.push(id);

  await db.run(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, ...values);

  // Create history entries for all changes
  for (const change of changes) {
    await createTaskHistoryEntry(id, change);
  }

  const updatedTask = await db.get("SELECT * FROM tasks WHERE id = ?", id);
  return NextResponse.json({ ...updatedTask });
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
