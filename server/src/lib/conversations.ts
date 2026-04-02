import { db } from "./db.js";
import { randomUUID } from "node:crypto";

export function createConversation() {
  const id = randomUUID();

  db.prepare(`
    INSERT INTO conversations (id, title)
    VALUES (?, ?)
  `).run(id, "New Chat");

  return id;
}

export function ensureConversation(id: string, title: string = "New Chat") {
  const existing = db.prepare(`SELECT id FROM conversations WHERE id = ?`).get(id);
  
  if (!existing) {
    db.prepare(`
      INSERT INTO conversations (id, title)
      VALUES (?, ?)
    `).run(id, title);
  }
}

export function getConversations() {
  return db.prepare(`
    SELECT id, title, created_at
    FROM conversations
    ORDER BY created_at DESC
  `).all();
}

export function updateConversationTitle(id: string, title: string) {
  db.prepare(`
    UPDATE conversations
    SET title = ?
    WHERE id = ?
  `).run(title, id);
}

export function deleteConversation(id: string) {
  db.prepare(`
    DELETE FROM conversations
    WHERE id = ?
  `).run(id);
}
