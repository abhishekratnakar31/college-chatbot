import { QdrantClient } from "@qdrant/js-client-rest";
import "dotenv/config";

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function test() {
  try {
    const res = await qdrant.search("college_docs", {
      vector: new Array(1536).fill(0),
      limit: 1,
      filter: {
        must: [
          {
            key: "document",
            match: { value: "list-of-available-programs.pdf" }
          }
        ]
      }
    });
    console.log("SUCCESS", res.length);
  } catch (e: any) {
    console.error("ERROR", e.message);
  }
}
test();
