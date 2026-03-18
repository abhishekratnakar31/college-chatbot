import type { ChatMessage } from "../types/chat.js";

interface SessionMemory {
  messages: ChatMessage[];
}

const sessions = new Map<string, SessionMemory>();

export function getSession(sessionId: string): SessionMemory {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
    });
  }

  return sessions.get(sessionId)!;
}

export function addMessage(
  sessionId: string,
  message: ChatMessage
) {
  const session = getSession(sessionId);
  session.messages.push(message);

  // Keep only last 20 messages (basic trimming)
const MAX_MESSAGES = 12;
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }
}
