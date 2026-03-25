// In-memory store for document chunks (replaces PostgreSQL document_chunks table)
let chunks: string[] = [];

export function setChunks(newChunks: string[]) {
  chunks = newChunks;
}

export function getChunks(): string[] {
  return chunks;
}
