async function test() {
  try {
    const response = await fetch("http://127.0.0.1:4000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "user", content: "ATTACHMENT|list-of-available-programs.pdf|/uploads/list-of-available-programs.pdf" },
          { role: "assistant", content: "I ve finished indexing **1 documents**. You can now ask me questions about them!" },
          { role: "user", content: "what campuses are availble" }
        ]
      })
    });
    console.log("STATUS:", response.status);
    const text = await response.text();
    console.log("RESPONSE:", text.slice(0, 500));
  } catch (e) {
    console.error("ERROR:", e);
  }
}
test();
