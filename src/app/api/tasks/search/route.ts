import { NextResponse, NextRequest } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const db = await getDb();

  if (!query) {
    return NextResponse.json([]);
  }

  // Basic fuzzy search using LIKE operator
  const tasks = await db.all(
    "SELECT * FROM tasks WHERE name LIKE ? OR description LIKE ?",
    `%${query}%`,
    `%${query}%`
  );

  return NextResponse.json(tasks);
}
