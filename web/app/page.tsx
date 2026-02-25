"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`max-w-xl px-4 py-2 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-white text-black self-start"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none disabled:bg-gray-50"
          placeholder={isLoading ? "Thinking..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-blue-300 transition-colors"
        >
          {isLoading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
}