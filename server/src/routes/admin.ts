import type { FastifyInstance } from "fastify";
import { sql } from "../lib/db.js";
import { authenticate } from "../guardrails/authHook.js";
import { getAuth } from "firebase-admin/auth";
import { firebaseAdminApp } from "../lib/firebaseAdmin.js";
import { runNewsPipeline } from "../jobs/newsCron.js";
import { getApiUsageStats } from "../lib/apiUsageLogger.js";

async function requireAdmin(request: any, reply: any) {
  await authenticate(request, reply);
  if (reply.sent) return;

  const user = request.user;
  if (!user?.uid) {
    return reply.status(401).send({ error: "Unauthorized" });
  }

  const [{ count: adminCount }] = await sql<[{ count: string }]>`
    SELECT COUNT(*)::text AS count FROM admin_users
  `;

  // Auto-promote first user if no admins exist
  if (parseInt(adminCount ?? "0") === 0) {
    await sql`
      INSERT INTO admin_users (uid, email, name)
      VALUES (${user.uid}, ${user.email || ""}, ${user.name || "Admin"})
      ON CONFLICT (uid) DO NOTHING
    `.catch(() => {});
    return;
  }

  const [admin] = await sql<[{ uid: string }?]>`
    SELECT uid FROM admin_users WHERE uid = ${user.uid}
  `;
  if (!admin) {
    return reply.status(403).send({ error: "Forbidden", message: "Admin access required" });
  }
}

