import type { FastifyInstance } from "fastify";
import { generateStream } from "../llm/openai.js";
import { getSession, addMessage } from "../lib/memory.js";
import type { ChatMessage } from "../types/chat.js";
import crypto from "node:crypto";

import { storedChunks } from "./upload.js";
import { getEmbedding } from "../llm/embedding.js";
import { cosineSimilarity } from "../lib/similarity.js";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    try {
      const body = request.body as { message?: string; sessionId?: string };

      if (!body?.message) {
        reply.status(400).send({ error: "Message required" });
        return;
      }

      const sessionId = body.sessionId || crypto.randomUUID();

      // ✅ store user message
      addMessage(sessionId, {
        role: "user",
        content: body.message,
      });

      // 🔥 REAL RAG (FIXED)
      let context = "";

      if (storedChunks.length > 0) {
        const queryEmbedding = await getEmbedding(body.message);

        const scored = storedChunks.map((chunk) => ({
          text: chunk.text,
          score: cosineSimilarity(queryEmbedding, chunk.embedding),
        }));

        const relevantChunks = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((c) => c.text);

        context = relevantChunks.join("\n");
      }

      // ✅ messages
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `
You are a college assistant chatbot.

Use the provided context to answer.

Context:
${context || "No data available"}

Rules:
- Answer ONLY from the context
- If answer is not in context, say "Please check official website"
- Keep answers short (max 5-6 lines)
- Be clear and student-friendly
`,
        },
        ...getSession(sessionId).messages,
      ];

      const stream = await generateStream(messages);

      // 🔥 SSE headers
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });

      reply.hijack();

      const reader = stream?.getReader();
      const decoder = new TextDecoder();

      let assistantReply = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        reply.raw.write(chunk);

        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const json = line.replace("data: ", "").trim();
          if (json === "[DONE]") break;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              assistantReply += content;
            }
          } catch {}
        }
      }

      // ✅ store assistant reply
      addMessage(sessionId, {
        role: "assistant",
        content: assistantReply,
      });

      reply.raw.end();

    } catch (err) {
      console.error("CHAT ERROR:", err);
      try {
        reply.raw.end();
      } catch {}
    }
  });
}