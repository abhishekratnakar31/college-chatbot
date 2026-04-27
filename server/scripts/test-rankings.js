import { sql } from "./lib/db.js";

async function test() {
  try {
    const count = await sql`SELECT COUNT(*) FROM college_achievements`;
    console.log("College count:", count[0].count);
    
    const sample = await sql`SELECT college, nirf_rank, nirf_category FROM college_achievements LIMIT 5`;
    console.log("Sample colleges:", sample);
    
    const filters = await sql`SELECT nirf_category, COUNT(*) FROM college_achievements GROUP BY nirf_category`;
    console.log("Category counts:", filters);
  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    process.exit(0);
  }
}

test();
