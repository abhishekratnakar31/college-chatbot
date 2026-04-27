import { generateChatCompletion } from "../llm/openai.js";

/**
 * Verifies if the extracted text from a PDF is related to colleges, 
 * universities, admissions, or academic content.
 * 
 * @param text The extracted text snippet (usually first few pages)
 * @returns { isAllowed: boolean; reason?: string }
 */
export async function verifyCollegeContent(text: string): Promise<{ isAllowed: boolean; reason?: string }> {
  const snippet = text.slice(0, 4000); // Only need a chunk for classification
  
  if (!snippet.trim()) {
    return { isAllowed: false, reason: "The document appears to be empty or unreadable." };
  }

  const prompt = `
    You are a Content Auditor for a College Intelligence Platform. 
    Your task is to determine if the provided document text is related to:
    - Higher education (Colleges, Universities, Institutes)
    - Academic programs, courses, or degrees
    - Admissions, entrance exams, or campus life
    - Scholarships, grants, or financial aid
    - Research papers, technical journals, or academic publications

    RULES:
    - If the content is even slightly related to the above, return "ALLOWED".
    - If the content is COMPLETELY UNRELATED (e.g., cooking recipes, sports betting, non-academic fiction, personal shopping lists), return "REJECTED".
    - Output ONLY the word "ALLOWED" or "REJECTED". No explanation.

    DOCUMENT TEXT SNIPPET:
    """
    ${snippet}
    """
  `;

  try {
    const response = await generateChatCompletion([
      { role: "system", content: "You classify academic and college-related content." },
      { role: "user", content: prompt }
    ]);

    const result = response.trim().toUpperCase();
    
    if (result === "ALLOWED") {
      return { isAllowed: true };
    } else {
      return { 
        isAllowed: false, 
        reason: "This document does not appear to be college or academic related." 
      };
    }
  } catch (err) {
    console.error("[Guardrails] AI Verification failed:", err);
    // Fallback: if AI fails, we allow it to avoid blocking legitimate users, 
    // but log it for review.
    return { isAllowed: true };
  }
}
