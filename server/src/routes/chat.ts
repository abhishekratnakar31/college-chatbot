import type { FastifyInstance } from "fastify";
import { generateStream, generateSearchQuery } from "../llm/openai.js";
import type { ChatMessage } from "../types/chat.js";
import crypto from "node:crypto";
import { qdrant } from "../lib/qdrant.js";
import { getEmbedding } from "../llm/embedding.js";
import { searchWeb } from "../lib/search.js";
import { runInputGuardrails, runOutputGuardrails } from "../guardrails/index.js";
import { generatePdfAwareSearchQuery } from "../llm/queryEnricher.js";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    try {
      const body = request.body as {
        messages?: ChatMessage[];
        mode?: "pdf" | "web";
        pdfContext?: string;    // Extracted PDF text (may be empty for scanned PDFs)
        pdfFilename?: string;   // PDF filename — used as fallback when text is empty
      };
      const mode = body.mode || "pdf";
      console.log(`[DEBUG CHAT] Mode: ${mode}, Request Body:`, typeof body, body);

      if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
        reply.status(400).send({ error: "Messages array required" });
        return;
      }

      const history = body.messages;
      const rawInput = history[history.length - 1]!.content;

      // ── INPUT GUARDRAILS ────────────────────────────────────────────
      const clientIp =
        (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        request.ip ||
        "unknown";

      const inputCheck = runInputGuardrails(rawInput, clientIp);

      if (!inputCheck.pass) {
        console.warn(`[GUARDRAIL] Input blocked — code: ${inputCheck.code}`);
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        reply.raw.write(
          `data: ${JSON.stringify({ choices: [{ delta: { content: inputCheck.message } }] })}\n\n`
        );
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
        return;
      }

      // Use the PII-scrubbed version for all downstream processing
      const currentInput = inputCheck.sanitizedInput;
      if (inputCheck.piiDetected) {
        console.info(`[GUARDRAIL][PII] Personal information was redacted from the input.`);
      }
      // ── END INPUT GUARDRAILS ────────────────────────────────────────

      console.log(`\n[RAG Search] ------------------------------------------------`);
      console.log(`[RAG Search] User question received: "${currentInput}"`);
      console.log(`[RAG Search] Optimizing query for vector search...`);

      // 1. Optimize Search Query for Retrieval
      // In web mode with PDF context (or filename as fallback), use the enriched query generator
      const hasPdfText = mode === "web" && !!body.pdfContext?.trim();
      const hasPdfFilename = mode === "web" && !!body.pdfFilename?.trim();
      const hasPdfContext = hasPdfText || hasPdfFilename;

      // Build the context string for the query enricher:
      // Prefer extracted text; fall back to just the filename as a hint
      const pdfContextForQuery = hasPdfText
        ? body.pdfContext!
        : hasPdfFilename
          ? `Document: ${body.pdfFilename} (text could not be extracted — use the filename as a college/document name hint)`
          : "";

      let optimizedQuery: string;

      if (hasPdfContext) {
        console.log(
          hasPdfText
            ? `[RAG Search] PDF text context (${body.pdfContext!.length} chars) — using enriched query generator.`
            : `[RAG Search] PDF filename only ("${body.pdfFilename}") — using filename as context hint.`
        );
        optimizedQuery = await generatePdfAwareSearchQuery(currentInput, pdfContextForQuery);
      } else {
        optimizedQuery = await generateSearchQuery(history);
      }
      console.log(`[RAG Search] Optimized Query: "${optimizedQuery}"`);

      if (optimizedQuery === "OUT_OF_DOMAIN") {
        if (mode === "web" && hasPdfContext) {
          // User has a PDF attached — their vague question likely refers to the document.
          // Build a fallback query from the filename instead of refusing.
          const nameHint = body.pdfFilename
            ? body.pdfFilename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")
            : "college information";
          optimizedQuery = `${nameHint} admissions courses programs`;
          console.log(`[RAG Search] OUT_OF_DOMAIN overridden (PDF attached) — fallback query: "${optimizedQuery}"`);
        } else if (mode === "web") {
          console.log(`[RAG Search] Query rejected as out of domain (WEB MODE).`);
          reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
          });
          const refusalMsg = "I am a College Assistant and can only answer questions related to colleges, admissions, academic programs, and campus life. Please ask me a college-related question!";
          reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: refusalMsg } }] })}\n\n`);
          reply.raw.write("data: [DONE]\n\n");
          reply.raw.end();
          return;
        } else {
          // PDF mode: fall back to raw input
          console.log(`[RAG Search] Query flagged as OUT_OF_DOMAIN in PDF mode. Falling back to raw input.`);
          optimizedQuery = currentInput;
        }
      }

      console.log(`[RAG Search] Vectorizing optimized query...`);

      // 2. Extract active document context from history
      let activeDocument: string | null = null;
      for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        if (msg && msg.content.startsWith("ATTACHMENT|")) {
          const parts = msg.content.split("|");
          if (parts.length > 1) {
            activeDocument = parts[1] || null;
            break;
          }
        }
      }

      if (activeDocument) {
        console.log(`[RAG Search] Scoping search to active document: ${activeDocument}`);
      }

      // 3. Retrieve relevant chunks from Qdrant (Local PDFs)
      let qdrantResults: any[] = [];
      if (mode === "pdf") {
        const queryEmbedding = await getEmbedding(optimizedQuery);
        const searchOptions: any = {
          vector: queryEmbedding,
          limit: 15,
        };

        if (activeDocument) {
          searchOptions.filter = {
            must: [
              {
                key: "document",
                match: {
                  value: activeDocument,
                },
              },
            ],
          };
        }

        qdrantResults = (await qdrant.search("college_docs", searchOptions)) || [];
        console.log(`[RAG Search] Found ${qdrantResults.length} relevant chunks in local PDFs via Qdrant.`);
      }

      // 4. Retrieve relevant info from Web (Live Search)
      let webResults: any[] = [];
      if (mode === "web") {
        console.log(`[RAG Search] Retrieving context from Live Web Search...`);
        webResults = (await searchWeb(optimizedQuery)) || [];
        console.log(`[RAG Search] WEB RESULTS FOUND: ${webResults.length}`);
        if (webResults.length > 0 && webResults[0]) {
          console.log(`[RAG Search] Top Web Snippet: ${webResults[0].content.slice(0, 100)}...`);
        }
      }
      
      console.log(`[RAG Search] Building context prompt and sending to LLM (OpenRouter)...`);

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
        .join("\n\n");

      const webContext = webResults
        .map((r: any) => {
          const id = sourceCounter++;
          sources.push({ id, type: "web", name: r.title, url: r.url });
          return `[Source ID: ${id}] (Web Context: ${r.title}) ${r.content}`;
        })
        .join("\n\n");

      // When PDF context is present in web mode, build a hybrid context block
      const pdfSnippetSection = hasPdfContext
        ? `\nDOCUMENT CONTEXT (from user-uploaded PDF):\n${body.pdfContext!}\n`
        : "";

      const context = mode === "pdf"
        ? `INTERNAL_PDF_BASE (EXCLUSIVE):\n${localContext || "EMPTY (No documents uploaded or no relevant info found in PDFs)"}`
        : `${pdfSnippetSection}LIVE_WEB_SEARCH:\n${webContext || "EMPTY (No relevant web search results found)"}`;

      // 5. LLM messages (Pure Retrieval & Anti-Hallucination)
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `
You are a especializado College Assistant chatbot operating in **${mode.toUpperCase()} MODE${hasPdfContext ? " + PDF CONTEXT" : ""}**. 

