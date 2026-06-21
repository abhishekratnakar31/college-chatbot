/**
 * Seed script — make a Firebase user an admin.
 * Usage: npx tsx src/scripts/seedAdmin.ts <uid> <email> [name]
 *
 * Example:
 *   npx tsx src/scripts/seedAdmin.ts abc123 user@example.com "Admin Name"
 */
import { sql } from "../lib/db.js";
import { validateEnv } from "../utils/env.js";
validateEnv();

const uid = process.argv[2];
const email = process.argv[3];
const name = process.argv[4] || null;

if (!uid || !email) {
  console.error("Usage: npx tsx src/scripts/seedAdmin.ts <uid> <email> [name]");
  process.exit(1);
}

await sql`
  INSERT INTO admin_users (uid, email, name)
  VALUES (${uid}, ${email}, ${name})
  ON CONFLICT (uid) DO NOTHING
`;
console.log(`Admin added: ${email} (${uid})`);
process.exit(0);
