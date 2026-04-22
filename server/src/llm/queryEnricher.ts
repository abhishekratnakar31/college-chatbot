/**
 * Query Enricher
 * ─────────────────────────────────────────────────────────────────
 * Generates a focused, context-aware Tavily web search query by
 * combining the user's question with key facts extracted from an
 * uploaded PDF document.
 *
 * This is used exclusively in "web" mode when the user has attached
 * a PDF alongside their question.
 */

import type { ChatMessage } from "../types/chat.js";

/**
 * Generate an enriched web search query using the user's question
 * AND relevant context from an uploaded PDF.
 *
 * @param userQuestion  The raw user question
 * @param pdfContext    First ~3000 chars of the PDF document text
 * @returns             An optimized, specific search query string
 */
export async function generatePdfAwareSearchQuery(
  userQuestion: string,
  pdfContext: string
): Promise<string> {
  // Truncate pdfContext defensively in case caller hasn't already
  const truncatedContext = pdfContext.slice(0, 3000);

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `You are an expert search query generator for a College Assistant application.

The user has uploaded a PDF document. Your job is to generate a single, highly specific web search query that:
1. Incorporates specific details from the PDF (e.g., the college name, specific program names, fee amounts, deadlines).
2. Is tailored to answer the user's question using live web data.
3. Is optimized for finding official, up-to-date information.

RULES:
- Output ONLY the search query. No preamble, no explanation, no quotes.
- Be as specific as possible using names/numbers from the PDF.
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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });

    if (!response.ok) {
      console.error(
        "[QueryEnricher] API error:",
        response.status,
        await response.text().catch(() => "")
      );
      return userQuestion; // Fallback to raw question
    }

    const data = await response.json();
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
