import type { ChatMessage } from "../types/chat.js";

export interface RankedChunk {
  text: string;
  score: number;
  payload: any;
}

export async function reRankChunks(query: string, chunks: any[]): Promise<any[]> {
  if (chunks.length === 0) return [];
  if (chunks.length === 1) return chunks;

  console.log(`[RAG Re-ranker] Re-ranking ${chunks.length} chunks for query: "${query}"`);

  const chunkItems = chunks.map((c, i) => `[ID: ${i}] ${c.payload?.text || c.text}`).join("\n\n");

  const prompt = `
You are an expert information retrieval system. Your task is to score the relevance of the following document chunks to a user's question.

User Question: "${query}"

Document Chunks:
${chunkItems}

Instructions:
1. Rate each chunk from 0 to 10 (10 = highly relevant, 0 = irrelevant).
2. Consider how well the chunk directly answers the question or provides necessary context.
3. Chunks mentioning specific names, codes, or programs requested in the question should be scored higher.
4. Output your response as a JSON array of scores, like this: [8, 2, 9, ...].
5. Output ONLY the JSON array. No text before or after.
`.trim();

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
          model: "openai/gpt-4o-mini", // Fast and cheap for scoring
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0,
        }),
      }
    );

    if (!response.ok) {
      console.warn("[RAG Re-ranker] LLM scoring failed. Falling back to original order.");
      return chunks;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    // Attempt to parse the array
    try {
      const scores = JSON.parse(content.match(/\[.*\]/)?.[0] || content);
      if (!Array.isArray(scores)) throw new Error("Invalid scores format");

      const ranked = chunks
        .map((chunk, i) => ({
          ...chunk,
          rerank_score: scores[i] !== undefined ? scores[i] : 0
        }))
        .sort((a, b) => (b.rerank_score || 0) - (a.rerank_score || 0));

      console.log(`[RAG Re-ranker] Top score: ${ranked[0]?.rerank_score}, Bottom score: ${ranked[ranked.length-1]?.rerank_score}`);
      return ranked;
    } catch (parseErr) {
      console.error("[RAG Re-ranker] Error parsing scores:", parseErr, "Content:", content);
      return chunks;
    }
  } catch (error) {
    console.error("[RAG Re-ranker] Error:", error);
    return chunks;
  }
}
