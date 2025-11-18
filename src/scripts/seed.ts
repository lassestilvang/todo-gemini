import { getDb } from '../lib/db';
import cuid from 'cuid';

async function main() {
    const db = await getDb();
    const id = cuid();
    await db.run(
        "INSERT OR IGNORE INTO lists (id, name, icon, color) VALUES (?, ?, ?, ?)",
        id,
        "Inbox",
        "📥",
        "#a1a1aa"
    );
    console.log("Seeded database");
}

main();
