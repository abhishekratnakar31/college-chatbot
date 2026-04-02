import type { FastifyInstance } from "fastify";
import { generateStream, generateSearchQuery } from "../llm/openai.js";
import { getConversationMessages, addMessage } from "../lib/memory.js";
import { updateConversationTitle, ensureConversation } from "../lib/conversations.js";
import type { ChatMessage } from "../types/chat.js";
import crypto from "node:crypto";
import { qdrant } from "../lib/qdrant.js";
import { getEmbedding } from "../llm/embedding.js";
import { searchWeb } from "../lib/search.js";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    try {
      const body = request.body as { message?: string; conversationId?: string; sessionId?: string };

      if (!body?.message) {
        reply.status(400).send({ error: "Message required" });
        return;
      }

      const conversationId = body.conversationId || body.sessionId || crypto.randomUUID();
      ensureConversation(conversationId);
      const history = getConversationMessages(conversationId);

      if (history.length === 0) {
        updateConversationTitle(conversationId, body.message.slice(0, 50));
      }

      addMessage(conversationId, {
        role: "user",
        content: body.message,
      });

      // 1. Optimize Search Query for Retrieval
      const currentHistory = getConversationMessages(conversationId);
      const optimizedQuery = await generateSearchQuery(currentHistory);

      // 2. Retrieve relevant chunks from Qdrant (Local PDFs)
      const queryEmbedding = await getEmbedding(optimizedQuery);
      const qdrantResults = (await qdrant.search("college_docs", {
        vector: queryEmbedding,
        limit: 5,
      })) || [];

      // 3. Retrieve relevant info from Web (Live Search)
      const webResults = (await searchWeb(optimizedQuery)) || [];
      
      console.log(`WEB RESULTS FOUND: ${webResults.length}`);
      if (webResults.length > 0 && webResults[0]) {
        console.log("Top Snippet:", webResults[0].content.slice(0, 100));
      }

      // 4. Build Context & Sources
      let sourceCounter = 1;
      const sources: { id: number; type: "pdf" | "web"; name: string; url?: string; chunk?: number }[] = [];

      const localContext = qdrantResults
        .map((r: any) => {
          const id = sourceCounter++;
          sources.push({ id, type: "pdf", name: r.payload?.document, chunk: r.payload?.chunk_index });
          return `[Source ID: ${id}] (Document: ${r.payload?.document}) ${r.payload?.text}`;
        })
        .filter(Boolean)
        .join("\n\n").slice(0, 3000);

      const webContext = webResults
        .map((r: any) => {
          const id = sourceCounter++;
          sources.push({ id, type: "web", name: r.title, url: r.url });
          return `[Source ID: ${id}] (Web Context: ${r.title}) ${r.content}`;
        })
        .join("\n\n").slice(0, 3000);

      const context = `
INTERNAL_PDF_BASE (PRIORITY):
${localContext || "EMPTY (No documents uploaded or no relevant info found in PDFs)"}

---

LIVE_WEB_SEARCH (FALLBACK):
${webContext || "EMPTY (No relevant web search results found)"}
`.trim();

      // 5. LLM messages (Pure Retrieval & Anti-Hallucination)
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `
You are a especializado College Assistant chatbot. COMPLY WITH THE FOLLOWING PROTOCOLS:

REASONING PROTOCOLS:
1. IF INTERNAL_PDF_BASE IS NOT EMPTY: You MUST prioritize the information there.
2. IF the answer is found in INTERNAL_PDF_BASE: Answer directly and cite the PDF sources.
3. IF INTERNAL_PDF_BASE is NOT EMPTY but DOES NOT contain the answer: 
   - Start your response EXACTLY with: **"The asked information is not available in the uploaded documents."**
   - Then, provide the information found in LIVE_WEB_SEARCH.
4. IF INTERNAL_PDF_BASE IS EMPTY: Use LIVE_WEB_SEARCH directly without any disclaimer.

CORE RULES:
1. ONLY answer questions related to colleges, admissions, programs, and campus life.
2. ORGANIZE DATA INTO TABLES. If you are listing programs, courses, departments, or fees, you MUST use a Markdown Table.
3. NEVER make up facts. If information is NOT in the context, tell the user: "I'm sorry, I couldn't find specific official information regarding that in my current records or live search."
4. ALWAYS NAME THE COLLEGE. Specifically mention the institution name (e.g., "In the Arizona State University (ASU) records...") so the user knows exactly which college the data belongs to.
5. DO NOT use your internal training data for specific facts.

SOURCE CITATIONS:
1. Every factual claim MUST cite its source using the [Source ID: X] format.
Context:
${context}
`,
        },
        ...history.slice(-4),
        {
          role: "user",
          content: body.message,
        }
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
      let buffer = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        reply.raw.write(chunk);
        
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data:")) continue;
          
          const json = trimmedLine.replace("data: ", "").trim();
          if (json === "[DONE]") continue;
          
          try {
            const jsonValue = JSON.parse(json);
            const content = jsonValue.choices?.[0]?.delta?.content;
            if (content) assistantReply += content;
          } catch {
            // Partial JSON or other parse error, the buffer logic should handle this
          }
        }
      }

      // 6. Append Sources Section (Only sources that were actually cited)
      const usedSources = sources.filter(s => {
        const regex = new RegExp(`\\[(Source ID:\\s*)?${s.id}\\]`, 'i');
        return regex.test(assistantReply);
      });
      
      if (usedSources.length > 0) {
        let sourcesText = "\n\n---\n**Sources:**\n"; // marker must match frontend split
        const seen = new Set<string>();
        for (const s of usedSources) {
          const identifier = s.type === "pdf" ? `${s.name}-${s.chunk}` : s.url;
          if (!identifier || seen.has(identifier)) continue;
          seen.add(identifier);
          if (s.type === "pdf") {
            sourcesText += `• ${s.name} (section ${((s.chunk || 0) + 1)})\n`;
          } else {
            sourcesText += `• ${s.url}\n`;
          }
        }
        
        // Remove the number bracket citations from the text so it looks cleaner in UI if preferred, 
        // or leave them so users know which fact came from which source. We will leave them for transparency.
        
        assistantReply += sourcesText;
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: sourcesText } }] })}\n\n`);
      }

      // 7. Finalize message history
      addMessage(conversationId, {
        role: "assistant",
        content: assistantReply,
      });

      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();
    } catch (err) {
      console.error("CHAT ERROR:", err);
      try {
        if (!reply.raw.headersSent) {
          reply.status(500).send({ error: "Internal server error" });
        } else {
          // Stream already started — send an error token so the UI shows something
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `\n\n⚠️ An error occurred: ${errMsg}` } }] })}\n\n`);
          reply.raw.write("data: [DONE]\n\n");
          reply.raw.end();
        }
      } catch { /* ignore secondary errors */ }
    }
  });
}