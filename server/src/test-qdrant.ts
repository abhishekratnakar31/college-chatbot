import { QdrantClient } from "@qdrant/js-client-rest";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
  apiKey: process.env.QDRANT_API_KEY || undefined,
} as any);

async function test() {
  try {
    const collections = await qdrant.getCollections();
    console.log("Qdrant Collections:", collections);
  } catch (err) {
    console.error("Qdrant connection failed:", err);
  }
}

test();
