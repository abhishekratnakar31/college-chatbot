import type { FastifyInstance } from "fastify";
import { generateStream } from "../llm/openai.js";
import { getSession, addMessage } from "../lib/memory.js";
import type { ChatMessage } from "../types/chat.js";
import crypto from "node:crypto";
import { qdrant } from "../lib/qdrant.js";
import { getEmbedding } from "../llm/embedding.js";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    try {
      const body = request.body as { message?: string; sessionId?: string };

      if (!body?.message) {
        reply.status(400).send({ error: "Message required" });
        return;
      }

      const sessionId = body.sessionId || crypto.randomUUID();

      // Store user message
      addMessage(sessionId, {
        role: "user",
        content: body.message,
      });

      // Retrieve relevant chunks from Qdrant
      const queryEmbedding = await getEmbedding(body.message);
      
      const results = await qdrant.search("college_docs", {
        vector: queryEmbedding,
        limit: 6,
      });
      

      console.log(
        results.map((r: any) => ({
          score: r.score,
          doc: r.payload?.document,
          chunk: r.payload?.chunk_index,
        }))
      );

      const relevantChunks = results.map((r: any) => r.payload?.text as string).filter(Boolean);

      const sources = results.map((r: any) => ({
        document: r.payload?.document as string,
        chunk: r.payload?.chunk_index as number,
      })).filter(s => s.document);

      console.log("Top chunks from Qdrant:", relevantChunks);

      const context = relevantChunks.join("\n");

      // LLM messages
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `
You are a college assistant chatbot.

Answer questions using the context below.

Context:
${context}

Rules:
- Context may come from PDFs
- Extract useful information even if formatting is messy
- If relevant info exists, answer confidently
- If nothing relevant exists, say information was not found

Keep answers:
- short
- clear
- student friendly
`,
        },
        ...getSession(sessionId).messages,
      ];

      const stream = await generateStream(messages);

      // SSE headers
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
            const jsonValue = JSON.parse(json);
            const content = jsonValue.choices?.[0]?.delta?.content;

            if (content) {
              assistantReply += content;
            }
          } catch {}
        }
      }

      // Append Sources to the answer
      if (sources.length > 0) {
        let sourcesText = "\n\nSources:\n";
        const seen = new Set<string>();
        
        for (const s of sources) {
          const identifier = `${s.document}-${s.chunk}`;
          if (!seen.has(identifier)) {
            seen.add(identifier);
            sourcesText += `• ${s.document} (chunk ${s.chunk})\n`;
          }
        }

        assistantReply += sourcesText;
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: sourcesText } }] })}\n\n`);
      }

      // Store assistant response
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