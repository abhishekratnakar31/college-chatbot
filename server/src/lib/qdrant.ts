import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  ...(process.env.QDRANT_API_KEY ? { apiKey: process.env.QDRANT_API_KEY } : {}),
  checkCompatibility: false,
});

export interface SearchOptions {
  vector: number[];
  limit?: number;
  filter?: any;
  with_payload?: boolean;
}

export interface QdrantSearchResult {
  id: string | number;
  version?: number;
  score: number;
  payload?: any;
  vector?: any;
}

export const qdrant = Object.assign(client, {
  async search(collectionName: string, options: SearchOptions): Promise<QdrantSearchResult[]> {
    const queryParams: Record<string, any> = {
      query: options.vector,
      with_payload: options.with_payload ?? true,
    };
    if (options.limit !== undefined) {
      queryParams.limit = options.limit;
    }
    if (options.filter !== undefined) {
      queryParams.filter = options.filter;
    }
    const res = await client.query(collectionName, queryParams as any);
    return (res.points || []) as QdrantSearchResult[];
  },
});
