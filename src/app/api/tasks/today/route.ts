import { NextResponse, NextRequest } from "next/server";
import { fetchTasksWithSubtasks } from "@/lib/db"; // Import fetchTasksWithSubtasks
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const showCompleted = searchParams.get("showCompleted") === "true"; // Convert to boolean
  const today = format(new Date(), "yyyy-MM-dd");

  const query =
    "SELECT * FROM tasks WHERE (date = ? OR (date < ? AND completed = 0)) AND parentId IS NULL";
  const params = [today, today];

  const tasks = await fetchTasksWithSubtasks(query, params, showCompleted);
  return NextResponse.json(tasks);
}
