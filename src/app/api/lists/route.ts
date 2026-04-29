import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";

export async function GET() {
  const db = await getDb();
  const lists = await db.all(`
    SELECT l.*, COUNT(t.id) as taskCount
    FROM lists l
    LEFT JOIN tasks t ON l.id = t.listId AND t.completed = 0 AND t.parentId IS NULL
    GROUP BY l.id
  `);
  return NextResponse.json(lists);
}

export async function POST(request: NextRequest) {
  const data = await request.json();
  const { name, color, icon } = data;
  const id = createId();
  const db = await getDb();
  await db.run(
    "INSERT INTO lists (id, name, color, icon) VALUES (?, ?, ?, ?)",
    id,
    name,
    color,
    icon,
  );
  const newList = await db.get("SELECT * FROM lists WHERE id = ?", id);
  return NextResponse.json(newList, { status: 201 });
}
