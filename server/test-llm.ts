import "dotenv/config";
import { generateStream } from "./src/llm/openai.js";

async function test() {
  const messages = [
    {
      role: "system",
      content:
        "You are a specialized College Assistant chatbot. Answer the question based on context.",
    },
    { role: "user", content: "tell me about courses from chitkara univeristy" },
  ];

  console.log("Starting stream...");
  const stream = await generateStream(messages);
  const reader = stream.getReader();
  const decoder = new TextDecoder();

  let result = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    console.log("CHUNK:", chunk);

    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data:")) {
        const json = line.replace("data: ", "").trim();
        if (json === "[DONE]") continue;
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            result += content;
            process.stdout.write(content);
          }
        } catch (e) {
          console.error("Parse error on line:", line);
        }
      }
    }
  }
  console.log("\nFinal Result:", result);
}

test();
