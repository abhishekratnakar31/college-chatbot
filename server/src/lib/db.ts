import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in environment variables!");
  // Return a dummy object to prevent immediate crash, 
  // though queries will fail later if not handled.
  // Better to throw or exit if it's critical.
}

export const sql = connectionString ? postgres(connectionString) : null as any;

export async function initDB() {
  try {
    // Conversation table
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Messages table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id TEXT,
        role TEXT,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_conversation
          FOREIGN KEY(conversation_id) 
          REFERENCES conversations(id)
          ON DELETE CASCADE
      )
    `;

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
