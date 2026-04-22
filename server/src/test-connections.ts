import 'dotenv/config';
import postgres from 'postgres';
import { QdrantClient } from '@qdrant/js-client-rest';
import fetch from 'node-fetch';

async function checkConnections() {
  console.log("🔍 Checking Backend Connections...");

  // 1. Check Postgres
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL missing");
  } else {
    try {
      const sql = postgres(process.env.DATABASE_URL);
      await sql`SELECT 1`;
      console.log("✅ PostgreSQL Connection: OK");
      await sql.end();
    } catch (err) {
      console.error("❌ PostgreSQL Connection: FAILED");
      console.error((err as Error).message);
    }
  }

  // 2. Check Qdrant
  if (!process.env.QDRANT_URL) {
    console.error("❌ QDRANT_URL missing");
  } else {
    try {
      const qdrant = new QdrantClient({
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY || ""
      });
      await qdrant.getCollections();
      console.log("✅ Qdrant Connection: OK");
    } catch (err) {
      console.error("❌ Qdrant Connection: FAILED");
      console.error((err as Error).message);
    }
  }

  // 3. Check OpenRouter
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY missing");
  } else {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
        headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}` }
      });
      if (res.ok) {
        console.log("✅ OpenRouter API Key: VALID");
      } else {
        console.error("❌ OpenRouter API Key: INVALID");
      }
    } catch (err) {
      console.error("❌ OpenRouter API Key Check: ERROR");
      console.error((err as Error).message);
    }
  }
}

checkConnections();
