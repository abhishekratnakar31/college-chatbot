export async function getEmbedding(text: string): Promise<number[]> {
  const result = await getEmbeddings([text]);
  return result[0] || new Array(1536).fill(0);
}

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
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
      console.error("Embedding API error:", response.status, err);
      // Return zero vectors so the app keeps running
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
    console.error("Embedding fetch failed:", error);
    return texts.map(() => new Array(1536).fill(0) as number[]);
  }
}