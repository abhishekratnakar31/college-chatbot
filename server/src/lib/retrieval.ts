// export function retrieveRelevantChunks(query: string, data: string[]) {
//   const lowerQuery = query.toLowerCase();

//   return data.filter((chunk) =>
//     lowerQuery.split(" ").some((word) =>
//       chunk.toLowerCase().includes(word)
//     )
//   ).slice(0, 3); // top 3 chunks
// }

import { getEmbedding } from "../llm/embedding.js";
import { cosineSimilarity } from "./similarity.js";

export async function retrieveRelevantChunks(query: string, data: string[]) {
  const queryEmbedding = await getEmbedding(query);

  const scored = await Promise.all(
    data.map(async (chunk) => {
      const chunkEmbedding = await getEmbedding(chunk);
      const score = cosineSimilarity(queryEmbedding, chunkEmbedding);

      return { chunk, score };
    })
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.chunk);
}