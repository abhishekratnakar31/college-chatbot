import type { FastifyInstance } from "fastify";
import { getConversations, createConversation } from "../lib/conversations.js";
import { getConversationMessages } from "../lib/memory.js";

export async function historyRoutes(app: FastifyInstance) {
  // List all conversations
  app.get("/conversations", async () => {
    return getConversations();
  });

  // Get messages for a specific conversation
  app.get("/conversations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const messages = getConversationMessages(id);
    
    if (!messages) {
      return reply.status(404).send({ error: "Conversation not found" });
    }

    return { messages };
  });

  // Create a new conversation manually
  app.post("/conversations", async () => {
    const id = createConversation();
    return { id, title: "New Chat" };
  });
}
