import 'dotenv/config';
import { QdrantClient } from '@qdrant/js-client-rest';

async function resetQdrant() {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY || '';

  if (!url) {
    console.error("❌ QDRANT_URL is not set in your .env file");
    process.exit(1);
  }

  console.log(`📡 Connecting to Qdrant at: ${url}`);
  const client = new QdrantClient({ url, apiKey });

  const collections = ['college_docs', 'college_news'];

  for (const collection of collections) {
    try {
      console.log(`🗑️ Deleting collection '${collection}'...`);
      await client.deleteCollection(collection);
      console.log(`✅ Collection '${collection}' deleted successfully.`);
    } catch (err) {
      console.warn(`⚠️ Could not delete collection '${collection}': ${err.message}`);
    }
  }

  console.log("🏁 Qdrant reset finished. The server will recreate them with 768 dimensions on next startup.");
}

resetQdrant();
