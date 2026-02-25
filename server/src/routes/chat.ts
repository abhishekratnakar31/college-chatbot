import type { FastifyInstance } from "fastify";
import { generateResponse } from "../llm/openai.js";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    const body = request.body as { message: string };

    if (!body?.message) {
      return reply.status(400).send({ error: "Message required" });
    }

    const aiResponse = await generateResponse(body.message);

    return { reply: aiResponse };
  });
}