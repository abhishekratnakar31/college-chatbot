import fetch from 'node-fetch';

async function testChat() {
  const API_URL = "http://127.0.0.1:4006";
  
  const payload = {
    messages: [
      { role: "user", content: "What are the fees of IIT Bombay?" }
    ],
    mode: "web",
    language: "hi" // Hindi
  };

  console.log("Sending request to /chat with language: hi");
  
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error("Error:", response.status, await response.text());
      return;
    }

    const reader = response.body;
    let fullText = "";
    
    reader.on('data', (chunk) => {
      const text = chunk.toString();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') break;
          try {
            const json = JSON.parse(dataStr);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              process.stdout.write(content);
            }
          } catch (e) {}
        }
      }
    });

    reader.on('end', () => {
      console.log("\n\n--- Finished ---");
      console.log("Response starts with Hindi characters?", /[\u0900-\u097F]/.test(fullText));
    });

  } catch (err) {
    console.error("Fetch failed:", err);
  }
}

testChat();
