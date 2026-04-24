import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { chatRoute } from "./routes/chat.js";
import { newsRoute } from "./routes/news.js";
import { rankingsRoute } from "./routes/rankings.js";
import multipart from "@fastify/multipart";
import { uploadRoute } from "./routes/upload.js";
import { registerRateLimiter } from "./guardrails/index.js";
import { startNewsCron } from "./jobs/newsCron.js";
import { seedCollegeAchievements } from "./lib/collegeSeeds.js";

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
  const existingNames = collections.collections.map((c) => c.name);

  // ── college_docs (PDF uploads) ──────────────────────────────────────
  if (!existingNames.includes("college_docs")) {
    await qdrant.createCollection("college_docs", {
      vectors: { size: 1536, distance: "Cosine" },
    });
    console.log("Vector DB: 'college_docs' collection created.");
  }

  // ── college_news (RSS news articles) ───────────────────────────────
  if (!existingNames.includes("college_news")) {
    await qdrant.createCollection("college_news", {
      vectors: { size: 1536, distance: "Cosine" },
    });
    console.log("Vector DB: 'college_news' collection created.");
  }

  // Ensure payload indexes exist (safe to call even if they already exist)
  try {
    await qdrant.createPayloadIndex("college_docs", {
      field_name: "document",
      field_schema: "keyword",
      wait: true,
    });
    await qdrant.createPayloadIndex("college_docs", {
      field_name: "text",
      field_schema: "text",
      wait: true,
    });
    await qdrant.createPayloadIndex("college_news", {
      field_name: "source",
      field_schema: "keyword",
      wait: true,
    });
    console.log("Vector DB Initialized: Payload indexes ensured.");
  } catch (e) {
    console.warn("Notice: One or more payload indexes could not be created (they may already exist).");
  }
}

await initDB();
await initVectorDB();
await seedCollegeAchievements();

// Register news & rankings routes
await app.register(newsRoute);
await app.register(rankingsRoute);

// Start news cron job (runs immediately + every 6h)
startNewsCron();

const PORT = Number(process.env.PORT) || 4000;

app.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`Server running on port ${PORT}`);
});
