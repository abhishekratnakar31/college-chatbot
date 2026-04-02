import { sql } from "./db.js";
import { randomUUID } from "node:crypto";

export async function createConversation() {
  const id = randomUUID();

  await sql`
    INSERT INTO conversations (id, title)
    VALUES (${id}, 'New Chat')
  `;

  return id;
}

export async function ensureConversation(id: string, title: string = "New Chat") {
  const rows = await sql`SELECT id FROM conversations WHERE id = ${id}`;
  const existing = rows[0];
  
  if (!existing) {
    await sql`
      INSERT INTO conversations (id, title)
      VALUES (${id}, ${title})
    `;
  }
}

export async function getConversations() {
  return await sql`
    SELECT id, title, created_at
    FROM conversations
    ORDER BY created_at DESC
  `;
}

export async function updateConversationTitle(id: string, title: string) {
  await sql`
    UPDATE conversations
    SET title = ${title}
    WHERE id = ${id}
  `;
}

export async function deleteConversation(id: string) {
  await sql`
    DELETE FROM conversations
    WHERE id = ${id}
  `;
}
