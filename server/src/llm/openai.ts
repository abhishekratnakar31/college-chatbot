import { fetchWithTimeout } from "../utils/fetchUtils.js";
import type { ChatMessage } from "../types/chat.js";

export async function generateStream(messages: ChatMessage[]) {
  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "College Chatbot",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        stream: true,
        messages,
        max_tokens: 2000,
      }),
    },
    30000 // Stream can take longer
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Error: ${errText}`);
  }
  return response.body;
}

/**
 * Standard non-streaming chat completion
 */
export async function generateChatCompletion(messages: ChatMessage[], model = "openai/gpt-4o-mini") {
  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Error: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function generateSearchQuery(
  messages: ChatMessage[],
  detectedLangName: string = "English",
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  // Strip out any internal SYSTEM: blocks from the query optimizer input
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  // If the user is writing in a non-English language, instruct the LLM to
  // always output the search query in English for accurate vector search.
  const langRule = detectedLangName !== "English"
    ? ` (5) The user is currently writing in ${detectedLangName}. ALWAYS translate and output the search query in ENGLISH only — the search index is in English.`
    : "";

  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              `You are a search query optimizer for a College Assistant chatbot. Your ONLY job is to rewrite the user's question into a clean, specific web search query. RULES: (1) ALWAYS output a search query — never refuse. (2) Only reply OUT_OF_DOMAIN if the question is unrelated to institutional information, admissions, or academic programs. (3) DO NOT search for general lifestyle, health, diet, or medical advice even if 'campus' is mentioned. (4) Output ONLY the search query.${langRule}`,
          },
          ...messages.slice(-5).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
        ],
        max_tokens: 50,
      }),
    },
  );

  if (!response.ok) {
    console.error(
      "generateSearchQuery API Error:",
      response.status,
      await response.text().catch(() => ""),
    );
    return lastMessage;
  }

  try {
    const data = await response.json();
    const query =
      data.choices?.[0]?.message?.content?.replace(/\"/g, "") || lastMessage;
    console.log("Optimized Search Query:", query);
    return query;
  } catch (error) {
    console.error("generateSearchQuery JSON Parse Error:", error);
    return lastMessage;
  }
}
/**
 * Multi-Query Expansion
 * Generates 3 diverse rephrasings of the user's query to improve retrieval recall.
 * Each variant captures different keyword angles and synonyms.
 */
