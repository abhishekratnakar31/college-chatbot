import { generateStream, generateSearchQuery, evaluateIntent, generateChatCompletion } from "../llm/openai.js";
import type { ChatMessage } from "../types/chat.js";
import { qdrant } from "../lib/qdrant.js";
import { getEmbedding } from "../llm/embedding.js";
import { searchWeb } from "../lib/search.js";
import { runInputGuardrails, runOutputGuardrails } from "../guardrails/index.js";
import { generatePdfAwareSearchQuery } from "../llm/queryEnricher.js";
import { reRankChunks } from "../llm/reranker.js";
import { detectColleges, computeInnovationScore } from "../routes/rankings.js";
import { sql } from "../lib/db.js";
import { getCache, setCache, buildQueryCacheKey } from "../lib/cache.js";
import { detectLanguage, getRespondInInstruction, isValidLangCode, SUPPORTED_LANGUAGES } from "../lib/languageDetector.js";

export async function processRAGQuery(
  history: ChatMessage[],
  options: {
    mode?: "pdf" | "web" | "compare";
    pdfContext?: string;
    pdfFilename?: string;
    filters?: Record<string, any>;
    language?: string;
    clientIp?: string;
    stream?: boolean;
  }
) {
  const mode = options.mode || "pdf";
  const rawInput = history[history.length - 1]!.content;
  const clientIp = options.clientIp || "unknown";

  // 1. Guardrails
  const inputCheck = runInputGuardrails(rawInput, clientIp);
  if (!inputCheck.pass) {
    return { error: inputCheck.message, blocked: true };
  }
  const currentInput = inputCheck.sanitizedInput;

  // 2. Language
  const langCode = (options.language && isValidLangCode(options.language))
    ? options.language
    : detectLanguage(currentInput);
  const langMeta = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
  const detectedLangName = langMeta?.name ?? "English";
  const respondInstruction = getRespondInInstruction(langCode);

  // 3. Rankings Parallel Search
  const rankingsPromise = (async () => {
    let context = "";
    try {
      const mentioned = detectColleges(currentInput);
      if (mentioned.length >= 1) {
        const rows = await Promise.all(
          mentioned.slice(0, 2).map(async (name) => {
            const res = await sql<any[]>`
              SELECT * FROM college_achievements
              WHERE college ILIKE ${"%" + name + "%"} OR ${name} = ANY(aliases)
              LIMIT 1
            `;
            if (res[0]) return { ...res[0], innovation_score: computeInnovationScore(res[0] as any) };
            return null;
          })
        );
        const validRows = rows.filter(Boolean);
        if (validRows.length === 2) {
          const [a, b] = validRows as any[];
          context = `\n## VERIFIED COLLEGE COMPARISON\n(Comparison data injected for ${a.college} vs ${b.college})\n`;
        } else if (validRows.length === 1) {
          const c = validRows[0] as any;
          context = `\n## VERIFIED COLLEGE PROFILE — ${c.college}\n(Profile data injected for ${c.college})\n`;
        }
      }
    } catch (e) {
      console.warn("[Rankings] Context injection failed:", e);
    }
    return context;
  })();

  // 4. Intent & Query Optimization
  const hasPdfContext = (mode === "web" && (!!options.pdfContext?.trim() || !!options.pdfFilename?.trim()));
  const pdfContextForQuery = options.pdfContext || `Document: ${options.pdfFilename}`;

  const [rawOptimizedQuery, intentResult] = await Promise.all([
    hasPdfContext
      ? generatePdfAwareSearchQuery(currentInput, pdfContextForQuery)
      : generateSearchQuery(history, detectedLangName),
    evaluateIntent(history),
  ]);

  if (intentResult === "OUT_OF_DOMAIN") {
    return { error: "I am a College Assistant. Please ask me academic questions!", blocked: true };
  }

  let finalQuery = rawOptimizedQuery === "OUT_OF_DOMAIN" ? currentInput : rawOptimizedQuery;

  // 5. Retrieval
  const cacheKey = buildQueryCacheKey(mode, finalQuery, null); // Simplified cache key
  let qdrantResults: any[] = [];
  let webResults: any[] = [];

  const cached = getCache<any>(cacheKey);
  if (cached) {
    qdrantResults = cached.qdrantResults || [];
    webResults = cached.webResults || [];
  } else {
    if (mode === "pdf") {
      qdrantResults = await qdrant.search("college_docs", { limit: 10, vector: await getEmbedding(finalQuery) });
    } else {
      webResults = await searchWeb(finalQuery);
    }
    setCache(cacheKey, { qdrantResults, webResults }, 300000);
  }

  const rankingsContext = await rankingsPromise;

  // 6. Context Building
  const context = mode === "pdf" 
    ? qdrantResults.map(r => r.payload?.text).join("\n\n")
    : webResults.map(r => r.content).join("\n\n");

  const systemMessage = {
    role: "system",
    content: `You are a College Assistant in ${mode.toUpperCase()} mode. 
    Using these facts: ${context}
    ${rankingsContext}
    ${respondInstruction}
    Rules: Answer only academic questions. Be concise. Citing sources is required.`
  };

  const messages = [systemMessage, ...history.slice(-5)];

  if (options.stream) {
    return { stream: await generateStream(messages as any), metadata: { qdrantResults, webResults } };
  } else {
    const text = await generateChatCompletion(messages as any);
    return { text, metadata: { qdrantResults, webResults } };
  }
}
