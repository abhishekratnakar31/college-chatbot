import type { FastifyInstance } from "fastify";
import { sql } from "../lib/db.js";
import { getKnownColleges } from "../lib/collegeSeeds.js";

/**
 * Detects which known colleges are mentioned in text.
 * Returns canonical college names.
 */
export function detectColleges(text: string, limit = 2): string[] {
  const lower = text.toLowerCase();
  const known = getKnownColleges();
  const found: string[] = [];

  for (const { canonical, aliases } of known) {
    const all = [canonical, ...aliases];
    if (all.some((name) => lower.includes(name.toLowerCase()))) {
      if (!found.includes(canonical)) {
        found.push(canonical);
        if (found.length >= limit) break;
      }
    }
  }
  return found;
}

/**
 * Computes an innovation score for a college row.
 */
export function computeInnovationScore(row: CollegeRow): number {
  const nirfPoints = row.nirf_rank ? Math.max(0, 100 - row.nirf_rank) * 0.4 : 0;
  const patentPoints = (row.patents ?? 0) * 0.1;
  const startupPoints = (row.startups_incubated ?? 0) * 0.15;
  const paperPoints = (row.research_papers ?? 0) * 0.005;
  const hackPoints = (row.hackathons_won ?? 0) * 0.5;
  return Math.round(nirfPoints + patentPoints + startupPoints + paperPoints + hackPoints);
}

type CollegeRow = {
  college: string;
  nirf_rank: number | null;
  nirf_category: string;
  global_rank: number | null;
  patents: number;
  research_papers: number;
  hackathons_won: number;
  startups_incubated: number;
  awards: string[];
};

