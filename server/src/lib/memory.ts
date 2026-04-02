import type { ChatMessage } from "../types/chat.js";
import { sql } from "./db.js";

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const rows = await sql`
    SELECT role, content FROM (
      SELECT id, role, content FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY id DESC
      LIMIT 12
    ) AS subquery ORDER BY id ASC
  `;

  return rows as unknown as ChatMessage[];
}

export async function addMessage(
  conversationId: string,
  message: ChatMessage
) {
  await sql`
    INSERT INTO messages (conversation_id, role, content)
    VALUES (${conversationId}, ${message.role}, ${message.content})
  `;
}
