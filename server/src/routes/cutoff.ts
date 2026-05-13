import type { FastifyInstance } from "fastify";
import { generateChatCompletion } from "../llm/openai.js";
import { sql } from "../lib/db.js";
import { searchWeb } from "../lib/search.js";

/**
 * Mock Cutoff Data (Still used as context for the LLM to maintain consistency)
 */
const CUTOFF_CONTEXT = [
  {
    college: "IIT Madras",
    exam: "JEE Advanced",
    branches: [
      { name: "Computer Science and Engineering", open: 148, obc: 82, sc: 45, st: 22 },
      { name: "Electrical Engineering", open: 615, obc: 320, sc: 160, st: 85 }
    ]
  },
  {
    college: "NIT Trichy",
    exam: "JEE Main",
    branches: [
      { name: "Computer Science and Engineering", open: 714, obc: 350, sc: 180, st: 90 }
    ]
  }
];

export async function cutoffRoute(app: FastifyInstance) {
  app.post("/api/cutoff/predict", async (request, reply) => {
    const { rank, category, examType, field, gender, state, domicile, budget, boardPercentage } = request.body as { 
      rank: number; 
      category: string; 
      examType: string;
      field: string;
      gender: string;
      state: string;
      domicile: string;
      budget: number;
      boardPercentage?: number | null;
    };

    if (!rank || !category || !examType) {
      return reply.status(400).send({ error: "Missing required fields: rank, category, examType" });
    }

    try {
      // ── Step 1: Retrieval (RAG) ──────────────────────────────────────────
      const lowerBound = Math.round(rank * 0.8);
      const upperBound = Math.round(rank * 1.5); 

      let retrievedCutoffs = await sql`
        SELECT college, branch, exam_type, closing_rank, category
        FROM college_cutoffs
        WHERE exam_type = ${examType}
        AND closing_rank BETWEEN ${lowerBound} AND ${upperBound}
        LIMIT 40
      `;

      // ── Step 1b: Web Search Fallback (Improve Recall) ─────────────────────
      let webContext = "";
      if (retrievedCutoffs.length < 5) {
        console.log(`[Retrieval] Sparse DB results (${retrievedCutoffs.length}). Initiating web search...`);
        const searchQuery = `${examType} 2024 cutoff for ${category} rank ${rank} ${field}`;
        const searchResults = await searchWeb(searchQuery);
        webContext = searchResults.map(r => `[Source: ${r.url}] ${r.content}`).join("\n");
      }

      // ── Step 2: Call LLM with Elite Context ────────────────────────────────
      const prompt = `
        You are an Elite Institutional Admission Intelligence Engine (Neural-V8).
        Your objective is to provide a high-fidelity admission probability report.

        USER ASSESSMENT PROFILE:
        - Assessment Pathway: ${examType} (${field.toUpperCase()})
        - Performance Rank: ${rank}
        - Social Category: ${category}
        - Gender Identity: ${gender}
        - Domicile State: ${domicile}
        - Counseling Quota: ${state}
        - Budget Capacity (Annual Fee): ₹${budget.toLocaleString()}
        - Academic Merit (12th): ${boardPercentage || "Not provided"}

        RETRIEVED INSTITUTIONAL DATA (Ground Truth):
        ${retrievedCutoffs.length > 0 ? JSON.stringify(retrievedCutoffs) : "No direct database matches."}

        WEB INTELLIGENCE (Real-time Scraped):
        ${webContext || "No real-time web data available. Use internal historical archives for 2024 trends."}

        TASK:
        Based on the REAL RETRIEVED DATA and WEB INTELLIGENCE above, predict the top 10 institutions the user has a chance to get into.

        CRITICAL REQUIREMENT:
        Group results by COLLEGE. Each college object MUST contain an array of 'courses' (branches) that the user qualifies for.

        For each college, provide:
        - overall_probability: The likelihood of getting into ANY course at this institution (0-100).
        - courses: An array of objects, each containing:
            - name: The branch/program name.
            - probability: Specific chance for this branch (0-100).
            - cutoff: The predicted or historical closing rank.
            - course_highlights: 1-sentence summary of the curriculum or uniqueness.
        - status: "High", "Moderate", or "Low" based on overall_probability.
        - Other institutional fields: fees, location, placements, eligibility, citations.

        OUTPUT FORMAT:
        You MUST output ONLY a valid JSON object with a 'predictions' array:
        {
          "predictions": [
            {
              "college": "...",
              "overall_probability": number,
              "status": "...",
              "exam": "...",
              "location": "...",
              "fees": "...",
              "placements": "...",
              "eligibility": "...",
              "courses": [
                { "name": "...", "probability": number, "cutoff": number, "course_highlights": "..." }
              ],
              "citations": [{"source": "...", "url": "..."}]
            }
          ]
        }
      `;

      const llmResponse = await generateChatCompletion([
        { role: "system", content: "You are a professional academic advisor. Accuracy is paramount. Group results by institution and list available courses within each. You MUST output a JSON object containing a 'predictions' array." },
        { role: "user", content: prompt }
      ], "openai/gpt-4o-mini", 3000, true);

      // Parse LLM response
      let predictions: any[] = [];
      try {
        const parsed = JSON.parse(llmResponse);
        predictions = parsed.predictions || (Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("JSON Parse Error, attempting recovery...", e);
        const match = llmResponse.match(/\[\s*\{.*\}\s*\]/s) || llmResponse.match(/\{\s*"predictions":.*\}/s);
        if (match) {
          const recovered = JSON.parse(match[0]);
          predictions = recovered.predictions || recovered;
        } else {
          throw new Error("Could not extract valid JSON from LLM response");
        }
      }

      // ── Step 3: Self-Learning (Save Scraped Data) ──────────────────────────
      // Update college_achievements with scraped data in background
      (async () => {
        try {
          for (const pred of predictions) {
            // Only update if we have a college name and some scraped intel
            if (!pred.college) continue;
            
            // Extract numeric package if possible
            const pkgMatch = pred.placements?.match(/₹?(\d+(\.\d+)?)\s*(L|LPA)/i);
            const avgPkg = pkgMatch ? parseFloat(pkgMatch[1]) : 0;

            await sql`
              INSERT INTO college_achievements (college, city, fees_range, avg_package, last_updated)
              VALUES (${pred.college}, ${pred.location}, ${pred.fees}, ${avgPkg}, NOW())
              ON CONFLICT (college) DO UPDATE SET
                fees_range = COALESCE(college_achievements.fees_range, EXCLUDED.fees_range),
                city = COALESCE(college_achievements.city, EXCLUDED.city),
                avg_package = CASE WHEN college_achievements.avg_package = 0 THEN EXCLUDED.avg_package ELSE college_achievements.avg_package END,
                last_updated = NOW()
              WHERE college_achievements.fees_range IS NULL 
                 OR college_achievements.avg_package = 0
            `;
          }
          console.log(`[Self-Learning] Updated ${predictions.length} college profiles with scraped data.`);
        } catch (learnErr) {
          console.warn("[Self-Learning] Background update failed:", learnErr);
        }
      })();

      // ── Store in Database ──────────────────────────────────────────────────
      await sql`
        INSERT INTO predictions (rank, category, exam_type, gender, state, results)
        VALUES (${rank}, ${category}, ${examType}, ${gender}, ${state}, ${JSON.stringify(predictions)})
      `;

      reply.send({ 
        predictions,
        metadata: {
          rank,
          category,
          examType,
          gender,
          state,
          engine: "AI-Neural-V8-SelfLearner"
        }
      });

    } catch (err) {
      console.error("LLM Prediction Error:", err);
      return reply.status(500).send({ error: "Failed to generate AI prediction. Please try again." });
    }
  });
}
