import { NextResponse, NextRequest } from "next/server";
import { fetchTasksWithSubtasks } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json([]);
    }

    // Search for top-level tasks that match the query
    const sql =
      "SELECT * FROM tasks WHERE (name LIKE ? OR description LIKE ?) AND parentId IS NULL";
    const params = [`%${query}%`, `%${query}%`];

    const tasks = await fetchTasksWithSubtasks(sql, params, true); // Always show completed in search?

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
