import type { Database as DatabaseType } from "better-sqlite3";
import Database from "better-sqlite3";

export const db: DatabaseType = new Database("chat.db");
db.pragma("foreign_keys = ON");

// Migration: If the old 'session_id' column exists, drop the table so we can recreate it with 'conversation_id'
try {
  const tableInfo = db.prepare("PRAGMA table_info(messages)").all() as any[];
  const hasSessionId = tableInfo.some(col => col.name === "session_id");
  if (hasSessionId) {
    console.log("Migration: Dropping old messages table to update schema...");
    db.prepare("DROP TABLE messages").run();
  }
} catch (e) {
  // Table might not exist yet, which is fine
}

// Conversation table
db.prepare(`
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`).run();

// Messages table
db.prepare(`
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id TEXT,
  role TEXT,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
)
`).run();

// Core Facts table (Structured data)
db.prepare(`
CREATE TABLE IF NOT EXISTS college_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  key TEXT UNIQUE,
  value TEXT
)
`).run();
