import { getDb } from "../lib/db";
import { createId } from "@paralleldrive/cuid2";

async function main() {
  const db = await getDb();
  const id = createId();
  await db.run(
    "INSERT OR IGNORE INTO lists (id, name, icon, color) VALUES (?, ?, ?, ?)",
    id,
    "Inbox",
    "📥",
    "#a1a1aa",
  );
  console.log("Seeded database");
}

main();
