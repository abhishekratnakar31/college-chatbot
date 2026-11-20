import type { FastifyInstance } from "fastify";
import { generateStream, generateOptimizedQueryAndIntent } from "../llm/openai.js";
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
import { logApiUsage } from "../lib/apiUsageLogger.js";
import { getCache, setCache, buildQueryCacheKey } from "../lib/cache.js";
import { detectLanguage, getRespondInInstruction, isValidLangCode, SUPPORTED_LANGUAGES } from "../lib/languageDetector.js";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdminApp } from "../lib/firebaseAdmin.js";
import { env } from "../utils/env.js";

async function extractUser(request: any) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ") || !firebaseAdminApp) return null;
  try {
    const decoded = await getAuth(firebaseAdminApp).verifyIdToken(authHeader.substring(7));
    return { uid: decoded.uid, email: decoded.email || null, name: decoded.name || null };
  } catch {
    return null;
  }
}

export async function chatRoute(app: FastifyInstance) {
  app.post("/chat", async (request, reply) => {
    try {
      const chatUser = await extractUser(request);
      const body = request.body as {
        messages?: ChatMessage[];
        mode?: "research" | "compare";   // Two modes: research (web+pdf) | compare (multi-college)
        colleges?: string[];              // Up to 5 college names for compare mode
        pdfContext?: string;             // Extracted PDF text (may be empty for scanned PDFs)
        pdfFilename?: string;            // PDF filename — used as fallback when text is empty
        filters?: Record<string, any>;   // Optional metadata filters (e.g. { page_number: 5 })
        language?: string;               // Optional explicit language code override (e.g. "hi", "ta")
        contextHint?: string;            // Optional context hint (e.g. college name for widget)
      };
      const mode = body.mode || "research";

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
      // ── END INPUT GUARDRAILS ──────────────────────────────────────────────

      const inputLangCode = detectLanguage(currentInput);
      const responseLangCode = (body.language && isValidLangCode(body.language))
        ? body.language
        : inputLangCode;

      const inputLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === inputLangCode);
      const responseLangMeta = SUPPORTED_LANGUAGES.find(l => l.code === responseLangCode);
      
      const inputLangName = inputLangMeta?.name ?? "English";
      const responseLangName = responseLangMeta?.name ?? "English";
      
      const respondInstruction = getRespondInInstruction(responseLangCode);

      if (responseLangCode !== "en" || inputLangCode !== "en") {
        console.log(`[Language] Input: ${inputLangName} (${inputLangCode}), Response: ${responseLangName} (${responseLangCode}) — ${body.language ? "user-selected" : "auto-detected"}`);
      }
      // ── END LANGUAGE DETECTION ───────────────────────────────────────────

      // ── GREETINGS & INTRO FAST-PATH ──────────────────────────────────────
      const GREETING_REGEX = /^(hi|hello|hey|heya|howdy|greetings|good\s+(morning|afternoon|evening)|namaste|hola|sup|yo)(\s+there|\s+bot|\s+academiaai)?[\s.!?]*$/i;
      const IDENTITY_REGEX = /^(who\s+are\s+you|what\s+can\s+you\s+do|what\s+is\s+academiaai|what\s+do\s+you\s+do|tell\s+me\s+about\s+yourself)[\s.!?]*$/i;

      if (GREETING_REGEX.test(currentInput.trim()) || IDENTITY_REGEX.test(currentInput.trim())) {
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        const welcomeMsg = `Hello! 👋 I'm **AcademiaAI**, your dedicated college and university intelligence assistant.\n\nI can help you with:\n- 🏛️ **College & University Research** — profiles, accreditations, facilities\n- 📋 **Admissions & Cut-offs** — eligibility criteria, opening & closing ranks\n- 💰 **Fees & Scholarships** — tuition, hostel costs, fee waivers, financial aid\n- 📚 **Courses & Degrees** — B.Tech, MBA, MBBS, specializations\n- 🏆 **Rankings & Placements** — NIRF, QS rankings, packages, top recruiters\n- ⚖️ **Side-by-Side Comparisons** — compare up to 5 colleges across key metrics\n\nWhich college, course, or entrance exam would you like to explore today?`;
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: welcomeMsg } }] })}\n\n`);
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
        return;
      }
      // ── END GREETINGS FAST-PATH ──────────────────────────────────────────

      console.log(`\n[RAG Search] ------------------------------------------------`);
      console.log(`[RAG Search] User question received: "${currentInput}"`);
      console.log(`[RAG Search] Mode: ${mode}, Context Hint: ${body.contextHint || "None"}`);
      if (mode === "compare" && body.colleges?.length) {
        console.log(`[RAG Search] Colleges to compare: ${body.colleges.join(", ")}`);
      }
      console.log(`[RAG Search] Optimizing query for vector search...`);

      // ── Rankings Context Injection (Parallel) ───────────────────────
      const rankingsPromise = (async () => {
        let context = "";
        try {
          // ── Compare Mode: fetch verified data for up to 5 colleges ──
          if (mode === "compare" && body.colleges && body.colleges.length >= 2) {
            const colleges = body.colleges.slice(0, 5); // Hard cap at 5
            const rows = await Promise.all(
              colleges.map(async (name) => {
                const res = await sql<any[]>`
                  SELECT * FROM college_achievements
                  WHERE college ILIKE ${"%" + name + "%"} OR ${name} = ANY(aliases)
                  LIMIT 1
                `;
                if (res[0]) return { ...res[0], innovation_score: computeInnovationScore(res[0] as any) };
                return null;
              })
            );
            const validRows = rows.filter(Boolean) as any[];

            if (validRows.length >= 2) {
              // Build dynamic multi-college comparison table
              const headers = ["Metric", ...validRows.map(c => c.college)];
              const divider = headers.map(() => "---").join(" | ");
              const headerRow = headers.join(" | ");

              const metrics: { label: string; fn: (c: any) => string }[] = [
                { label: "Location", fn: c => `${c.city}, ${c.state}` },
                { label: `NIRF Rank`, fn: c => `#${c.nirf_rank ?? "N/A"} (${c.nirf_category})` },
                { label: "QS Global Rank", fn: c => c.global_rank ? `#${c.global_rank}` : "N/A" },
                { label: "Avg Package", fn: c => `₹${c.avg_package}L` },
                { label: "Highest Package", fn: c => `₹${c.highest_package}L` },
                { label: "Fees Range", fn: c => c.fees_range ?? "N/A" },
                { label: "User Rating", fn: c => `${c.user_rating}/5` },
                { label: "Patents Filed", fn: c => `${c.patents ?? 0}+` },
                { label: "Research Papers", fn: c => `${c.research_papers ?? 0}+` },
                { label: "Startups Incubated", fn: c => `${c.startups_incubated ?? 0}+` },
                { label: "Innovation Score", fn: c => `${c.innovation_score}/100` },
                { label: "Official Website", fn: c => c.website ? `[${c.website.replace(/^https?:\/\/(www\.)?/, "")}](${c.website})` : "N/A" },
              ];

              const tableRows = metrics.map(m =>
                `| ${m.label} | ${validRows.map(c => m.fn(c)).join(" | ")} |`
              );

              context = `
## VERIFIED MULTI-COLLEGE COMPARISON (NIRF 2024 Database — ${validRows.length} institutions)

| ${headerRow} |
| ${divider} |
${tableRows.join("\n")}

${validRows.map(c => `**Awards — ${c.college}**: ${(c.awards as string[]).join(", ") || "N/A"}`).join("\n")}
`;
            }
            return context;
          }

          // ── Research / single-college mode ──────────────────────────
          // If a contextHint is provided, use it as a primary college for detection
          const queryForDetection = body.contextHint
            ? `${body.contextHint} ${currentInput}`
            : currentInput;

          let mentioned = detectColleges(queryForDetection);

          // STRICT FILTER: If contextHint is present, ignore any other colleges mentioned
          if (body.contextHint) {
            mentioned = mentioned.filter(name =>
              name.toLowerCase().includes(body.contextHint!.toLowerCase()) ||
              body.contextHint!.toLowerCase().includes(name.toLowerCase())
            );
            if (mentioned.length === 0) mentioned = [body.contextHint];
          }

          if (mentioned.length >= 2 && !body.contextHint) {
            // Two colleges found — show comparison table
            const rows = await Promise.all(
              mentioned.slice(0, 2).map(async (name) => {
                const res = await sql<any[]>`
                  SELECT * FROM college_achievements
                  WHERE college ILIKE ${"%" + name + "%"}  OR ${name} = ANY(aliases)
                  LIMIT 1
                `;
                if (res[0]) return { ...res[0], innovation_score: computeInnovationScore(res[0] as any) };
                return null;
              })
            );
            const validRows = rows.filter(Boolean);
            if (validRows.length === 2) {
              const [a, b] = validRows as any[];
              context = `
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
| Official Website | ${a.website ? `[${a.website.replace(/^https?:\/\/(www\.)?/, "")}](${a.website})` : 'N/A'} | ${b.website ? `[${b.website.replace(/^https?:\/\/(www\.)?/, "")}](${b.website})` : 'N/A'} |

Awards — ${a.college}: ${(a.awards as string[]).join(', ') || 'N/A'}
Awards — ${b.college}: ${(b.awards as string[]).join(', ') || 'N/A'}
`;
            }
          } else if (mentioned.length === 1 || body.contextHint) {
            const name = mentioned[0] || body.contextHint!;
            const res = await sql<any[]>`
              SELECT * FROM college_achievements
              WHERE college ILIKE ${"%" + name + "%"} OR ${name} = ANY(aliases)
              LIMIT 1
            `;
            if (res[0]) {
              const c = res[0] as any;
              const score = computeInnovationScore(c);
              context = `
## VERIFIED COLLEGE PROFILE — ${c.college} (from NIRF 2024 database)
- **Location**: ${c.city}, ${c.state}
- **Official Website**: ${c.website ? `[${c.website}](${c.website})` : 'N/A'}
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
        return context;
      })();

      // 1. ── Router: Optimize Query + Evaluate Intent (SINGLE CALL) ─────────
      const hasPdfText = !!body.pdfContext?.trim();
      const hasPdfFilename = !!body.pdfFilename?.trim();
      const hasPdfContext = hasPdfText || hasPdfFilename;

      const { query: rawOptimizedQuery, intent: intentResult, variants: queryVariantsFromRouter } = await generateOptimizedQueryAndIntent(
        history,
        inputLangName,
        body.contextHint
      );

      // 1a. Intent check — early exit before any retrieval cost
      if (intentResult === "OUT_OF_DOMAIN") {
        reply.raw.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "Access-Control-Allow-Origin": "*",
        });
        const refusalMsg = `I'm **AcademiaAI**, your dedicated college & university intelligence assistant. 🎓

I'm best suited to help you with:
- 🏛️ **College & University Info** — profiles, history, accreditations
- 📋 **Admissions** — eligibility, cut-offs, application process, deadlines
- 💰 **Fees & Scholarships** — tuition, hostel, mess fees, financial aid
- 📚 **Courses & Programs** — B.Tech, MBA, M.Tech, BBA, BCA, and more
- 🏆 **Rankings & Placements** — NIRF, QS World, packages, recruiters
- 🏠 **Campus Life** — hostels, clubs, sports, fests, facilities
- ⚖️ **College Comparisons** — side-by-side analysis of up to 5 institutions
- 🔬 **Research & Innovation** — patents, papers, incubators

Please ask me anything in these areas and I'll be happy to help!`;
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: refusalMsg } }] })}\n\n`);
        reply.raw.write("data: [DONE]\n\n");
        reply.raw.end();
        return;
      }

      // 1b. Query Expansion (Improve Recall)
      const queryVariants = (intentResult === "VALID" && !hasPdfContext)
        ? [rawOptimizedQuery, ...queryVariantsFromRouter]
        : [rawOptimizedQuery];

      // 1c. Sanitize out-of-domain query string (safety net)
      let finalQuery = rawOptimizedQuery;
      if (finalQuery === "OUT_OF_DOMAIN") {
        if (hasPdfContext) {
          const nameHint = body.pdfFilename
            ? body.pdfFilename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ")
            : "college information";
          finalQuery = `${nameHint} admissions courses programs`;
        } else {
          finalQuery = currentInput;
        }
      }

      // 2. Extract active document contexts from history
      let activeDocuments: string[] = [];
      for (let i = history.length - 1; i >= 0; i--) {
        const msg = history[i];
        if (msg && msg.content.startsWith("ATTACHMENT|")) {
          const parts = msg.content.split("|");
          if (parts.length > 1 && parts[1]) {
            if (!activeDocuments.includes(parts[1])) {
              activeDocuments.push(parts[1]);
            }
          }
        }
      }

      // 3. ── Retrieval with Cache ──────────────────────────────────────────────
      const cacheKey = buildQueryCacheKey(mode, queryVariants.join("|"), activeDocuments);
      const TTL_RESEARCH = 4 * 60 * 1000;
      const TTL_COMPARE = 3 * 60 * 1000;

      interface CachedRetrieval { qdrantResults: any[]; webResults: any[]; }
      let qdrantResults: any[] = [];
      let webResults: any[] = [];

      const cached = getCache<CachedRetrieval>(cacheKey);
      if (cached) {
        console.log(`[Cache] ✅ HIT — skipping retrieval for variants: ${queryVariants.length}`);
        qdrantResults = cached.qdrantResults;
        webResults = cached.webResults;
      } else {
        if (mode === "research") {
          // ── Research Mode: Parallel Web + PDF + News retrieval ──────────────
          // All three run simultaneously for maximum speed
          const [tavilyResults, newsResults, pdfResults] = await Promise.all([
            // 1. Live web search — run multiple query variants for comprehensive coverage
            (async () => {
              const variantResults = await Promise.all(
                queryVariants.slice(0, 3).map(q => searchWeb(q))
              );
              const seen = new Set<string>();
              return variantResults.flat().filter(r => {
                const key = r.url || r.title;
                if (!key || seen.has(key)) return false;
                seen.add(key);
                return true;
              }).slice(0, 12);
            })(),

            // 2. News vector search
            (async () => {
              try {
                const queryEmbedding = await getEmbedding(queryVariants[0]!);
                const res = await qdrant.search("college_news", {
                  vector: queryEmbedding,
                  limit: 8
                });
                return res.map(r => ({
                  title: `News: ${r.payload?.title || "Latest Update"}`,
                  url: r.payload?.url || "#",
                  content: r.payload?.text || "",
                  score: r.score
                }));
              } catch (e) {
                console.warn("[News Search] Failed:", e);
                return [];
              }
            })(),

            // 3. PDF vector + keyword search (only if documents are uploaded)
            (async () => {
              if (activeDocuments.length === 0) return [];
              try {
                const k = 60; // RRF constant
                const scores: Record<string, { score: number; point: any }> = {};

                const queryEmbedding = await getEmbedding(queryVariants[0]!);

                const vectorRes = await qdrant.search("college_docs", {
                  vector: queryEmbedding,
                  limit: 15,
                  filter: { must: [{ key: "document", match: { any: activeDocuments } }] }
                });

                const keywordRes = await qdrant.scroll("college_docs", {
                  limit: 10,
                  filter: {
                    must: [
                      { key: "document", match: { any: activeDocuments } },
                      { key: "text", match: { text: queryVariants[0]! } }
                    ]
                  }
                });

                vectorRes.forEach((r, rank) => {
                  const id = String(r.id);
                  if (!scores[id]) scores[id] = { score: 0, point: r };
                  scores[id].score += 1 / (k + rank + 1);
                });

                keywordRes.points.forEach((r, rank) => {
                  const id = String(r.id);
                  if (!scores[id]) scores[id] = { score: 0, point: r };
                  scores[id].score += 1 / (k + rank + 1);
                });

                const combined = Object.values(scores)
                  .sort((a, b) => b.score - a.score)
                  .map(s => s.point);

                const rankedResults = combined.length > 3
                  ? await reRankChunks(queryVariants[0]!, combined.slice(0, 15))
                  : combined;

                const filtered = rankedResults.filter((r: any) => (r.rerank_score || 0) >= 4).slice(0, 6);
                return filtered.length > 0 ? filtered : rankedResults.slice(0, 3);
              } catch (e) {
                console.warn("[PDF Search] Failed:", e);
                return [];
              }
            })()
          ]);

          webResults = [...newsResults, ...tavilyResults];
          qdrantResults = pdfResults;

        } else if (mode === "compare") {
          // ── Compare Mode: Web search across all colleges ─────────────────
          const compareQuery = body.colleges?.length
            ? `${body.colleges.join(" vs ")} comparison ${queryVariants[0]}`
            : queryVariants[0]!;

          const [tavilyResults, newsResults] = await Promise.all([
            searchWeb(compareQuery),
            (async () => {
              try {
                const queryEmbedding = await getEmbedding(compareQuery);
                const res = await qdrant.search("college_news", {
                  vector: queryEmbedding,
                  limit: 8
                });
                return res.map(r => ({
                  title: `News: ${r.payload?.title || "Latest Update"}`,
                  url: r.payload?.url || "#",
                  content: r.payload?.text || "",
                  score: r.score
                }));
              } catch (e) {
                console.warn("[News Search] Failed:", e);
                return [];
              }
            })()
          ]);

          webResults = [...newsResults, ...tavilyResults];
        }

        setCache<CachedRetrieval>(cacheKey, { qdrantResults, webResults }, mode === "research" ? TTL_RESEARCH : TTL_COMPARE);
        console.log(`[Cache] STORED — mode: ${mode}, variants: ${queryVariants.length}, ttl: ${mode === "research" ? "4m" : "3m"}`);
      }

      const rankingsContext = await rankingsPromise;

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
          return `[Source ID: ${id}] [PDF Source — Document: ${r.payload?.document}, Page: ${r.payload?.page_number || "N/A"}] ${(r.payload?.text || "").slice(0, 1200)}`;
        })
        .filter(Boolean)
        .join("\n\n");

      const webContext = webResults
        .map((r: any) => {
          const id = sourceCounter++;
          sources.push({ id, type: "web", name: r.title, url: r.url });
          return `[Source ID: ${id}] [Web Source — ${r.title}] ${(r.content || "").slice(0, 1000)}`;
        })
        .join("\n\n");

      // Build unified context block for research mode
      const hasPdfDocs = activeDocuments.length > 0 && qdrantResults.length > 0;
      let context = "";

      if (mode === "research") {
        const webSection = `LIVE WEB SEARCH RESULTS (Primary Source — cite these):\n${webContext || "EMPTY (No relevant web results found)"}`;
        const pdfSection = hasPdfDocs
          ? `\n\nUPLOADED PDF DOCUMENTS (Supplementary Source — use for specific document questions):\n${localContext}`
          : hasPdfContext
          ? `\n\nBACKGROUND PDF CONTEXT (use for college name/program identification):\n${body.pdfContext!.slice(0, 2500)}`
          : "";
        context = webSection + pdfSection;
      } else {
        context = `LIVE WEB SEARCH RESULTS (Primary Source — cite these):\n${webContext || "EMPTY (No relevant web results found)"}`;
      }

      // 5. LLM messages
      const compareColleges = mode === "compare" && body.colleges?.length
        ? body.colleges.slice(0, 5)
        : [];

      const messages: ChatMessage[] = [
        {
          role: "system",
          content: `You are AcademiaAI, a dedicated College & University Intelligence Assistant in **${mode.toUpperCase()} MODE**.
