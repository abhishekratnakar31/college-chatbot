import { sql } from "./db.js";
import { qdrant } from "./qdrant.js";
import { getEmbeddings } from "../llm/embedding.js";
import type { NewsArticle } from "./scraper.js";
import crypto from "node:crypto";

const QDRANT_NEWS_COLLECTION = "college_news";
const BATCH_SIZE = 50; // Process 50 articles at a time to stay within API limits

/**
 * Saves scraped articles to PostgreSQL and Qdrant.
 * - Postgres: persistent store, serves the /news API
 * - Qdrant: vector store, enables chatbot to answer news questions
 */
export async function saveNews(articles: NewsArticle[]): Promise<void> {
  if (articles.length === 0) {
    console.log("[News Saver] No articles to save.");
    return;
  }

  let totalSaved = 0;
  let totalSkipped = 0;
  let totalQdrant = 0;

  console.log(`[News Saver] Processing ${articles.length} total articles...`);

  // ── Step 1: Save all to PostgreSQL ──────────────────────────────────
  // We identify which ones are TRULY new so we don't re-embed old news
  const newArticles: NewsArticle[] = [];

  for (const a of articles) {
    try {
      const result = await sql`
        INSERT INTO news (title, summary, url, source, category, image, published_at)
        VALUES (${a.title}, ${a.summary}, ${a.url}, ${a.source}, ${a.category}, ${a.image}, ${a.publishedAt})
        ON CONFLICT (url) DO UPDATE
          SET category = CASE
            WHEN news.category IS NULL OR news.category = '' THEN EXCLUDED.category
            ELSE news.category
          END,
          image = CASE
            WHEN news.image IS NULL OR news.image = '' THEN EXCLUDED.image
            ELSE news.image
          END
        RETURNING (xmax = 0) AS inserted
      `;

      if (result[0]?.inserted) {
        newArticles.push(a);
        totalSaved++;
      } else {
        totalSkipped++;
      }
    } catch (err: any) {
      console.error(`[News Saver] DB Error for ${a.url}:`, err.message);
    }
  }

  // ── Step 2: Batch Process Embeddings & Qdrant Upserts ────────────────
  // This prevents hitting OpenRouter/LLM rate limits
  if (newArticles.length > 0) {
    console.log(`[News Saver] Embedding ${newArticles.length} new articles in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < newArticles.length; i += BATCH_SIZE) {
      const batch = newArticles.slice(i, i + BATCH_SIZE);
      const texts = batch.map(a => `${a.title} ${a.summary}`);

      try {
        const vectors = await getEmbeddings(texts);
        
        const points = batch.map((a, idx) => ({
          id: crypto.randomUUID(),
          vector: vectors[idx]!,
          payload: {
            title: a.title,
            summary: a.summary,
            url: a.url,
            source: a.source,
            category: a.category,
            image: a.image,
            publishedAt: a.publishedAt?.toISOString() ?? null,
            type: "news",
          },
        }));

        await qdrant.upsert(QDRANT_NEWS_COLLECTION, {
          wait: true,
          points
        });

        totalQdrant += points.length;
        console.log(`[News Saver] Batch ${i / BATCH_SIZE + 1} completed (${points.length} points).`);
      } catch (err: any) {
        console.error(`[News Saver] Batch processing failed:`, err.message);
      }
    }
  }

  console.log(
    `[News Saver] Final Report — New: ${totalSaved}, Duplicates Skipped: ${totalSkipped}, Vector Store: ${totalQdrant}`
  );
}
