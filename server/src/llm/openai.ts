import type { ChatMessage } from "../types/chat.js";

export async function generateStream(messages: ChatMessage[]) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "College Chatbot",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        stream: true,
        messages,
        max_tokens: 4000,
      }),
    },
  );
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Error: ${errText}`);
  }
  return response.body;
}

/**
 * Standard non-streaming chat completion
 */
export async function generateChatCompletion(messages: ChatMessage[], model = "openai/gpt-4o-mini") {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter Error: ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function generateSearchQuery(
  messages: ChatMessage[],
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  // Strip out any internal SYSTEM: blocks from the query optimizer input
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a search query optimizer for a College Assistant chatbot. Your ONLY job is to rewrite the user's question into a clean, specific web search query. RULES: (1) ALWAYS output a search query — never refuse. (2) Only reply OUT_OF_DOMAIN if the question is unrelated to institutional information, admissions, or academic programs. (3) DO NOT search for general lifestyle, health, diet, or medical advice even if 'campus' is mentioned. (4) Output ONLY the search query.",
          },
          ...messages.slice(-5).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
        ],
        max_tokens: 50,
      }),
    },
  );

  if (!response.ok) {
    console.error(
      "generateSearchQuery API Error:",
      response.status,
      await response.text().catch(() => ""),
    );
    return lastMessage;
  }

  try {
    const data = await response.json();
    const query =
      data.choices?.[0]?.message?.content?.replace(/\"/g, "") || lastMessage;
    console.log("Optimized Search Query:", query);
    return query;
  } catch (error) {
    console.error("generateSearchQuery JSON Parse Error:", error);
    return lastMessage;
  }
}
export async function evaluateIntent(messages: ChatMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const sanitizedInput = lastMessage.replace(/SYSTEM:[\s\S]*?\n\n/g, "").trim();

  // HEURISTIC: If the query explicitly contains academic keywords, bypass LLM classification
  const academicKeywords = ["fees", "placement", "ranking", "admission", "cutoff", "eligibility", "course", "curriculum", "syllabus", "hostel", "scholarship", "internship"];
  if (academicKeywords.some(kw => sanitizedInput.toLowerCase().includes(kw))) {
    return "VALID";
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a domain classifier for AcademiaAI, a strict academic intelligence assistant.
Your job is to evaluate if the user's query is within the academic scope.

VALID SCOPE:
- College/University information (Fees, Placements, Rankings, Admissions, Courses, Campus facilities, official student life).
- Short follow-ups like "its fees", "what about placements", "show rankings" are VALID if they refer to a college.

OUT OF SCOPE:
- General life advice (health, medical, recipes, relationships, workout).
- Social/Behavioral issues (fights, bullying, dating, gossip, illegal acts).
- Irrelevant topics (weather, sports, movies, politics).

RULE:
- If the query is about Fees, Placements, or Rankings, it is ALWAYS 'VALID'.
- Do not let previous off-topic queries poison the evaluation of a NEW on-topic query.
- Reply EXACTLY 'VALID' or 'OUT_OF_DOMAIN'.`,
          },
          ...messages.slice(-3).map(m => m === messages[messages.length-1] ? { ...m, content: sanitizedInput } : m),
        ],
        max_tokens: 10,
        temperature: 0,
      }),
    },
  );

  if (!response.ok) return "VALID";

  try {
    const data = await response.json();
    const result = data.choices?.[0]?.message?.content?.trim() || "VALID";
    return result.includes("OUT_OF_DOMAIN") ? "OUT_OF_DOMAIN" : "VALID";
  } catch {
    return "VALID";
  }
}