${mode === "pdf" ? `
REASONING PROTOCOLS (PDF MODE):
1. You ONLY have access to INTERNAL_PDF_BASE.
2. IF INTERNAL_PDF_BASE is empty or doesn't contain the answer, you MUST state: **"The asked information is not available in the uploaded documents."**
3. DO NOT use external knowledge or web search.
` : `
REASONING PROTOCOLS (WEB MODE${hasPdfContext ? " + PDF CONTEXT" : ""}):
1. You have access to LIVE_WEB_SEARCH results${hasPdfContext ? " AND a DOCUMENT CONTEXT section from the user's uploaded PDF" : ""}.
2. ${hasPdfContext ? "Use DOCUMENT CONTEXT to understand the specific college/program. Use LIVE_WEB_SEARCH to find supplementary, up-to-date information. Synthesize both into a comprehensive answer." : "IF LIVE_WEB_SEARCH is empty or doesn't contain the answer, tell the user you couldn't find official information via web search."}
3. **STRICT DOMAIN ENFORCEMENT**: You are ONLY allowed to answer questions about colleges, universities, higher education, academic programs, campus life, admissions, entry tests (SAT, GRE, etc.), and scholarships.
4. If a user asks about anything else, politely decline.
5. ${hasPdfContext ? "Always highlight when web search confirms, contradicts, or supplements information from the PDF." : ""}
`}

