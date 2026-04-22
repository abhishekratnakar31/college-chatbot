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

export async function generateSearchQuery(
  messages: ChatMessage[],
): Promise<string> {
  const lastMessage = messages[messages.length - 1]?.content || "";

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
              "You are a domain classifier and search query optimizer for a College Assistant. Evaluate the user's question in the context of the conversation, especially if documents have been uploaded. If the question is completely unrelated to colleges, universities, admissions, academic programs, courses, degrees, campus life, fees, or campuses (e.g., recipes, movies, weather), reply EXACTLY with 'OUT_OF_DOMAIN'. If the question is about 'courses', 'degrees', 'programs', 'subjects', or 'departments', it is ALWAYS in-domain. Otherwise, output ONLY a single search query optimized for finding factual information. Be specific. No preamble.",
          },
          ...messages.slice(-5), // increased context window to 5 messages
        ],
        max_tokens: 50,
      }),
    },
  );

  if (!response.ok) {
    console.error("generateSearchQuery API Error:", response.status, await response.text().catch(() => ""));
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