${body.contextHint ? `Only answer about **${body.contextHint}**.` : ""}

CORE IDENTITY & SCOPE (STRICT):
1. You ONLY provide information regarding colleges, universities, admissions, entrance exams, courses, degrees, rankings, placements, campus life, hostels, fees, and scholarships.
2. If the user asks an off-topic question unrelated to colleges, universities, or academic education (e.g. food recipes, tea, cooking, movies, entertainment, sports results, general coding, or medical advice), you MUST POLITELY REFUSE. Explain that you are strictly an academic intelligence assistant and ask how you can help with their college research.
3. STRICT FACTUAL GROUNDING & ANTI-HALLUCINATION:
   - Base all college information, statistics, and figures STRICTLY on the verified database and retrieved context provided below.
   - NEVER invent or fabricate fee figures, placement packages, NIRF rankings, or cut-offs.
   - If a specific statistic or detail is not present in the provided context, state "Information not available in verified records" rather than guessing.
   - Cite retrieved sources using [1], [2] annotations.

Output format rules (FOLLOW EXACTLY):

1. Use ## then ### headings. Never write plain text without a heading above it.

2. Tables: correct pipe syntax.
   CORRECT:
| Name | Fee |
|------|-----|
| IIT | 8L |
   NEVER write | Name | Fee | | :----- (extra pipe + broken alignment)

