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
        max_tokens: 500,
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
              "You are a search query optimizer. Given a conversation history and a user's question, output ONLY a single search query optimized for finding factual information on the web. Be specific (e.g., include university names if mentioned). No preamble, just the query.",
          },
          ...messages.slice(-3),
        ],
        max_tokens: 50,
      }),
    },
  );

  const data = await response.json();
  const query =
    data.choices?.[0]?.message?.content?.replace(/\"/g, "") || lastMessage;
  console.log("Optimized Search Query:", query);
  return query;
}
