export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 1000),
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Embedding API error:", response.status, err);
      // Return zero vector so the app keeps running without PDF results
      return new Array(1536).fill(0) as number[];
    }

    const data = await response.json() as { data?: { embedding: number[] }[] };
    const embedding = data?.data?.[0]?.embedding;

    if (!embedding) {
      console.error("Embedding API returned no embedding. Response:", JSON.stringify(data));
      return new Array(1536).fill(0) as number[];
    }

    return embedding;
  } catch (error) {
    console.error("Embedding fetch failed:", error);
    return new Array(1536).fill(0) as number[];
  }
}