3. Each table = one topic only. Never merge colleges + fees + exams into one table.

4. For general college or academic program inquiries (e.g. "tell me about B.Tech CSE" or "tell me about IIT Delhi"):
## Overview of [Topic]
### Key Details
| Aspect | Detail |
|--------|--------|
| Duration | 4 years |
### Top Colleges
| College | Location | Fee |
|---------|----------|-----|
| IIT | Delhi | 8L |
### Admission
| Exam | Level |
|------|-------|
| JEE | National |

5. Never truncate. Write the full answer, complete every sentence and every table row.

${mode === "research" ? "Use web results. If sparse, state what is verified and mention that official college brochures should be checked." : ""}
${mode === "compare" ? `Compare: ${compareColleges.join(" | ")}. Start with a brief intro paragraph. Then for EACH college, create a section starting with "### [College Name]" containing a metrics table with fees, ranking, placements, and key details. End with "## 🏆 Our Recommendation". Every college MUST have its own ### heading section.` : ""}
${rankingsContext ? `NIRF data: [NIRF 2024].` : ""}
${context}
${respondInstruction || ""}`,
        },
        ...history.slice(-(env.CHAT_HISTORY_LIMIT || 20))
      ];

      // Reinforce language instruction at the very end of the prompt
      if (respondInstruction && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.role === "user") {
          lastMessage.content += `\n\n[STRICT RULE: Respond entirely in ${responseLangName}. Do not use English.]`;
        } else if (lastMessage) {
          messages.push({
            role: "system",
            content: `CRITICAL: ${respondInstruction}`
          });
        }
      }

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
      let usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | null = null;

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        reply.raw.write(chunk);

        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine.startsWith("data:")) continue;

          const json = trimmedLine.replace("data: ", "").trim();
          if (json === "[DONE]") continue;

          try {
            const jsonValue = JSON.parse(json);
            // Capture usage from the final streaming chunk (choices is empty, usage is present)
            if (jsonValue.usage) {
              usage = jsonValue.usage;
            }
            const content = jsonValue.choices?.[0]?.delta?.content;
            if (content) assistantReply += content;
          } catch {
            // Partial JSON — buffer logic handles it
          }
        }
      }

      // ── OUTPUT GUARDRAILS ───────────────────────────────────────────
      const contextChunksFound = qdrantResults.length + webResults.length;
      const outputCheck = runOutputGuardrails({
        response: assistantReply,
        contextChunksFound,
        mode: mode === "research" ? "web" : "compare", // map to legacy guardrail interface
        language: responseLangCode
      });

      if (outputCheck.triggered.length > 0) {
        console.info(`[GUARDRAIL][OUTPUT] Triggered: ${outputCheck.triggered.join(", ")}`);
      }

      if (outputCheck.wasModified && !outputCheck.wasBlocked) {
        const delta = outputCheck.finalResponse.slice(assistantReply.length);
        if (delta) {
          reply.raw.write(
            `data: ${JSON.stringify({ choices: [{ delta: { content: delta } }] })}\n\n`
          );
        }
      }

      if (outputCheck.wasBlocked) {
        reply.raw.write(
          `data: ${JSON.stringify({ choices: [{ delta: { content: "\n\n⚠️ " + outputCheck.finalResponse } }] })}\n\n`
        );
      }

      assistantReply = outputCheck.finalResponse;
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

          let snippet = "";
          if (s.type === "pdf") {
            const result = qdrantResults.find(r => r.payload?.document === s.name && r.payload?.chunk_index === s.chunk);
            snippet = result?.payload?.text || "";
            const pageInfo = s.page ? `, page ${s.page}` : "";
            sourcesText += `• [PDF] ${s.name}${pageInfo}\n`;
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
            snippet: snippet.slice(0, 500)
          });
        }

        const encodedMeta = Buffer.from(JSON.stringify(metadata)).toString("base64");
        sourcesText += `\n[SOURCE_META:${encodedMeta}]`;

        assistantReply += sourcesText;
        reply.raw.write(`data: ${JSON.stringify({ choices: [{ delta: { content: sourcesText } }] })}\n\n`);
      }

      reply.raw.write("data: [DONE]\n\n");
      reply.raw.end();

      if (!outputCheck.wasBlocked && assistantReply.length > 50) {
        const pt = usage?.prompt_tokens ?? 0;
        const ct = usage?.completion_tokens ?? 0;
        const cost = (pt / 1_000_000 * 0.15) + (ct / 1_000_000 * 0.60); // GPT-4o-mini pricing
        const uid = chatUser?.uid ?? "anonymous";
        const email = chatUser?.email ?? null;
        sql`
          INSERT INTO user_activity (uid, email, action, details)
          VALUES (${uid}, ${email}, 'chat_query', ${JSON.stringify({
            query: currentInput.slice(0, 200),
            mode,
            lang: responseLangCode,
            prompt_tokens: pt,
            completion_tokens: ct,
            total_tokens: pt + ct,
            cost: Math.round(cost * 1_000_000) / 1_000_000,
          })})
        `.catch(() => {});
        logApiUsage({
          model: env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
          endpointType: "chat_stream",
          promptTokens: pt,
          completionTokens: ct,
          totalTokens: pt + ct,
          metadata: { mode, lang: responseLangCode },
        });
      }
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