import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL is not set in environment variables!");
  throw new Error("DATABASE_URL is required");
}

export const sql = postgres(connectionString);

export async function initNewsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS news (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      summary     TEXT,
      url         TEXT UNIQUE NOT NULL,
      source      TEXT,
      category    TEXT,
      image       TEXT,
      published_at TIMESTAMPTZ,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    ) 
  `;
  // ── Migrations: add new columns to existing tables safely ──────────
  await sql`ALTER TABLE news ADD COLUMN IF NOT EXISTS category TEXT`;
  // Index for fast source filtering and date ordering
  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_source ON news (source)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_category ON news (category)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_news_published_at ON news (published_at DESC)
  `;
  console.log("PostgreSQL News Table Initialized.");
}

export async function initAchievementsTable() {
  // Main college achievements table
  await sql`
    CREATE TABLE IF NOT EXISTS college_achievements (
      id                  SERIAL PRIMARY KEY,
      college             TEXT UNIQUE NOT NULL,
      aliases             TEXT[]        DEFAULT '{}',
      nirf_rank           INT,
      nirf_category       TEXT          DEFAULT 'Engineering',
      global_rank         INT,
      patents             INT           DEFAULT 0,
      research_papers     INT           DEFAULT 0,
      hackathons_won      INT           DEFAULT 0,
      startups_incubated  INT           DEFAULT 0,
      awards              TEXT[]        DEFAULT '{}',
      city                TEXT,
      state               TEXT,
      fees_range          TEXT,
      avg_package         NUMERIC       DEFAULT 0,
      highest_package     NUMERIC       DEFAULT 0,
      user_rating         NUMERIC       DEFAULT 0,
      total_reviews       INT           DEFAULT 0,
      logo_url            TEXT,
      last_updated        TIMESTAMPTZ   DEFAULT NOW()
    )
  `;

  // ── Migrations: add columns that may not exist in older installs ────
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS aliases TEXT[] DEFAULT '{}'`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS global_rank INT`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS patents INT DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS research_papers INT DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS hackathons_won INT DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS startups_incubated INT DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS awards TEXT[] DEFAULT '{}'`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS nirf_category TEXT DEFAULT 'Engineering'`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS city TEXT`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS state TEXT`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS fees_range TEXT`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS avg_package NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS highest_package NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS user_rating NUMERIC DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0`;
  await sql`ALTER TABLE college_achievements ADD COLUMN IF NOT EXISTS logo_url TEXT`;

  // Audit log for AI-extracted increments
  await sql`
    CREATE TABLE IF NOT EXISTS college_achievements_events (
      id           SERIAL PRIMARY KEY,
      college      TEXT         NOT NULL,
      field        TEXT         NOT NULL,
      delta        INT          NOT NULL,
      source_url   TEXT,
      extracted_at TIMESTAMPTZ  DEFAULT NOW()
    )
  `;

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_achievements_nirf ON college_achievements (nirf_rank ASC NULLS LAST)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_achievements_category ON college_achievements (nirf_category)`;

  console.log("PostgreSQL Achievements Table Initialized.");
}




export async function initDB() {
  try {
    // Core Facts table (Structured data)
    await sql`
      CREATE TABLE IF NOT EXISTS college_stats (
        id SERIAL PRIMARY KEY,
        category TEXT,
        key TEXT UNIQUE,
        value TEXT
      )
    `;

    // News table
    await initNewsTable();

    // College achievements & rankings table
    await initAchievementsTable();

    // Scholarships table removal (feature decommissioned)


    console.log("PostgreSQL Database Initialized.");
  } catch (err) {
    console.error("Failed to initialize PostgreSQL:", err);
    throw err;
  }
}