CORE RULES:
1. ONLY answer questions related to colleges, admissions, programs, and campus life.
2. ORGANIZE DATA INTO TABLES. If you are listing programs, courses, departments, or fees, you MUST use a Markdown Table.
3. NEVER make up facts. 
4. ALWAYS NAME THE COLLEGE. Specifically mention the institution name.
5. DO NOT use your internal training data for specific facts. In PDF Mode, if it's not in the PDF, it's not available.
6. YOU ARE CURRENTLY IN ${mode.toUpperCase()} MODE.

SOURCE CITATIONS:
1. Every factual claim MUST cite its source using the [Source ID: X] format.
Context:
${context}
`,
        },
        ...history.slice(-5) // Pass the last few messages for context, history already includes the current user message
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

      // ── OUTPUT GUARDRAILS ───────────────────────────────────────────
      const contextChunksFound = mode === "pdf" ? qdrantResults.length : webResults.length;
      const outputCheck = runOutputGuardrails({
        response: assistantReply,
        contextChunksFound,
        mode,
      });

      if (outputCheck.triggered.length > 0) {
        console.info(`[GUARDRAIL][OUTPUT] Triggered: ${outputCheck.triggered.join(", ")}`);
      }

      // If the output guardrail modified the response (e.g., appended disclaimer),
      // push the delta to the stream so the client sees it.
      if (outputCheck.wasModified && !outputCheck.wasBlocked) {
        const delta = outputCheck.finalResponse.slice(assistantReply.length);
        if (delta) {
          reply.raw.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`
          );
        }
      }

      // If the output was blocked entirely, replace the streamed content.
      // Note: since we've already streamed the response, we append an override message.
      if (outputCheck.wasBlocked) {
        reply.raw.write(
          `data: ${JSON.stringify({ choices: [{ delta: { content: "\n\n⚠️ " + outputCheck.finalResponse } }] })}\n\n`
        );
      }

      // Use the guardrail-approved response for source citation
      assistantReply = outputCheck.wasBlocked ? outputCheck.finalResponse : outputCheck.finalResponse;
      // ── END OUTPUT GUARDRAILS ───────────────────────────────────────

      // 6. Append Sources Section (Only sources that were actually cited)
      const usedSources = sources.filter(s => {
        const regex = new RegExp(`\\[(Source ID:\\s*)?${s.id}\\]`, 'i');
        return regex.test(assistantReply);
      });
      
      if (usedSources.length > 0 && !outputCheck.wasBlocked) {
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
        
        assistantReply += sourcesText;
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: sourcesText } }] })}\n\n`);
      }

      // 7. Finalize (No DB storage needed anymore)

      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();
    } catch (err: any) {
      console.error("CHAT ERROR:", err);
      try {
        if (!reply.raw.headersSent) {
          reply.status(500).send({ error: err.message || "Internal server error" });
        } else {
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: `\n\n⚠️ An error occurred: ${errMsg}` } }] })}\n\n`);
          reply.raw.write("data: [DONE]\n\n");
          reply.raw.end();
        }
      } catch { /* ignore secondary errors */ }
    }
  });
}