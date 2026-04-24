import type { FastifyInstance } from "fastify";
import { sql } from "../lib/db.js";
import { runNewsPipeline } from "../jobs/newsCron.js";

export async function newsRoute(app: FastifyInstance) {
  /**
   * GET /news
   * Returns paginated news articles from the DB.
   * Query params:
   *   ?limit=20        (default 20, max 50)
   *   ?source=IIT Delhi  (filter by source name)
   *   ?page=1          (pagination)
   */
  app.get("/news", async (request, reply) => {
    const q = request.query as Record<string, any>;
    const limit = Math.min(Number(q.limit) || 20, 50);
    const page = Math.max(Number(q.page) || 1, 1);
    const offset = (page - 1) * limit;

    const conditions = [];
    
    // Handle multiple sources
    const sources = Array.isArray(q.source) ? q.source : q.source ? [q.source] : [];
    if (sources.length > 0) {
      conditions.push(sql`source = ANY(${sources})`);
    }

    // Handle multiple categories
    const categories = Array.isArray(q.category) ? q.category : q.category ? [q.category] : [];
    if (categories.length > 0) {
      conditions.push(sql`category = ANY(${categories})`);
    }

    const whereClause = conditions.length > 0 
      ? sql`WHERE ${conditions.reduce((acc, curr) => sql`${acc} AND ${curr}`)}` 
      : sql``;

    try {
      const rows = await sql`
        SELECT id, title, summary, url, source, category, image, published_at, created_at
        FROM news
        ${whereClause}
        ORDER BY COALESCE(published_at, created_at) DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countRes = await sql<[{ total: string }]>`
        SELECT COUNT(*)::text AS total FROM news
        ${whereClause}
      `;
      const total = parseInt(countRes[0]?.total ?? "0", 10);

      return reply.send({
        articles: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (err: any) {
      console.error("[News Route] GET /news error:", err.message);
      return reply.status(500).send({ error: "Failed to fetch news" });
    }
  });

  /**
   * GET /news/sources
   * Returns a list of distinct source names (for filter UI).
   */
  app.get("/news/sources", async (_request, reply) => {
    try {
      const rows = await sql`
        SELECT DISTINCT source, COUNT(*) AS count
        FROM news
        GROUP BY source
        ORDER BY count DESC
      `;
      return reply.send({ sources: rows });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to fetch sources" });
    }
  });

  /**
   * GET /news/categories
   * Returns a list of distinct categories.
   */
  app.get("/news/categories", async (_request, reply) => {
    try {
      const rows = await sql`
        SELECT DISTINCT category, COUNT(*) AS count
        FROM news
        WHERE category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
      `;
      return reply.send({ categories: rows });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to fetch categories" });
    }
  });

  /**
   * POST /news/refresh  (dev/admin only)
   * Manually triggers the news pipeline without waiting for the cron.
   */
  app.post("/news/refresh", async (_request, reply) => {
    if (process.env.NODE_ENV === "production") {
      return reply.status(403).send({ error: "Not available in production" });
    }
    reply.send({ message: "News pipeline triggered. Check server logs." });
    // Run async — don't block the response
    runNewsPipeline().catch(console.error);
  });
}
