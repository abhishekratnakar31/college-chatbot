import type { ChatMessage } from "../types/chat.js";
import { db } from "./db.js";

interface SessionMemory {
  messages: ChatMessage[];
}

export function getConversationMessages(conversationId: string): ChatMessage[] {
  const rows = db.prepare(`
    SELECT role, content FROM (
      SELECT id, role, content FROM messages
      WHERE conversation_id = ?
      ORDER BY id DESC
      LIMIT 12
    ) ORDER BY id ASC
  `).all(conversationId) as ChatMessage[];

  return rows;
}

export function addMessage(
  conversationId: string,
  message: ChatMessage
) {
  db.prepare(`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (?, ?, ?)
  `).run(conversationId, message.role, message.content);
}
