import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createId } from "@paralleldrive/cuid2";
import { listApiSchema } from "@/lib/schemas";
import { z } from "zod";

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
  try {
    const json = await request.json();
    const body = listApiSchema.parse(json);
    const { name, color, icon } = body;
    const id = createId();
    const db = await getDb();
    await db.run(
      "INSERT INTO lists (id, name, color, icon) VALUES (?, ?, ?, ?)",
      id,
      name,
      color ?? "#ffffff",
      icon ?? "📝",
    );
    const newList = await db.get("SELECT * FROM lists WHERE id = ?", id);
    return NextResponse.json(newList, { status: 201 });
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
