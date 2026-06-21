export async function getEmbedding(text: string): Promise<number[]> {
  const result = await getEmbeddings([text]);
  return result[0] || new Array(768).fill(0);
}

import { logApiUsage } from "../lib/apiUsageLogger.js";

export async function getEmbeddings(texts: string[], maxRetries = 4): Promise<number[][]> {
  let retryCount = 0;
  let delayMs = process.env.NODE_ENV === "test" ? 0 : 2000;

  while (retryCount <= maxRetries) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: texts,
          dimensions: 768,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        
        if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
          console.warn(`[Embedding API] Error ${response.status}: ${err}. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          retryCount++;
          delayMs *= 2;
          continue;
        }

        console.error("Embedding API error (Final):", response.status, err);
        return texts.map(() => new Array(768).fill(0) as number[]);
      }

      const data = await response.json() as { data?: { embedding: number[] }[]; usage?: { prompt_tokens: number; total_tokens: number } };
      const usage = data.usage;
      logApiUsage({
        model: "openai/text-embedding-3-small",
        endpointType: "embedding",
        promptTokens: usage?.prompt_tokens,
        totalTokens: usage?.total_tokens,
        metadata: { texts_count: texts.length },
      });
      const embeddings = data?.data?.map(d => d.embedding);

      if (!embeddings || embeddings.length === 0) {
        console.error("Embedding API returned no embedding. Response:", JSON.stringify(data));
        return texts.map(() => new Array(768).fill(0) as number[]);
      }

      return embeddings;
    } catch (error) {
      if (retryCount < maxRetries) {
        console.warn(`[Embedding API] Fetch failed: ${error}. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        retryCount++;
        delayMs *= 2;
        continue;
      }
      console.error("Embedding fetch failed completely after retries:", error);
      return texts.map(() => new Array(768).fill(0) as number[]);
    }
  }

  return texts.map(() => new Array(768).fill(0) as number[]);
}
