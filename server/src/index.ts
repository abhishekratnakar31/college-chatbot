import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoute } from "./routes/chat.js";
import multipart from "@fastify/multipart";
import { uploadRoute } from "./routes/upload.js";
import { registerRateLimiter } from "./guardrails/index.js";

import { qdrant } from "./lib/qdrant.js";
import { initDB } from "./lib/db.js";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = Fastify();

await app.register(cors, {
  origin:
    process.env.ALLOWED_ORIGIN === "*"
      ? true
      : process.env.ALLOWED_ORIGIN || true,
  methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
});

// ── Register global rate limiter ────────────────────────────────────
registerRateLimiter(app);
// ───────────────────────────────────────────────────────────────────

await app.register(fastifyStatic, {
  root: path.join(__dirname, "../uploads"),
  prefix: "/uploads/",
});

await app.register(chatRoute);

await app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});
await app.register(uploadRoute);
async function initVectorDB() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some((c) => c.name === "college_docs");

  if (!exists) {
    await qdrant.createCollection("college_docs", {
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    });
    
    // Create payload index for the 'document' field to allow filtering
    await qdrant.createPayloadIndex("college_docs", {
      field_name: "document",
      field_schema: "keyword",
      wait: true,
    });
    
    console.log("Vector DB Initialized: Collection and index created.");
  } else {
    // Ensure index exists even if collection was already there
    try {
      await qdrant.createPayloadIndex("college_docs", {
        field_name: "document",
        field_schema: "keyword",
        wait: true,
      });
    } catch (e) {
      // Ignore if index already exists
    }
    console.log("Vector DB Initialized: Collection already exists.");
  }
}

await initDB();
await initVectorDB();

const PORT = Number(process.env.PORT) || 4000;

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`Server running on port ${PORT}`);
});
