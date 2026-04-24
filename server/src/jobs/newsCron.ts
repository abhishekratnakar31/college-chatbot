import cron from "node-cron";
import { scrapeAllNews } from "../lib/scraper.js";
import { saveNews } from "../lib/newsSaver.js";

/**
 * Runs the full news pipeline: scrape → save to DB + Qdrant.
 */
export async function runNewsPipeline(): Promise<void> {
  try {
    console.log("[News Cron] ▶ Starting news pipeline...");
    const articles = await scrapeAllNews();
    await saveNews(articles);
    console.log("[News Cron] ✅ News pipeline complete.");
  } catch (err: any) {
    // Never let cron failures crash the server
    console.error("[News Cron] ❌ Pipeline failed:", err.message);
  }
}

/**
 * Registers the cron job to run the pipeline every 6 hours.
 * Also runs once immediately on startup so the DB isn't empty on first boot.
 */
export function startNewsCron(): void {
  // Run immediately at startup
  runNewsPipeline();

  // Schedule: every 6 hours (0:00, 6:00, 12:00, 18:00)
  cron.schedule("0 */6 * * *", () => {
    console.log("[News Cron] ⏰ Scheduled trigger fired.");
    runNewsPipeline();
  });

  console.log("[News Cron] Registered — runs every 6 hours.");
}
