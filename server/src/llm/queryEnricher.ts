import type { ChatMessage } from "../types/chat.js";
import { logApiUsage } from "../lib/apiUsageLogger.js";

export async function generatePdfAwareSearchQuery(
  userQuestion: string,
  pdfContext: string,
): Promise<string> {
  const truncatedContext = pdfContext.slice(0, 3000);

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an expert web search query generator for a College Assistant application.

The user has uploaded a PDF document about a specific college or academic program. Your job is:
1. Extract the EXACT college/university name from the PDF excerpt below.
2. Generate a targeted web search query that will find the answer on the COLLEGE'S OFFICIAL WEBSITE.

RULES:
- Output ONLY the search query string. No preamble, no explanation, no quotes.
- ALWAYS include the full, exact college/university name in the query.
- Target official sources: e.g., "[College Name] official [topic]" or "[College Name] admission [year]"
- Be specific — include program names, departments, or keywords from the user's question.
- If the question is off-topic (not about colleges or education), reply EXACTLY: OUT_OF_DOMAIN
- Maximum 15 words.

PDF DOCUMENT EXCERPT:
${truncatedContext}`,
    },
    {
      role: "user",
      content: userQuestion,
    },
  ];

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages,
          max_tokens: 60,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "[QueryEnricher] API error:",
        response.status,
        await response.text().catch(() => ""),
      );
      return userQuestion;
    }

    const data = await response.json();
    const usage = data.usage;
    logApiUsage({
      model: "openai/gpt-4o-mini",
      endpointType: "query_enrichment",
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens,
      totalTokens: usage?.total_tokens,
      metadata: { function: "generatePdfAwareSearchQuery" },
    });
    const query =
      data.choices?.[0]?.message?.content?.replace(/"/g, "").trim() ||
      userQuestion;

    console.log(`[QueryEnricher] PDF-aware query generated: "${query}"`);
    return query;
  } catch (err) {
    console.error("[QueryEnricher] Fetch failed:", err);
    return userQuestion;
  }
}
