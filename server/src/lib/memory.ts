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
  if (session.messages.length > 20) {
    session.messages = session.messages.slice(-20);
  }
}
