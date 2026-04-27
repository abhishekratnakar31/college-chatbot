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
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4005";
  const API_BASE_URL = rawApiUrl.replace("localhost", "127.0.0.1");

  const buildInitialMessages = (): Message[] => {
    const base: Message[] = [];
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

  const ChatInput = ({ 
    input, 
    setInput, 
    handleSend, 
    isLoading, 
    isUploading, 
    chatMode, 
    setChatMode, 
    isMenuOpen, 
    setIsMenuOpen,
    fileInputRef,
    abortControllerRef
  }: any) => (
    <div className="relative group">
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="absolute top-full left-0 mt-6 liquid-glass-card p-4 shadow-2xl shadow-black w-64 z-[110]">
            <h3 className="px-4 pt-2 pb-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">Switch Mode</h3>
            <div className="space-y-1">
              {[
                { id: "web", label: "Web Search", icon: Globe, desc: "Live internet intelligence" },
                { id: "pdf", label: "PDF Analysis", icon: FileSearch, desc: "Study uploaded documents" },
                { id: "compare", label: "Compare", icon: GitCompare, desc: "Side-by-side analysis" }
              ].map(mode => (
                <button key={mode.id} onClick={() => { setChatMode(mode.id as any); setIsMenuOpen(false); }} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group", chatMode === mode.id ? "bg-white text-black" : "hover:bg-zinc-800")}>
                  <mode.icon size={18} className={cn(chatMode === mode.id ? "text-black" : "text-zinc-500 group-hover:text-white")} />
                  <div>
                    <p className="text-xs font-bold">{mode.label}</p>
                    <p className={cn("text-[9px] font-medium", chatMode === mode.id ? "text-black/60" : "text-zinc-500")}>{mode.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-800 transition-all text-left">
                <Plus size={18} className="text-zinc-500" />
                <div>
                  <p className="text-xs font-bold text-white">Upload PDF</p>
                  <p className="text-[9px] font-medium text-zinc-500">Analyze a new document</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-zinc-900 border-2 border-zinc-800 group-focus-within:border-white group-focus-within:bg-black rounded-[2.5rem] transition-all duration-500 shadow-2xl shadow-black/5 overflow-hidden">
        {(isLoading || isUploading) && (
          <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden">
            <motion.div className="h-full bg-white w-1/3" animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        )}
        <div className="flex items-center p-3">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={cn("p-4 transition-all rounded-2xl", isMenuOpen ? "bg-white text-black" : "text-zinc-600 hover:text-white hover:bg-zinc-800")}>
            <LayoutGrid size={24} />
          </button>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={isUploading ? "Indexing document..." : `Ask in ${chatMode} mode...`} className="flex-1 bg-transparent py-4 text-lg font-medium text-white placeholder:text-zinc-700 outline-none" disabled={isUploading} />
          {isLoading ? (
            <button onClick={() => abortControllerRef.current?.abort()} className="p-4 text-white hover:scale-110 transition-transform"><StopCircle size={24} /></button>
          ) : (
            <button onClick={() => handleSend()} disabled={!input.trim() || isUploading} className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"><ArrowUp size={20} /></button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white selection:bg-white selection:text-black overflow-hidden font-sans">
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" seed="92" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
            <feDisplacementMap in="SourceGraphic" in2="blurred" scale="200" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <aside className="w-20 border-r border-zinc-900 flex flex-col items-center py-8 gap-8 z-[100] bg-black">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><GraduationCap className="text-black w-6 h-6" /></Link>
        <div className="flex flex-col gap-4">
          {[{ icon: Brain, href: "/chat", active: true }, { icon: Newspaper, href: "/news" }, { icon: Trophy, href: "/rankings" }].map((item, i) => (
            <Link key={i} href={item.href} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", item.active ? "bg-white text-black shadow-xl shadow-white/10" : "text-zinc-600 hover:bg-zinc-900 hover:text-white")}><item.icon size={20} /></Link>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">

        <div className={cn("flex-1 overflow-y-auto custom-scrollbar flex flex-col", messages.length === 0 && "items-center justify-center pb-20")}>
          <div className={cn("max-w-3xl w-full mx-auto px-6", messages.length === 0 ? "space-y-16" : "space-y-12 pt-12 pb-48")}>
            {messages.length === 0 && !isLoading && (
              <div className="text-center space-y-6">
                <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-zinc-500">What shall we analyze today?</h1>
              </div>
            )}
            
            {messages.length > 0 && (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  msg.content.startsWith("ATTACHMENT") ? null : (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                      <div className={cn("max-w-[85%] rounded-3xl text-[15px] leading-relaxed", msg.role === "user" ? "bg-zinc-900 border border-zinc-800 px-6 py-4 text-white font-medium" : "w-full text-zinc-300")}>
                        <div className="prose prose-invert max-w-none prose-premium">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            )}

            {messages.length === 0 && (
              <div className="w-full relative">
                <ChatInput 
                  input={input} 
                  setInput={setInput} 
                  handleSend={handleSend} 
                  isLoading={isLoading} 
                  isUploading={isUploading} 
                  chatMode={chatMode} 
                  setChatMode={setChatMode}
                  isMenuOpen={isMenuOpen}
                  setIsMenuOpen={setIsMenuOpen}
                  fileInputRef={fileInputRef}
                  abortControllerRef={abortControllerRef}
                />
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-20 z-50">
            <div className="max-w-3xl mx-auto relative">
              <ChatInput 
                input={input} 
                setInput={setInput} 
                handleSend={handleSend} 
                isLoading={isLoading} 
                isUploading={isUploading} 
                chatMode={chatMode} 
                setChatMode={setChatMode}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                fileInputRef={fileInputRef}
                abortControllerRef={abortControllerRef}
              />
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf" />
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #18181b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #fff; }
      `}</style>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense><ChatContent /></Suspense>
  );
}