export async function generateMultiQuery(
  originalQuery: string,
): Promise<string[]> {
  try {
    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a search query diversifier for a College/University information system.
Given a search query, generate exactly 3 alternative phrasings that capture different angles and synonyms.

RULES:
1. Each variant must use different keywords while preserving the original intent.
2. Include abbreviations, full names, and alternate terms (e.g., "fees" → "tuition cost", "IIT" → "Indian Institute of Technology").
3. One variant should focus on specific details, one on broader context, one on common misspellings or colloquial terms.
4. Output ONLY a JSON array of 3 strings. No explanation.
5. Keep each query under 15 words.

Example input: "IIT Bombay placement stats"
Example output: ["IITB campus recruitment statistics", "Indian Institute of Technology Bombay job placement data", "IIT Bombay placement record package salary"]`,
            },
            { role: "user", content: originalQuery },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      console.warn("[MultiQuery] API error, falling back to original query");
      return [originalQuery];
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    try {
      const queries = JSON.parse(content.match(/\[.*\]/s)?.[0] || content);
      if (Array.isArray(queries) && queries.length > 0) {
        // Always include the original query + up to 3 variants
        const result = [originalQuery, ...queries.slice(0, 3)];
        console.log(`[MultiQuery] Expanded to ${result.length} variants: ${result.map(q => `"${q}"`).join(", ")}`);
        return result;
      }
    } catch (parseErr) {
      console.warn("[MultiQuery] Parse error, falling back to original query:", parseErr);
    }

    return [originalQuery];
  } catch (error) {
    console.error("[MultiQuery] Error:", error);
    return [originalQuery];
  }
}

export async function evaluateIntent(messages: ChatMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  // HEURISTIC: If the query explicitly contains academic keywords, bypass LLM classification
  const academicKeywords = [
    "fees", "placement", "ranking", "admission", "cutoff", "eligibility", 
    "course", "curriculum", "syllabus", "hostel", "scholarship", "internship",
    "better", "best", "worst", "versus", " vs ", "difference", "compare",
    "univer", "clg", "collge", "college", "institute", "faculty"
  ];
  if (academicKeywords.some(kw => sanitizedInput.toLowerCase().includes(kw))) {
    return "VALID";
  }

  const response = await fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a domain classifier for AcademiaAI, a strict academic intelligence assistant.
Your job is to evaluate if the user's query is within the academic scope.

VALID SCOPE:
- College/University information (Fees, Placements, Rankings, Admissions, Courses, Campus facilities, official student life).
- Subjective comparisons between institutions (e.g., "which is better", "A vs B").
- Short follow-ups like "its fees", "what about placements", "show rankings", "which is best" are VALID if they refer to a college.

OUT OF SCOPE:
- General life advice (health, medical, recipes, relationships, workout).
- Social/Behavioral issues (fights, bullying, dating, gossip, illegal acts).
- Irrelevant topics (weather, sports, movies, politics).

RULE:
- If the query is about comparing institutions or discussing academic metrics, it is ALWAYS 'VALID'.
- Do not let previous off-topic queries poison the evaluation of a NEW on-topic query.
- Reply EXACTLY 'VALID' or 'OUT_OF_DOMAIN'.`,
          },
          ...messages.slice(-3).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    },
  );

  if (!response.ok) return "VALID";

  try {
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "VALID";
    return result.includes("OUT_OF_DOMAIN") ? "OUT_OF_DOMAIN" : "VALID";
  } catch {
    return "VALID";
  }
}
/**
 * Combined Query Optimizer & Intent Evaluator
 * Reduces total request latency by combining two LLM calls into one round-trip.
 */
export async function generateOptimizedQueryAndIntent(
  messages: ChatMessage[],
  detectedLangName: string = "English"
): Promise<{ query: string; intent: "VALID" | "OUT_OF_DOMAIN"; variants: string[] }> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  // HEURISTIC: Fast-path for obvious academic queries
  const academicKeywords = [
    "fees", "placement", "ranking", "admission", "cutoff", "eligibility", 
    "course", "curriculum", "syllabus", "hostel", "scholarship", "internship",
    "better", "best", "worst", "versus", " vs ", "difference", "compare",
    "univer", "clg", "collge", "college", "institute", "faculty"
  ];
  const isLikelyAcademic = academicKeywords.some(kw => sanitizedInput.toLowerCase().includes(kw));

  const langRule = detectedLangName !== "English"
    ? ` (5) The user is writing in ${detectedLangName}. ALWAYS translate the 'query' into ENGLISH.`
    : "";

  try {
    const response = await fetchWithTimeout(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a specialized router for a College Assistant. Analyze the user's request.
RULES:
1. 'intent': 'VALID' if the query is about colleges, admissions, programs, or institutional info. 'OUT_OF_DOMAIN' otherwise.
2. 'query': A clean, keyword-dense search query optimized for a vector database. ${langRule}
3. 'variants': Array of 2 alternative phrasings using synonyms (e.g. "fees" vs "tuition").
4. Output ONLY a JSON object: {"intent": "VALID"|"OUT_OF_DOMAIN", "query": "string", "variants": ["str1", "str2"]}`,
            },
            ...messages.slice(-3).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
          ],
          max_tokens: 150,
          temperature: 0,
          response_format: { type: "json_object" }
        }),
      }
    );

    if (!response.ok) throw new Error("LLM Router failed");

    const data = await response.json();
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    
    return {
      query: result.query || sanitizedInput,
      intent: isLikelyAcademic ? "VALID" : (result.intent === "OUT_OF_DOMAIN" ? "OUT_OF_DOMAIN" : "VALID"),
      variants: Array.isArray(result.variants) ? result.variants : []
    };
  } catch (error) {
    console.error("[LLM Router] Error:", error);
    return { query: sanitizedInput, intent: "VALID", variants: [] }; // Safe fallback
  }
}