/** Fuzzy-search for a single college by name or alias */
async function findCollege(name: string): Promise<CollegeRow | null> {
  const pattern = "%" + name + "%";
  const rows = await sql<CollegeRow[]>`
    SELECT * FROM college_achievements
    WHERE college ILIKE ${pattern}
       OR ${name} = ANY(aliases)
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function rankingsRoute(app: FastifyInstance) {
  // ── GET /rankings ──────────────────────────────────────────────────────────
  // Paginated list, filterable by category, sortable
  app.get("/rankings", async (request, reply) => {
    const q = request.query as Record<string, any>;
    const page = Math.max(1, parseInt(q.page ?? "1", 10));
    const limit = Math.min(50, parseInt(q.limit ?? "20", 10));
    const offset = (page - 1) * limit;

    const sort = q.sort || "nirf_rank";
    const sortBy = ["nirf_rank", "patents", "research_papers", "startups_incubated", "avg_package", "user_rating"].includes(sort)
      ? sort
      : "nirf_rank";

    const order = sortBy === "nirf_rank" ? sql`ASC` : sql`DESC`;

    const conditions = [];
    
    // Handle multiple categories
    const categories = Array.isArray(q.category) ? q.category : q.category ? [q.category] : [];
    if (categories.length > 0 && !categories.includes("All")) {
      conditions.push(sql`nirf_category = ANY(${categories})`);
    }

    // Handle multiple states
    const states = Array.isArray(q.state) ? q.state : q.state ? [q.state] : [];
    if (states.length > 0 && !states.includes("All")) {
      const lowerStates = states.map(s => s.toLowerCase());
      conditions.push(sql`LOWER(state) = ANY(${lowerStates})`);
    }

    // Handle multiple cities
    const cities = Array.isArray(q.city) ? q.city : q.city ? [q.city] : [];
    if (cities.length > 0 && !cities.includes("All")) {
      const lowerCities = cities.map(c => c.toLowerCase());
      conditions.push(sql`LOWER(city) = ANY(${lowerCities})`);
    }

    if (q.minPackage) conditions.push(sql`avg_package >= ${parseFloat(q.minPackage)}`);

    const whereClause = conditions.length > 0 
      ? sql`WHERE ${conditions.reduce((acc, curr) => sql`${acc} AND ${curr}`)}` 
      : sql``;

    const rows = await sql<CollegeRow[]>`
      SELECT * FROM college_achievements
      ${whereClause}
      ORDER BY ${sql(sortBy)} ${order} NULLS LAST
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalRows = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text FROM college_achievements
      ${whereClause}
    `;

    const total = parseInt(totalRows[0]?.count ?? "0", 10);
    const colleges = rows.map((r) => ({ ...r, innovation_score: computeInnovationScore(r as any) }));

    reply.send({
      colleges,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  });

  // ── GET /rankings/filters ──────────────────────────────────────────────────
  app.get("/rankings/filters", async (_request, reply) => {
    const stateCounts = await sql<{ state: string; count: string }[]>`
      SELECT state, COUNT(*)::text as count 
      FROM college_achievements 
      WHERE state IS NOT NULL 
      GROUP BY state 
      ORDER BY count DESC
    `;
    const categoryCounts = await sql<{ nirf_category: string; count: string }[]>`
      SELECT nirf_category as category, COUNT(*)::text as count 
      FROM college_achievements 
      GROUP BY nirf_category 
      ORDER BY count DESC
    `;
    
    reply.send({
      states: stateCounts.map(s => ({ name: s.state, count: parseInt(s.count, 10) })),
      categories: categoryCounts.map(c => ({ name: c.nirf_category, count: parseInt(c.count, 10) }))
    });
  });

  // ── GET /rankings/top ──────────────────────────────────────────────────────
  // Top 10 by innovation score — used for homepage leaderboard widget
  app.get("/rankings/top", async (_request, reply) => {
    const rows = await sql<CollegeRow[]>`
      SELECT * FROM college_achievements
      ORDER BY nirf_rank ASC NULLS LAST
      LIMIT 10
    `;
    const colleges = rows
      .map((r) => ({ ...r, innovation_score: computeInnovationScore(r) }))
      .sort((a, b) => b.innovation_score - a.innovation_score);

    reply.send({ colleges });
  });

  // ── GET /rankings/categories ───────────────────────────────────────────────
  app.get("/rankings/categories", async (_request, reply) => {
    const rows = await sql<{ nirf_category: string; count: string }[]>`
      SELECT nirf_category, COUNT(*)::text as count
      FROM college_achievements
      GROUP BY nirf_category
      ORDER BY nirf_category
    `;
    reply.send({ categories: rows });
  });

  // ── GET /rankings/college/:name ────────────────────────────────────────────
  // Full profile for a single college (fuzzy name match)
  app.get("/rankings/college/:name", async (request, reply) => {
    const { name } = request.params as { name: string };
    const row = await findCollege(name);
    if (!row) {
      reply.status(404).send({ error: "College not found" });
      return;
    }
    reply.send({ college: { ...row, innovation_score: computeInnovationScore(row) } });
  });

  // ── GET /rankings/compare ──────────────────────────────────────────────────
  // Side-by-side comparison of two colleges
  app.get("/rankings/compare", async (request, reply) => {
    const q = request.query as Record<string, string>;
    const names = [q.a, q.b].filter(Boolean) as string[];
    if (names.length < 2) {
      reply.status(400).send({ error: "Provide ?a=College1&b=College2" });
      return;
    }

    const found = await Promise.all(names.slice(0, 2).map(findCollege));
    const results = found
      .filter((r): r is CollegeRow => r !== null)
      .map((r) => ({ ...r, innovation_score: computeInnovationScore(r) }));

    reply.send({ comparison: results });
  });

  // ── POST /rankings/increment ───────────────────────────────────────────────
  // Internal: increment a field from AI extraction
  app.post("/rankings/increment", async (request, reply) => {
    const { college, field, delta, source_url } = request.body as {
      college: string;
      field: string;
      delta: number;
      source_url?: string;
    };

    const ALLOWED_FIELDS = ["patents", "research_papers", "hackathons_won", "startups_incubated"];
    if (!ALLOWED_FIELDS.includes(field)) {
      reply.status(400).send({ error: `Invalid field: ${field}` });
      return;
    }

    // Log the event
    await sql`
      INSERT INTO college_achievements_events (college, field, delta, source_url)
      VALUES (${college}, ${field}, ${delta}, ${source_url ?? null})
    `;

    // Apply increment
    await sql`
      UPDATE college_achievements
      SET ${sql(field)} = COALESCE(${sql(field)}, 0) + ${delta},
          last_updated = NOW()
      WHERE college ILIKE ${"%" + college + "%"}
    `;

    reply.send({ success: true });
  });
}
