import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { listApiSchema } from "@/lib/schemas";
import { z } from "zod";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  const list = await db.get("SELECT * FROM lists WHERE id = ?", id);
  if (!list) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }
  return NextResponse.json(list);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const json = await request.json();
    const body = listApiSchema.partial().parse(json);
    const db = await getDb();

    const fields: string[] = [];
    const values: unknown[] = [];

    if (body.name) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if (body.color) {
      fields.push("color = ?");
      values.push(body.color);
    }
    if (body.icon) {
      fields.push("icon = ?");
      values.push(body.icon);
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 },
      );
    }

    fields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);

    await db.run(
      `UPDATE lists SET ${fields.join(", ")} WHERE id = ?`,
      ...values,
    );

    const updatedList = await db.get("SELECT * FROM lists WHERE id = ?", id);
    return NextResponse.json(updatedList);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = await getDb();
  await db.run("DELETE FROM lists WHERE id = ?", id);
  return new NextResponse(null, { status: 204 });
}
