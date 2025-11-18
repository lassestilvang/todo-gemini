import { NextResponse, NextRequest } from "next/server";
import { getDb, fetchTasksWithSubtasks } from "@/lib/db"; // Import fetchTasksWithSubtasks
import { format, addDays } from "date-fns";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const showCompleted = searchParams.get("showCompleted") === "true"; // Convert to boolean
  const db = await getDb();
  const today = new Date();
  const next7Days = format(addDays(today, 7), "yyyy-MM-dd");
  const formattedToday = format(today, "yyyy-MM-dd");

  const query = "SELECT * FROM tasks WHERE date >= ? AND date <= ? AND parentId IS NULL"; // Only fetch top-level tasks
  const params = [formattedToday, next7Days];

  const tasks = await fetchTasksWithSubtasks(query, params, showCompleted);
  return NextResponse.json(tasks);
}
