"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import {
  FileText,
  Check,
  Globe,
  ExternalLink,
  Paperclip,
  ArrowUp,
  X,
  Plus,
  Brain,
  Search,
  Lightbulb,
  Telescope,
  GraduationCap,
  Newspaper,
  House,
  GitCompare,
  Trophy,
  StopCircle,
  FileSearch,
  LayoutGrid
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

type Message = {
  role: "user" | "assistant";
  content: string;
};

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const initialFile = searchParams.get("file");
  const initialFileUrl = searchParams.get("fileUrl");
  const initialMode = (searchParams.get("mode") as "pdf" | "web" | "compare") ?? "web";
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";
  const API_BASE_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  const buildInitialMessages = (): Message[] => {
    const base: Message[] = [
      { role: "assistant", content: "Hello! I'm your College Intelligence Assistant. How can I help you today?" },
    ];
    if (initialFile) {
      base.push({ role: "user", content: `ATTACHMENT|${initialFile}|${initialFileUrl ?? ""}` });
      base.push({ role: "assistant", content: `I've finished indexing **${initialFile}**. You can now ask me questions about its content!` });
    }
    return base;
  };

  const [messages, setMessages] = useState<Message[]>(buildInitialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [chatMode, setChatMode] = useState<"pdf" | "web" | "compare">(initialMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [webPdfFilename, setWebPdfFilename] = useState<string | null>(initialFile);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (initialQuery && messages.length === buildInitialMessages().length) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setIsMenuOpen(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE_URL}/upload`, { method: "POST", body: formData });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let uploadedUrl = "";
      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const parsed = JSON.parse(line.replace("data: ", "").trim());
            if (parsed.status === "done") uploadedUrl = parsed.fileUrl;
          }
        }
      }
      setWebPdfFilename(file.name);
      setChatMode("pdf");
      setMessages(prev => [
        ...prev,
        { role: "user", content: `ATTACHMENT|${file.name}|${uploadedUrl}` },
        { role: "assistant", content: `Successfully indexed **${file.name}**. Switched to PDF analysis mode.` }
      ]);
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    const currentInput = text;
    const userMessage: Message = { role: "user", content: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          mode: chatMode,
          ...(webPdfFilename ? { pdfFilename: webPdfFilename } : {}),
        }),
      });

      if (!response.ok) throw new Error("Server error");
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await (reader?.read() || { done: true, value: undefined });
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const json = JSON.parse(line.replace("data: ", ""));
              if (json.choices?.[0]?.delta?.content) {
                assistantText += json.choices[0].delta.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1].content = assistantText;
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (err) { console.error(err); } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex h-screen bg-white text-black selection:bg-black selection:text-white overflow-hidden font-sans">
      <aside className="w-20 border-r border-zinc-100 flex flex-col items-center py-8 gap-8 z-[100] bg-white">
        <Link href="/" className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><GraduationCap className="text-white w-6 h-6" /></Link>
        <div className="flex flex-col gap-4">
          {[{ icon: Brain, href: "/chat", active: true }, { icon: Newspaper, href: "/news" }, { icon: Trophy, href: "/rankings" }].map((item, i) => (
            <Link key={i} href={item.href} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", item.active ? "bg-black text-white shadow-xl shadow-black/10" : "text-zinc-400 hover:bg-zinc-50 hover:text-black")}><item.icon size={20} /></Link>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-white">
        <header className="h-20 flex items-center justify-between px-10 border-b border-zinc-50 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Campus Intelligence Engine</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-full border border-zinc-100">
              <div className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-black">{chatMode} mode</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-12 pb-48 custom-scrollbar">
          <div className="max-w-3xl mx-auto px-6 space-y-12">
            {messages.length <= 1 && !isLoading && (
              <div className="py-32 text-center space-y-6">
                <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-zinc-200">What shall we analyze today?</h1>
                <div className="flex flex-wrap justify-center gap-2">
                  {["IIT Bombay placements", "JEE Advanced dates", "Best MBA colleges"].map(q => (
                    <button key={q} onClick={() => handleSend(q)} className="px-4 py-2 rounded-xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:border-black transition-all">{q}</button>
                  ))}
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                msg.content.startsWith("ATTACHMENT") ? null : (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                    <div className={cn("max-w-[85%] rounded-3xl text-[15px] leading-relaxed", msg.role === "user" ? "bg-zinc-50 border border-zinc-100 px-6 py-4 text-black font-medium" : "w-full text-zinc-800")}>
                      <div className="prose prose-zinc max-w-none prose-premium">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white to-transparent pt-20">
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="absolute bottom-full left-0 mb-6 bg-white border-2 border-zinc-100 rounded-[2rem] p-4 shadow-2xl shadow-black/10 w-64 z-[110]">
                  <h3 className="px-4 pt-2 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">Switch Mode</h3>
                  <div className="space-y-1">
                    {[
                      { id: "web", label: "Web Search", icon: Globe, desc: "Live internet intelligence" },
                      { id: "pdf", label: "PDF Analysis", icon: FileSearch, desc: "Study uploaded documents" },
                      { id: "compare", label: "Compare", icon: GitCompare, desc: "Side-by-side analysis" }
                    ].map(mode => (
                      <button key={mode.id} onClick={() => { setChatMode(mode.id as any); setIsMenuOpen(false); }} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group", chatMode === mode.id ? "bg-black text-white" : "hover:bg-zinc-50")}>
                        <mode.icon size={18} className={cn(chatMode === mode.id ? "text-white" : "text-zinc-400 group-hover:text-black")} />
                        <div>
                          <p className="text-xs font-bold">{mode.label}</p>
                          <p className={cn("text-[9px] font-medium", chatMode === mode.id ? "text-white/60" : "text-zinc-400")}>{mode.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100">
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-all text-left">
                      <Plus size={18} className="text-zinc-400" />
                      <div>
                        <p className="text-xs font-bold">Upload PDF</p>
                        <p className="text-[9px] font-medium text-zinc-400">Analyze a new document</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative group">
              <div className="bg-zinc-50 border-2 border-zinc-100 group-focus-within:border-black group-focus-within:bg-white rounded-[2.5rem] transition-all duration-500 shadow-2xl shadow-black/5 overflow-hidden">
                {(isLoading || isUploading) && (
                  <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
                    <motion.div className="h-full bg-black w-1/3" animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
                  </div>
                )}
                <div className="flex items-center p-3">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={cn("p-4 transition-all rounded-2xl", isMenuOpen ? "bg-black text-white" : "text-zinc-400 hover:text-black hover:bg-zinc-100")}>
                    <LayoutGrid size={24} />
                  </button>
                  <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={isUploading ? "Indexing document..." : `Ask in ${chatMode} mode...`} className="flex-1 bg-transparent py-4 text-lg font-medium text-black placeholder:text-zinc-300 outline-none" disabled={isUploading} />
                  {isLoading ? (
                    <button onClick={() => abortControllerRef.current?.abort()} className="p-4 text-black hover:scale-110 transition-transform"><StopCircle size={24} /></button>
                  ) : (
                    <button onClick={() => handleSend()} disabled={!input.trim() || isUploading} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"><ArrowUp size={20} /></button>
                  )}
                </div>
              </div>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" />
            <p className="mt-4 text-[10px] text-center font-black uppercase tracking-[0.3em] text-zinc-300">CampusAI Intelligence Engine • {chatMode.toUpperCase()} MODE ACTIVE</p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #f4f4f5; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #000; }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense><ChatContent /></Suspense>
  );
}
