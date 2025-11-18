import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import cuid from "cuid";

export async function GET() {
  const db = await getDb();
  const lists = await db.all("SELECT * FROM lists");
  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const data = await request.json();
  const { name, color, icon } = data;
  const id = cuid();
  const db = await getDb();
  await db.run(
    "INSERT INTO lists (id, name, color, icon) VALUES (?, ?, ?, ?)",
    id,
    name,
    color,
    icon
  );
  const newList = await db.get("SELECT * FROM lists WHERE id = ?", id);
  return NextResponse.json(newList, { status: 201 });
}