export async function adminRoute(app: FastifyInstance) {
  // Public check endpoint — no admin guard, just auth
  app.get("/admin/check", async (request, reply) => {
    await authenticate(request, reply);
    if (reply.sent) return;
    const user = request.user;
    if (!user?.uid) return reply.send({ isAdmin: false });

    const [{ count: adminCount }] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text AS count FROM admin_users
    `;
    if (parseInt(adminCount ?? "0") === 0) {
      await sql`
        INSERT INTO admin_users (uid, email, name)
        VALUES (${user.uid}, ${user.email || ""}, ${user.name || "Admin"})
        ON CONFLICT (uid) DO NOTHING
      `.catch(() => {});
      return reply.send({ isAdmin: true });
    }

    const [admin] = await sql<[{ uid: string }?]>`
      SELECT uid FROM admin_users WHERE uid = ${user.uid}
    `;
    return reply.send({ isAdmin: !!admin });
  });

  app.addHook("preHandler", requireAdmin);

  app.get("/admin/stats", async (_request, reply) => {
    try {
      type CountResult = [{ total: string }];

      let firebaseUserCount = 0;
      if (firebaseAdminApp) {
        try {
          const listResult = await getAuth(firebaseAdminApp).listUsers(1000);
          firebaseUserCount = listResult.users.length;
        } catch (e) {
          console.warn("[Admin] Failed to list Firebase users for stats");
        }
      }

      const [
        totalUsersRes,
        totalActivityRes,
        todayActivityRes,
        totalNewsRes,
        tokenStatsRes,
        topActions,
        recentActivity,
      ] = await Promise.all([
        sql<CountResult>`SELECT COUNT(DISTINCT uid)::text AS total FROM user_activity`,
        sql<CountResult>`SELECT COUNT(*)::text AS total FROM user_activity`,
        sql<CountResult>`
          SELECT COUNT(*)::text AS total FROM user_activity
          WHERE created_at >= NOW() - INTERVAL '24 hours'
        `,
        sql<CountResult>`SELECT COUNT(*)::text AS total FROM news`,
        sql<[{ total_tokens: string; total_cost: string }?]>`
          SELECT
            COALESCE(SUM((details->>'total_tokens')::int), 0)::text AS total_tokens,
            COALESCE(SUM((details->>'cost')::numeric), 0)::text AS total_cost
          FROM user_activity
          WHERE details->>'total_tokens' IS NOT NULL
        `,
        sql`
          SELECT action, COUNT(*)::int AS count
          FROM user_activity
          WHERE created_at >= NOW() - INTERVAL '7 days'
          GROUP BY action ORDER BY count DESC LIMIT 10
        `,
        sql`
          SELECT uid, email, action, details, created_at
          FROM user_activity
          ORDER BY created_at DESC LIMIT 20
        `,
      ]);

      const tokenRow = tokenStatsRes[0];
      const activeUsers = parseInt(totalUsersRes[0]?.total ?? "0");
      return reply.send({
        stats: {
          totalUsers: firebaseUserCount || activeUsers,
          totalSessions: parseInt(totalActivityRes[0]?.total ?? "0"),
          activeToday: parseInt(todayActivityRes[0]?.total ?? "0"),
          totalNews: parseInt(totalNewsRes[0]?.total ?? "0"),
          totalTokens: parseInt(tokenRow?.total_tokens ?? "0"),
          totalCost: parseFloat(tokenRow?.total_cost ?? "0"),
          activeUsers,
        },
        topActions,
        recentActivity,
      });
    } catch (err: any) {
      console.error("[Admin] Stats error:", err);
      return reply.status(500).send({ error: "Failed to fetch stats" });
    }
  });

  app.get("/admin/users", async (_request, reply) => {
    try {
      const limit = 100;
      let allUsers: any[] = [];

      if (firebaseAdminApp) {
        try {
          const listResult = await getAuth(firebaseAdminApp).listUsers(limit);
          allUsers = listResult.users.map((u) => ({
            uid: u.uid,
            email: u.email || "",
            name: u.displayName || "",
            photoURL: u.photoURL || "",
            createdAt: u.metadata.creationTime,
            lastSignIn: u.metadata.lastSignInTime,
            disabled: u.disabled,
          }));
        } catch (e) {
          console.warn("[Admin] Firebase listUsers failed, falling back to activity data");
        }
      }

      const adminEmails = await sql<{ email: string }[]>`
        SELECT email FROM admin_users
      `;
      const adminSet = new Set(adminEmails.map((a) => a.email));

      const activitySummary = await sql`
        SELECT uid, email, COUNT(*)::int AS queries,
               MAX(created_at) AS last_active
        FROM user_activity
        GROUP BY uid, email ORDER BY last_active DESC LIMIT 200
      `;

      return reply.send({
        firebaseUsers: allUsers,
        activitySummary,
        adminEmails: [...adminSet],
      });
    } catch (err: any) {
      console.error("[Admin] Users error:", err);
      return reply.status(500).send({ error: "Failed to fetch users" });
    }
  });

  app.get("/admin/activity", async (request, reply) => {
    const q = request.query as Record<string, any>;
    const limit = Math.min(Number(q.limit) || 50, 200);
    const offset = Math.max(Number(q.page || 1) - 1, 0) * limit;

    try {
      const rows = await sql`
        SELECT id, uid, email, action, details, created_at
        FROM user_activity
        ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      const [countRes] = await sql<[{ total: string }]>`
        SELECT COUNT(*)::text AS total FROM user_activity
      `;

      return reply.send({
        activity: rows,
        total: parseInt(countRes?.total ?? "0"),
        page: (offset / limit) + 1,
        limit,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to fetch activity" });
    }
  });

  app.get("/admin/news", async (request, reply) => {
    const q = request.query as Record<string, any>;
    const limit = Math.min(Number(q.limit) || 50, 100);
    const offset = Math.max(Number(q.page || 1) - 1, 0) * limit;

    try {
      const rows = await sql`
        SELECT * FROM news ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
      `;
      const [newsCountRes] = await sql<[{ total: string }]>`
        SELECT COUNT(*)::text AS total FROM news
      `;
      return reply.send({
        articles: rows,
        total: parseInt(newsCountRes?.total ?? "0"),
        page: (offset / limit) + 1,
        limit,
      });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to fetch news" });
    }
  });

  app.post("/admin/news", async (request, reply) => {
    const body = request.body as {
      title?: string;
      summary?: string;
      url?: string;
      source?: string;
      category?: string;
      image?: string;
      published_at?: string;
      status?: string;
    };

    if (!body.title || !body.url) {
      return reply.status(400).send({ error: "title and url are required" });
    }

    try {
      const [row] = await sql`
        INSERT INTO news (title, summary, url, source, category, image, published_at, status)
        VALUES (${body.title}, ${body.summary || ""}, ${body.url},
                ${body.source || "Manual"}, ${body.category || null},
                ${body.image || null}, ${body.published_at ? new Date(body.published_at) : null},
                ${body.status || "draft"})
        ON CONFLICT (url) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary
        RETURNING *
      `;
      return reply.send(row);
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to create news", message: err.message });
    }
  });

  app.delete("/admin/news/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      await sql`DELETE FROM news WHERE id = ${Number(id)}`;
      return reply.send({ deleted: true });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to delete news" });
    }
  });

  app.patch("/admin/news/:id/publish", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const [row] = await sql`
        UPDATE news SET status = 'published' WHERE id = ${Number(id)} RETURNING *
      `;
      return reply.send(row);
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to publish" });
    }
  });

  app.patch("/admin/news/:id/draft", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const [row] = await sql`
        UPDATE news SET status = 'draft' WHERE id = ${Number(id)} RETURNING *
      `;
      return reply.send(row);
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to unpublish" });
    }
  });

  app.post("/admin/news/publish-all", async (_request, reply) => {
    try {
      const { count } = await sql<[{ count: string }]>`
        UPDATE news SET status = 'published' WHERE status = 'draft'
      `;
      return reply.send({ publishedAll: true });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to publish all" });
    }
  });

  app.post("/admin/news/refresh", async (_request, reply) => {
    reply.send({ message: "News pipeline triggered — new articles arrive as drafts" });
    runNewsPipeline().catch(console.error);
  });

  app.post("/admin/users/:uid/promote", async (request, reply) => {
    const { uid } = request.params as { uid: string };
    const body = request.body as { email?: string; name?: string };
    if (!uid) return reply.status(400).send({ error: "uid required" });

    try {
      await sql`
        INSERT INTO admin_users (uid, email, name)
        VALUES (${uid}, ${body.email || ""}, ${body.name || null})
        ON CONFLICT (uid) DO NOTHING
      `;
      return reply.send({ promoted: true });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to promote" });
    }
  });

  app.delete("/admin/users/:uid/promote", async (request, reply) => {
    const { uid } = request.params as { uid: string };
    if (!uid) return reply.status(400).send({ error: "uid required" });

    try {
      await sql`DELETE FROM admin_users WHERE uid = ${uid}`;
      return reply.send({ demoted: true });
    } catch (err: any) {
      return reply.status(500).send({ error: "Failed to demote" });
    }
  });

  app.get("/admin/api-usage", async (_request, reply) => {
    try {
      const stats = await getApiUsageStats();
      return reply.send(stats);
    } catch (err: any) {
      console.error("[Admin] API Usage error:", err);
      return reply.status(500).send({ error: "Failed to fetch API usage" });
    }
  });
}
