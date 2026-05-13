import { sql } from "../lib/db.js";
import { searchWeb } from "../lib/search.js";
import { generateChatCompletion } from "../llm/openai.js";

export async function scrapeCollegeIntelligence(collegeName: string) {
  console.log(`[RankScraper] Initializing live sync for: ${collegeName}`);

  const queries = [
    `${collegeName} NIRF ranking 2024 2025`,
    `${collegeName} average package highest package 2024`,
    `${collegeName} research papers patents count 2024`
  ];

  try {
    const searchResults = await Promise.all(queries.map(q => searchWeb(q)));
    const flatResults = searchResults.flat();
    const context = flatResults.map(r => `[Source: ${r.url}] ${r.content}`).join("\n");

    const prompt = `
      You are an Institutional Intelligence Extraction Bot.
      Extract the LATEST 2024-2025 data for "${collegeName}" from the provided search context.

      CONTEXT:
      ${context}

      REQUIRED DATA (Provide as JSON):
      - nirf_rank: (number) Latest NIRF rank in its primary category.
      - avg_package: (number in Lakhs, e.g., 22.5) 
      - highest_package: (number in Lakhs)
      - research_papers: (number) Total or annual count.
      - patents: (number) Total or annual count.
      - startups_incubated: (number)
      - city: (string)
      - state: (string)
      - website: (string)
      - courses: (Array of objects) [{ name: string, duration: string, fees: string, eligibility: string, exams: string }]
      - website_source: (string URL)

      CRITICAL: 
      - If multiple numbers exist, prioritize 2024 or 2025 data.
      - For courses, extract at least 5-10 major programs offered.
      - If data is not found, return null for that field.
      - Output ONLY valid JSON.
    `;

    const llmResponse = await generateChatCompletion([
      { role: "system", content: "You are a data extraction specialist. Precision is key." },
      { role: "user", content: prompt }
    ], "openai/gpt-4o-mini", 1500, true);

    const extracted = JSON.parse(llmResponse);
    console.log(`[RankScraper] Extracted data for ${collegeName}:`, extracted);

    if (extracted) {
      await sql`
        UPDATE college_achievements
        SET 
          nirf_rank = COALESCE(${extracted.nirf_rank}, nirf_rank),
          avg_package = COALESCE(${extracted.avg_package}, avg_package),
          highest_package = COALESCE(${extracted.highest_package}, highest_package),
          research_papers = COALESCE(${extracted.research_papers}, research_papers),
          patents = COALESCE(${extracted.patents}, patents),
          startups_incubated = COALESCE(${extracted.startups_incubated}, startups_incubated),
          city = COALESCE(${extracted.city}, city),
          state = COALESCE(${extracted.state}, state),
          website = COALESCE(${extracted.website}, website),
          courses = COALESCE(${JSON.stringify(extracted.courses)}, courses),
          last_updated = NOW()
        WHERE college = ${collegeName}
      `;
      return { success: true, data: extracted };
    }
  } catch (error) {
    console.error(`[RankScraper] Error syncing ${collegeName}:`, error);
    return { success: false, error };
  }
}
