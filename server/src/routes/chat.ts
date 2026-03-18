import type { FastifyInstance } from "fastify";
import { generateStream } from "../llm/openai.js";
import { getSession, addMessage } from "../lib/memory.js";
import type { ChatMessage } from "../types/chat.js";
import crypto from "node:crypto";
import { collegeData } from "../data/collegeData.js";
import { retrieveRelevantChunks } from "../lib/retrieval.js";

export async function chatRoute(app: FastifyInstance) {
  // app.post("/chat", async (request, reply) => {
  //   const body = request.body as { message?: string; sessionId?: string };

  //   if (!body?.message) {
  //     return reply.status(400).send({ error: "Message required" });
  //   }

  //   const sessionId = body.sessionId || crypto.randomUUID();
  //   const session = getSession(sessionId);

  //   // Add user message
  //   addMessage(sessionId, {
  //     role: "user",
  //     content: body.message,
  //   });

  //   const messages: ChatMessage[] = [
  //     {
  //       role: "system",
  //       content:
  //         "You are a helpful college information assistant. Answer clearly and concisely.",
  //     },
  //     ...session.messages,
  //   ];

  //   const stream = await generateStream(messages);

  //   reply.raw.writeHead(200, {
  //     "Content-Type": "text/event-stream",
  //     "Cache-Control": "no-cache",
  //     Connection: "keep-alive",
  //     "Access-Control-Allow-Origin": "*",
  //     "Access-Control-Allow-Headers": "Content-Type",
  //     "Access-Control-Allow-Methods": "POST, OPTIONS",
  //   });

  //   app.options("/chat", async (req, reply) => {
  //     reply
  //       .header("Access-Control-Allow-Origin", "*")
  //       .header("Access-Control-Allow-Methods", "POST, OPTIONS")
  //       .header("Access-Control-Allow-Headers", "Content-Type")
  //       .send();
  //   });

  //   const reader = stream?.getReader();
  //   const decoder = new TextDecoder();

  //   if (!reader) {
  //     reply.raw.end();
  //     return;
  //   }

  //   let assistantReply = "";

  //   while (true) {
  //     const { done, value } = await reader.read();
  //     if (done) break;

  //     const chunk = decoder.decode(value);
  //     reply.raw.write(chunk);

  //     assistantReply += chunk; // We will refine this later
  //   }

  //   // Store assistant reply
  //   addMessage(sessionId, {
  //     role: "assistant",
  //     content: assistantReply,
  //   });

  //   reply.raw.end();
  // });
  app.post("/chat", async (request, reply) => {
  try {
    const body = request.body as { message?: string; sessionId?: string };

    if (!body?.message) {
      reply.status(400).send({ error: "Message required" });
      return;
    }

    const sessionId = body.sessionId || crypto.randomUUID();

    addMessage(sessionId, {
      role: "user",
      content: body.message,
    });
    const relevantChunks = retrieveRelevantChunks(body.message, collegeData);
const context = relevantChunks.join("\n");

    const messages: ChatMessage[] = [
      {
          role: "system",
//   content: `
// You are a college assistant chatbot.

// Rules:
// - Give SHORT and clear answers (max 5-6 lines)
// - Use bullet points when helpful
// - Do NOT give long explanations
// - Do NOT include markdown symbols like ### or **
// - Answer like a helpful student guide
// - If unsure, say "Please check the official website"
// `,
content: `
You are a college assistant chatbot.

Use the provided context to answer.
Context:
${context}

Rules:
- Use previous conversation context when answering
- Answer ONLY from the given context
- If answer is not in context, say "Please check official website"
- Keep answers short (max 5-6 lines)
- Be clear and student-friendly
`,
      },
      ...getSession(sessionId).messages,
    ];

    const stream = await generateStream(messages);

    // 🔥 IMPORTANT: tell Fastify we are handling raw response
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
    });

    reply.hijack(); // 🚨 THIS LINE FIXES YOUR LIFE

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
  } catch {
    // ignore partial chunks
  }
}
      
    }

    addMessage(sessionId, {
      role: "assistant",
      content: assistantReply,
    });

    reply.raw.end();

  } catch (err) {
    console.error("CHAT ERROR:", err);

    // ❌ DO NOT call reply.send if headers already sent
    try {
      reply.raw.end();
    } catch {}
  }
});
}
