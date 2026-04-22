import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in environment variables!");
  throw new Error("DATABASE_URL is required");
}

export const sql = postgres(connectionString);

export async function initDB() {
  try {
    // Core Facts table (Structured data)
    await sql`
      CREATE TABLE IF NOT EXISTS college_stats (
        id SERIAL PRIMARY KEY,
        category TEXT,
        key TEXT UNIQUE,
        value TEXT
      )
    `;

    console.log("PostgreSQL Database Initialized.");
  } catch (err) {
    console.error("Failed to initialize PostgreSQL:", err);
    throw err;
  }
}
