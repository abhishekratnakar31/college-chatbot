import type { FastifyInstance } from "fastify";
import { generateStream } from "../llm/openai.ts";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    const body = request.body as { message: string };

    if (!body?.message) {
      return reply.status(400).send({ error: "Message required" });
    }

    const stream = await generateStream(body.message);

    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const reader = stream?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      reply.raw.end();
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      reply.raw.write(chunk);
    }

    reply.raw.end();
  });
}