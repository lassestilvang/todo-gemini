import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { format } from "date-fns";

export async function GET() {
  try {
    const db = await getDb();
    const today = format(new Date(), "yyyy-MM-dd");

    const result = await db.get(
      `
      SELECT
        COUNT(CASE WHEN (date = ? OR (date < ? AND completed = 0)) AND completed = 0 AND parentId IS NULL THEN 1 END) as today,
        COUNT(CASE WHEN l.name = 'Inbox' AND t.completed = 0 AND t.parentId IS NULL THEN 1 END) as inbox,
        COUNT(CASE WHEN t.completed = 0 AND t.parentId IS NULL THEN 1 END) as allCount
      FROM tasks t
      LEFT JOIN lists l ON t.listId = l.id
    `,
      today,
      today,
    );

    return NextResponse.json({
      today: result.today,
      inbox: result.inbox,
      all: result.allCount,
    });
  } catch (error) {
    console.error("Counts API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
