export async function getEmbedding(text: string): Promise<number[]> {
  const result = await getEmbeddings([text]);
  return result[0] || new Array(1536).fill(0);
}

export async function getEmbeddings(texts: string[], maxRetries = 4): Promise<number[][]> {
  let retryCount = 0;
  let delayMs = 2000; // Start with 2 seconds

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
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        
        // If it's a rate limit (429) or server error (5xx), we retry
        if ((response.status === 429 || response.status >= 500) && retryCount < maxRetries) {
          console.warn(`[Embedding API] Error ${response.status}: ${err}. Retrying in ${delayMs}ms... (Attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          retryCount++;
          delayMs *= 2; // Exponential backoff
          continue;
        }

        console.error("Embedding API error (Final):", response.status, err);
        // Return zero vectors so the app keeps running (if retries exhausted or it's a 4xx error like 401)
        return texts.map(() => new Array(1536).fill(0) as number[]);
      }

      const data = await response.json() as { data?: { embedding: number[] }[] };
      const embeddings = data?.data?.map(d => d.embedding);

      if (!embeddings || embeddings.length === 0) {
        console.error("Embedding API returned no embedding. Response:", JSON.stringify(data));
        return texts.map(() => new Array(1536).fill(0) as number[]);
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
      return texts.map(() => new Array(1536).fill(0) as number[]);
    }
  }

  // Fallback just in case
  return texts.map(() => new Array(1536).fill(0) as number[]);
}