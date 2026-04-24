import type { FastifyInstance } from "fastify";
import { generateStream, generateSearchQuery } from "../llm/openai.js";
import type { ChatMessage } from "../types/chat.js";
import crypto from "node:crypto";
import { qdrant } from "../lib/qdrant.js";
import { getEmbedding } from "../llm/embedding.js";
import { searchWeb } from "../lib/search.js";
import { runInputGuardrails, runOutputGuardrails } from "../guardrails/index.js";
import { generatePdfAwareSearchQuery } from "../llm/queryEnricher.js";
import { reRankChunks } from "../llm/reranker.js";
import { detectColleges, computeInnovationScore } from "./rankings.js";
import { sql } from "../lib/db.js";

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    try {
      const body = request.body as {
        messages?: ChatMessage[];
        mode?: "pdf" | "web" | "compare";
        pdfContext?: string;    // Extracted PDF text (may be empty for scanned PDFs)
        pdfFilename?: string;   // PDF filename — used as fallback when text is empty
        filters?: Record<string, any>; // Optional metadata filters (e.g. { page_number: 5 })
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

      // Build additional metadata filters if provided
      const customFilters = body.filters ? Object.entries(body.filters).map(([key, value]) => ({
        key,
        match: { value }
      })) : [];

      // 3. Retrieve relevant chunks from Qdrant (Local PDFs)
      let qdrantResults: any[] = [];
      if (mode === "pdf") {
        console.log(`[RAG Search] Starting Hybrid Search (Vector + Keyword)...`);
        const queryEmbedding = await getEmbedding(optimizedQuery);
        
        // 1. Vector Similarity Search
        const vectorSearchOptions: any = {
          vector: queryEmbedding,
          limit: 25, // Get more candidates for re-ranking
        };

        if (activeDocument || customFilters.length > 0) {
          vectorSearchOptions.filter = {
            must: [
              ...(activeDocument ? [{ key: "document", match: { value: activeDocument } }] : []),
              ...customFilters
            ],
          };
        }

        const vectorResults = (await qdrant.search("college_docs", vectorSearchOptions)) || [];
        console.log(`[RAG Search] Vector search returned ${vectorResults.length} candidates.`);

        // 2. Keyword Match Search (Full-text)
        // This helps find specific terms/codes that embeddings might miss
        const keywordSearchOptions: any = {
          limit: 15,
          filter: {
            must: [
              ...(activeDocument ? [{ key: "document", match: { value: activeDocument } }] : []),
              ...customFilters,
              {
                key: "text",
                match: {
                  text: optimizedQuery,
                },
              },
            ],
          },
        };

        const keywordResults = (await qdrant.scroll("college_docs", keywordSearchOptions)) || { points: [] };
        console.log(`[RAG Search] Keyword search (scroll) found ${keywordResults.points.length} candidates.`);

        // 3. Merge and Deduplicate
        const seenIds = new Set(vectorResults.map((r: any) => r.id));
        const combinedCandidates = [...vectorResults];
        
        for (const point of keywordResults.points) {
          if (!seenIds.has(point.id)) {
            combinedCandidates.push(point as any);
            seenIds.add(point.id);
          }
        }
        console.log(`[RAG Search] Total unique candidates for re-ranking: ${combinedCandidates.length}`);

        // 4. Re-ranking Step
        // Use LLM to intelligently rank the combined candidates
        const rankedResults = await reRankChunks(optimizedQuery, combinedCandidates);
        
        // Take top 8 highly relevant chunks for the final context
        qdrantResults = rankedResults.slice(0, 8);
        console.log(`[RAG Search] Final top ${qdrantResults.length} chunks selected after re-ranking.`);
      }

      // 4. Retrieve relevant info from Web (Live Search)
      let webResults: any[] = [];
      if (mode === "web" || mode === "compare") {
        console.log(`[RAG Search] Retrieving context from Live Web Search...`);
        webResults = (await searchWeb(optimizedQuery)) || [];
        console.log(`[RAG Search] WEB RESULTS FOUND: ${webResults.length}`);
      }

      // ── Rankings Context Injection ──────────────────────────────────
      // Detect college mentions in the user query and inject verified stats
      let rankingsContext = "";
      try {
        const mentioned = detectColleges(currentInput);
        if (mentioned.length >= 2) {
          // Comparison mode
          const rows: any[] = [];
          for (const name of mentioned.slice(0, 2)) {
            const res = await sql<any[]>`
              SELECT * FROM college_achievements
              WHERE college ILIKE ${"%" + name + "%"}  OR ${name} = ANY(aliases)
              LIMIT 1
            `;
            if (res[0]) rows.push({ ...res[0], innovation_score: computeInnovationScore(res[0] as any) });
          }
          if (rows.length === 2) {
            const [a, b] = rows as any[];
            rankingsContext = `
## VERIFIED COLLEGE COMPARISON (from NIRF 2024 database)

| Metric | ${a.college} | ${b.college} |
|---|---|---|
| Location | ${a.city}, ${a.state} | ${b.city}, ${b.state} |
| NIRF Rank (${a.nirf_category}) | #${a.nirf_rank ?? 'N/A'} | #${b.nirf_rank ?? 'N/A'} |
| QS Global Rank | ${a.global_rank ? '#' + a.global_rank : 'N/A'} | ${b.global_rank ? '#' + b.global_rank : 'N/A'} |
| Avg Package | ₹${a.avg_package}L | ₹${b.avg_package}L |
| Highest Package | ₹${a.highest_package}L | ₹${b.highest_package}L |
| Fees Range | ${a.fees_range ?? 'N/A'} | ${b.fees_range ?? 'N/A'} |
| User Rating | ${a.user_rating}/5 | ${b.user_rating}/5 |
| Patents Filed | ${a.patents ?? 0}+ | ${b.patents ?? 0}+ |
| Research Papers | ${a.research_papers ?? 0}+ | ${b.research_papers ?? 0}+ |
| Startups Incubated | ${a.startups_incubated ?? 0}+ | ${b.startups_incubated ?? 0}+ |
| Innovation Score | ${a.innovation_score} | ${b.innovation_score} |

Awards — ${a.college}: ${(a.awards as string[]).join(', ') || 'N/A'}
Awards — ${b.college}: ${(b.awards as string[]).join(', ') || 'N/A'}
`;
          }
        } else if (mentioned.length === 1) {
          // Single college profile
          const name = mentioned[0]!;
          const res = await sql<any[]>`
            SELECT * FROM college_achievements
            WHERE college ILIKE ${"%" + name + "%"} OR ${name} = ANY(aliases)
            LIMIT 1
          `;
          if (res[0]) {
            const c = res[0] as any;
            const score = computeInnovationScore(c);
            rankingsContext = `
## VERIFIED COLLEGE PROFILE — ${c.college} (from NIRF 2024 database)
- **Location**: ${c.city}, ${c.state}
- **NIRF Rank**: #${c.nirf_rank ?? 'N/A'} (${c.nirf_category})
- **QS Global Rank**: ${c.global_rank ? '#' + c.global_rank : 'Not ranked globally'}
- **Innovation Score**: ${score}/100
- **Placements**: Avg ₹${c.avg_package}L, Highest ₹${c.highest_package}L
- **Fees**: ${c.fees_range ?? 'N/A'}
- **User Satisfaction**: ${c.user_rating}/5 (${c.total_reviews} reviews)
- **Patents Filed**: ${c.patents ?? 0}+
- **Research Papers**: ${c.research_papers ?? 0}+
- **Startups Incubated**: ${c.startups_incubated ?? 0}+
- **Awards & Recognition**: ${(c.awards as string[]).join(' | ') || 'N/A'}
`;
          }
        }
      } catch (e) {
        console.warn("[Rankings] Context injection failed:", e);
      }
      // ── End Rankings Context Injection ─────────────────────────────


      // 4. Build Context & Sources
      let sourceCounter = 1;
      const sources: { id: number; type: "pdf" | "web"; name: string; url?: string; chunk?: number; page?: number }[] = [];

      const localContext = qdrantResults
        .map((r: any) => {
          const id = sourceCounter++;
          sources.push({ 
            id, 
            type: "pdf", 
            name: r.payload?.document, 
            chunk: r.payload?.chunk_index,
            page: r.payload?.page_number 
          });
          return `[Source ID: ${id}] (Document: ${r.payload?.document}, Page: ${r.payload?.page_number || "N/A"}) ${r.payload?.text}`;
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

      // When PDF context is present in web mode, build a hybrid context block.
      // Web results come FIRST — they are the primary source in web mode.
      const pdfSnippetSection = hasPdfContext
        ? `\nBACKGROUND CONTEXT (from user-uploaded PDF — use for college name/program identification only):\n${body.pdfContext!.slice(0, 3000)}\n`
        : "";

      const context = mode === "pdf"
        ? `INTERNAL_PDF_BASE (EXCLUSIVE):\n${localContext || "EMPTY (No documents uploaded or no relevant info found in PDFs)"}`
        : `LIVE_WEB_SEARCH_RESULTS (PRIMARY SOURCE — cite these):\n${webContext || "EMPTY (No relevant web search results found)"}${pdfSnippetSection}`;

      // 5. LLM messages (Pure Retrieval & Anti-Hallucination)
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `
You are a specialized College Assistant chatbot operating in **${mode.toUpperCase()} MODE${hasPdfContext ? " + PDF CONTEXT" : ""}**. 

${mode === "pdf" ? `
REASONING PROTOCOLS (PDF MODE):
1. You ONLY have access to INTERNAL_PDF_BASE.
2. IF INTERNAL_PDF_BASE is empty or doesn't contain the answer, you MUST state: **"The asked information is not available in the uploaded documents."**
3. DO NOT use external knowledge or web search.
` : `
REASONING PROTOCOLS (WEB MODE${hasPdfContext ? " + PDF BACKGROUND" : ""}):
1. Your PRIMARY source is LIVE_WEB_SEARCH_RESULTS. Always lead with live web data.
2. ${hasPdfContext ? "Use BACKGROUND CONTEXT ONLY to identify the college name, program, or topic. Then use LIVE_WEB_SEARCH_RESULTS to find up-to-date, specific answers from the college's official website." : "IF LIVE_WEB_SEARCH_RESULTS is empty, tell the user you couldn't find official information via web search."}
3. **NEVER answer from PDF content alone in WEB MODE** — always find and cite a live web source.
4. **STRICT DOMAIN ENFORCEMENT**: Only answer questions about colleges, universities, admissions, programs, campus life, scholarships, and entry tests.
5. If no web results exist, say: "I couldn't find up-to-date information from the web for this query."
`}

CORE RULES:
1. ONLY answer questions related to colleges, admissions, programs, and campus life.
2. ORGANIZE DATA INTO TABLES. If you are listing programs, courses, departments, or fees, you MUST use a Markdown Table.
3. NEVER make up facts. 
4. ALWAYS NAME THE COLLEGE. Specifically mention the institution name.
5. DO NOT use your internal training data for specific facts. In PDF Mode, if it's not in the PDF, it's not available.
6. YOU ARE CURRENTLY IN ${mode.toUpperCase()} MODE.
${mode === "compare" ? `
7. COMPARE MODE RULES:
   - Your primary mission is to provide objective, data-driven comparisons.
   - Use the [Verified Data] table below as your primary source of truth.
   - If the user asks for a comparison but you don't have [Verified Data] for one of the colleges, use the Web search results but CLEARLY state which data is verified and which is from the web.
   - Highlight winners in specific categories (e.g., "IIT Delhi leads in patents, while IIT Bombay has more startups").` : ""}

SOURCE CITATIONS:
1. Every factual claim MUST cite its source using the [Source ID: X] format.
${rankingsContext ? `
COLLEGE RANKINGS & ACHIEVEMENTS (VERIFIED — NIRF 2024 Official Data):
${rankingsContext}
When answering ranking or achievement questions, always use this verified data and label it as [Verified Data].` : ""}
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
        let sourcesText = "\n\n---\n**Sources:**\n";
        const seen = new Set<string>();
        const metadata: any[] = [];

        for (const s of usedSources) {
          const identifier = s.type === "pdf" ? `${s.name}-${s.chunk}-${s.page}` : s.url;
          if (!identifier || seen.has(identifier)) continue;
          seen.add(identifier);

          // Find the snippet from qdrantResults or webResults
          let snippet = "";
          if (s.type === "pdf") {
            const result = qdrantResults.find(r => r.payload?.document === s.name && r.payload?.chunk_index === s.chunk);
            snippet = result?.payload?.text || "";
            const pageInfo = s.page ? `, page ${s.page}` : "";
            sourcesText += `• ${s.name}${pageInfo}\n`;
          } else {
            const result = webResults.find(r => r.url === s.url);
            snippet = result?.content || "";
            sourcesText += `• ${s.url}\n`;
          }

          metadata.push({
            id: s.id,
            name: s.name,
            type: s.type,
            page: s.page,
            url: s.url,
            snippet: snippet.slice(0, 500) // limit size
          });
        }
        
        // Append hidden metadata for frontend intelligence (base64 to avoid breaking JSON/SSE)
        const encodedMeta = Buffer.from(JSON.stringify(metadata)).toString("base64");
        sourcesText += `\n[SOURCE_META:${encodedMeta}]`;

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