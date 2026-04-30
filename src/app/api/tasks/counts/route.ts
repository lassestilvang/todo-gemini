import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { format } from "date-fns";

export async function GET() {
  try {
    const db = await getDb();
    const today = format(new Date(), "yyyy-MM-dd");

    const todayCount = await db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE (date = ? OR (date < ? AND completed = 0)) AND completed = 0 AND parentId IS NULL",
      today,
      today,
    );
    const inboxCount = await db.get(
      "SELECT COUNT(*) as count FROM tasks t JOIN lists l ON t.listId = l.id WHERE l.name = 'Inbox' AND t.completed = 0 AND t.parentId IS NULL",
    );
    const allCount = await db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE completed = 0 AND parentId IS NULL",
    );

    return NextResponse.json({
      today: todayCount.count,
      inbox: inboxCount.count,
      all: allCount.count,
    });
  } catch (error) {
    console.error("Counts API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
