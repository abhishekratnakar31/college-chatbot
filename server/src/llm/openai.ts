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
              "You are a search query optimizer for a College Assistant chatbot. Your ONLY job is to rewrite the user's question into a clean, specific web search query. RULES: (1) ALWAYS output a search query — never refuse. (2) Only reply OUT_OF_DOMAIN if the question is COMPLETELY unrelated to education. (3) Output ONLY the search query.",
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
