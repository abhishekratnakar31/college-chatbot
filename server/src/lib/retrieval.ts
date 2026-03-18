export function retrieveRelevantChunks(query: string, data: string[]) {
  const lowerQuery = query.toLowerCase();

  return data.filter((chunk) =>
    lowerQuery.split(" ").some((word) =>
      chunk.toLowerCase().includes(word)
    )
  ).slice(0, 3); // top 3 chunks
}