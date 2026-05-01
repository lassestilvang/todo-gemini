import { NextResponse, NextRequest } from "next/server";
import { fetchTasksWithSubtasks } from "@/lib/db"; // Import fetchTasksWithSubtasks
import { format, addDays } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showCompleted = searchParams.get("showCompleted") === "true"; // Convert to boolean
    const today = new Date();
    const next7Days = format(addDays(today, 7), "yyyy-MM-dd");
    const formattedToday = format(today, "yyyy-MM-dd");

    const query = `
      SELECT t.*, l.name as listName, l.color as listColor
      FROM tasks t
      LEFT JOIN lists l ON t.listId = l.id
      WHERE t.date >= ? AND t.date <= ? AND t.parentId IS NULL
    `;
    const params = [formattedToday, next7Days];

    const tasks = await fetchTasksWithSubtasks(query, params, showCompleted);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Next 7 days tasks API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
