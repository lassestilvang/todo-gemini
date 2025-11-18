import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  const list = await db.get("SELECT * FROM lists WHERE id = ?", params.id);
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }
  return NextResponse.json(list);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const data = await request.json();
  const { name, color, icon } = data;
  const db = await getDb();
  await db.run(
    "UPDATE lists SET name = ?, color = ?, icon = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
    name,
    color,
    icon,
    params.id
  );
  const updatedList = await db.get("SELECT * FROM lists WHERE id = ?", params.id);
  return NextResponse.json(updatedList);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const db = await getDb();
  await db.run("DELETE FROM lists WHERE id = ?", params.id);
  return new NextResponse(null, { status: 204 });
}