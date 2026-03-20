"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  MessageSquare,
  RefreshCw,
  Info,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "What are the admission requirements?",
  "Tell me about the campus life.",
  "What scholarships are available?",
  "How do I apply for financial aid?",
];


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your College Assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sessionId = useRef(
    typeof window !== "undefined"
      ? localStorage.getItem("sessionId") || crypto.randomUUID()
      : ""
  );

  useEffect(() => {
    if (!sessionId.current && typeof crypto !== "undefined") {
      sessionId.current = crypto.randomUUID();
    }
    localStorage.setItem("sessionId", sessionId.current);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("UPLOAD RESPONSE:", data);
      
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;

    const currentInput = text;

    const userMessage: Message = {
      role: "user",
      content: currentInput,
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
        body: JSON.stringify({ message: currentInput, sessionId: sessionId.current }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let assistantText = "";

      // Add empty assistant message first
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          const json = line.replace("data: ", "").trim();
          if (json === "[DONE]") break;

          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;

            if (content) {
              assistantText += content;

              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantText,
                };
                return updated;
              });
            }
          } catch {
            // Ignore partial JSON chunks
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);

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
  }, [messages, isLoading]);

  const resetChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your College Assistant. How can I help you today?",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-main)]">
      {/* Header */}
      <header className="glass-morphism fixed top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-main)] leading-none">
              College Assistant
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetChat}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-muted)] transition-colors"
            title="Reset Chat"
          >
            <RefreshCw size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--text-muted)] transition-colors">
            <Info size={20} />
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-32 px-4 md:px-0">
        <div className="max-w-3xl mx-auto mb-6 flex items-center gap-3 p-4 bg-white/50 rounded-2xl border border-gray-200 shadow-sm backdrop-blur-sm">
          <input
            type="file"
            accept="application/pdf"
            ref={fileInputRef}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-black/5 file:text-black hover:file:bg-black/10 transition-colors"
          />
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload PDF"}
          </button>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={cn(
                  "flex items-start gap-3",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm",
                    msg.role === "user"
                      ? "bg-gray-200 text-black"
                      : "bg-gray-100 text-gray-400",
                  )}
                >
                  {msg.role === "user" ? (
                    <User size={18} />
                  ) : (
                    <Sparkles size={18} className="text-black" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                    msg.role === "user"
                      ? "bg-gray-200 text-black rounded-tr-none font-medium"
                      : "bg-gray-500/10 text-black rounded-tl-none border border-black/5",
                  )}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-500/10 border border-black/5 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot size={18} className="text-black" />
              </div>
              <div className="bg-gray-500/10 px-5 py-3 rounded-2xl rounded-tl-none border border-black/5 shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-black rounded-full animate-bounce"></span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>
      </main>

      {/* Chat Input Area */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/80 to-transparent">
        <div className="max-w-3xl mx-auto">
          {/* Suggested Questions */}
          {messages.length === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mb-4 justify-center"
            >
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 bg-gray-500/10 border border-black/5 rounded-full text-xs font-medium text-black hover:bg-gray-500/20 transition-all shadow-sm flex items-center gap-2 group"
                >
                  <MessageSquare size={14} />
                  {q}
                  <ArrowRight
                    size={12}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </motion.div>
          )}

          {/* Input Box */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-black/5 rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
            <div className="relative flex items-center bg-gray-500/10 rounded-2xl border border-black/5 shadow-xl overflow-hidden focus-within:border-black/20 transition-all">
              <input
                type="text"
                className="flex-1 px-6 py-4 bg-transparent text-black placeholder-gray-500 focus:outline-none text-sm"
                placeholder="Ask me anything about your college..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <div className="pr-4 flex items-center gap-2">
                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "p-2.5 rounded-xl transition-all duration-300 transform",
                    input.trim()
                      ? "bg-black text-white shadow-md active:scale-95"
                      : "bg-black/10 text-black/40 cursor-not-allowed",
                  )}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
          <p className="  mt-10 "></p>
        </div>
      </div>
    </div>
  );
}
