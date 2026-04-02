import type { FastifyInstance } from "fastify";
import { getConversations, createConversation, deleteConversation, updateConversationTitle } from "../lib/conversations.js";
import { getConversationMessages } from "../lib/memory.js";

export async function conversationRoutes(app: FastifyInstance) {
  // get all conversations
  app.get("/conversations", async () => {
    return getConversations();
  });

  // create new conversation
  app.post("/conversations", async () => {
    const id = createConversation();
    return { id };
  });

  // update conversation title
  app.put("/conversations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { title } = request.body as { title: string };
    
    if (!title) {
      return reply.status(400).send({ error: "Title is required" });
    }

    updateConversationTitle(id, title);
    return { success: true };
  });

  // delete a conversation
  app.delete("/conversations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    deleteConversation(id);
    return { success: true };
  });

  // get messages for a specific conversation
  app.get("/conversations/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const messages = getConversationMessages(id);
    
    if (!messages) {
      return reply.status(404).send({ error: "Conversation not found" });
    }

    return messages;
  });
}
