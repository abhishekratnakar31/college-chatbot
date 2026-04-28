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
  LayoutGrid,
  FileUp
} from "lucide-react";

const cn = (...inputs: any[]) => inputs.filter(Boolean).join(" ");

type Message = {
  role: "user" | "assistant";
  content: string;
};

const COMPARISON_CRITERIA = ["Fees", "Placement", "Hostel", "Rankings", "Campus Life", "Alumni"];

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
  abortControllerRef,
  comp1,
  setComp1,
  comp2,
  setComp2,
  selectedCriteria,
  setSelectedCriteria,
  otherCriteria,
  setOtherCriteria,
  showOtherInput,
  setShowOtherInput,
  menuSide = "top",
  hasMessages = false,
  showCompareInputs = true,
  setShowCompareInputs
}: any) => {
  const MenuContent = () => (
    <AnimatePresence>
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: menuSide === "top" ? -10 : 10, scale: 0.95 }} 
          animate={{ opacity: 1, y: 0, scale: 1 }} 
          exit={{ opacity: 0, y: menuSide === "top" ? -10 : 10, scale: 0.95 }} 
          className={cn(
            "absolute left-0 liquid-glass-card p-4 shadow-2xl shadow-black w-64 max-w-sm z-[110]",
            menuSide === "top" ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full">

    {chatMode === "compare" ? (
      <div className="space-y-8 px-2 sm:px-0 max-w-4xl mx-auto">
        <div className="flex items-center justify-between px-1.5 sm:px-3 mb-4">
          <div className="flex gap-3 relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className={cn(
                "w-12 h-12 transition-all rounded-2xl border border-zinc-900 flex items-center justify-center", 
                isMenuOpen ? "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]" : "bg-zinc-900/50 text-zinc-500 hover:text-white"
              )}
            >
              <LayoutGrid size={20} />
            </button>
            <MenuContent />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              className="w-12 h-12 bg-zinc-900/50 text-zinc-500 hover:text-white transition-all rounded-2xl border border-zinc-900 flex items-center justify-center"
            >
              <FileUp size={20} />
            </button>
          </div>

          {hasMessages && !showCompareInputs ? (
            <button 
              onClick={() => setShowCompareInputs(true)}
              className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center gap-2"
            >
              <Plus size={14} /> Compare New
            </button>
          ) : (
            !hasMessages && (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Intelligent Comparison</span>
                </div>
                <span className="text-[9px] font-medium text-zinc-700 mt-1">v2.4 Engine Active</span>
              </div>
            )
          )}
        </div>

        {(!hasMessages || showCompareInputs) && (
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="premium-input rounded-[2.5rem] p-3 flex items-center gap-5 group/input ring-1 ring-white/5 focus-within:ring-white/20">
              <div className="w-12 h-12 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-xs font-black text-zinc-700 group-focus-within/input:bg-white group-focus-within/input:text-black transition-all">01</div>
              <input 
                value={comp1} 
                onChange={(e) => setComp1(e.target.value)}
                placeholder="First Institution..."
                className="bg-transparent flex-1 outline-none text-white text-base font-medium py-4 placeholder:text-zinc-800"
              />
            </div>

            <div className="premium-input rounded-[2.5rem] p-3 flex items-center gap-5 group/input ring-1 ring-white/5 focus-within:ring-white/20">
              <div className="w-12 h-12 rounded-[1.5rem] bg-white/5 flex items-center justify-center text-xs font-black text-zinc-700 group-focus-within/input:bg-white group-focus-within/input:text-black transition-all">02</div>
              <input 
                value={comp2} 
                onChange={(e) => setComp2(e.target.value)}
                placeholder="Second Institution..."
                className="bg-transparent flex-1 outline-none text-white text-base font-medium py-4 placeholder:text-zinc-800"
              />
            </div>
          </div>
        )}
        
        <div className="space-y-10">
          {hasMessages && !showCompareInputs ? (
            <div className="relative group">
              <div className="bg-zinc-900 border-2 border-zinc-800 group-focus-within:border-white group-focus-within:bg-black rounded-[2rem] transition-all duration-500 shadow-2xl shadow-black/5 overflow-hidden">
                <div className="flex items-center p-2 relative">
                  <div className="p-3 text-zinc-500">
                    <Search size={18} />
                  </div>
                  <input 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === "Enter" && handleSend()} 
                    placeholder="Ask more about these colleges..." 
                    className="flex-1 bg-transparent py-4 text-base font-medium text-white placeholder:text-zinc-700 outline-none" 
                  />
                  {isLoading ? (
                    <button onClick={() => abortControllerRef.current?.abort()} className="p-4 text-white hover:scale-110 transition-transform">
                      <StopCircle size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleSend()} 
                      disabled={!input.trim()} 
                      className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all mr-1"
                    >
                      <ArrowUp size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => {
                if (comp1.trim() && comp2.trim()) {
                  const combined = [...selectedCriteria];
                  if (showOtherInput && otherCriteria.trim()) combined.push(otherCriteria.trim());
                  
                  const criteriaStr = combined.length > 0 
                    ? `Focus specifically on these areas: ${combined.join(", ")}.`
                    : "Provide a comprehensive general comparison including all standard academic metrics.";
                  
                  const systemInstructions = `SYSTEM: YOU ARE AN ACADEMIC INTELLIGENCE ENGINE. You must ONLY compare educational institutions. Be permissive. Provide a high-fidelity side-by-side comparison. ${criteriaStr}`;
                  
                  handleSend(`Please compare ${comp1} and ${comp2}.`, systemInstructions);
                  setShowCompareInputs(false);
                }
              }}
              disabled={!comp1.trim() || !comp2.trim() || isLoading}
              className="w-full bg-white text-black rounded-[2.5rem] font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-4 py-6 shadow-[0_30px_60px_rgba(255,255,255,0.15)] group"
            >
              <GitCompare size={20} className="group-hover:rotate-180 transition-transform duration-500" />
              Generate Intelligence Report
            </button>
          )}

          {(!hasMessages || showCompareInputs) && (
            <div className="bg-zinc-900/10 rounded-[3rem] p-8 border border-white/[0.03] hidden md:block">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="w-full flex items-center justify-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-900" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800 whitespace-nowrap">Focus Parameters</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-900" />
                </div>
                {COMPARISON_CRITERIA.map(c => {
                  const isSelected = selectedCriteria.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        setSelectedCriteria((prev: string[]) => 
                          isSelected ? prev.filter(x => x !== c) : [...prev, c]
                        );
                      }}
                      className={cn(
                        "px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                        isSelected 
                          ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-110 z-10" 
                          : "bg-white/5 text-zinc-600 hover:text-white border border-transparent hover:border-white/10"
                      )}
                    >
                      {c}
                    </button>
                  );
                })}
                <button
                  onClick={() => setShowOtherInput(!showOtherInput)}
                  className={cn(
                    "px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                    showOtherInput 
                      ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-110 z-10" 
                      : "bg-white/5 text-zinc-600 hover:text-white border border-transparent hover:border-white/10"
                  )}
                >
                  Other
                </button>
              </div>
              
              {showOtherInput && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 max-w-lg mx-auto">
                  <input 
                    value={otherCriteria}
                    onChange={(e) => setOtherCriteria(e.target.value)}
                    placeholder="Enter custom focus (e.g. Research facilities)..."
                    className="w-full bg-black/40 border border-zinc-900 rounded-3xl px-8 py-5 text-sm font-medium text-white outline-none focus:border-white/20 transition-all text-center placeholder:text-zinc-800"
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>


    ) : (
      <div className="relative group">
        <MenuContent />
        <div className="bg-zinc-900 border-2 border-zinc-800 group-focus-within:border-white group-focus-within:bg-black rounded-3xl sm:rounded-[2.5rem] transition-all duration-500 shadow-2xl shadow-black/5 overflow-hidden">
          {(isLoading || isUploading) && (
            <div className="absolute top-0 left-0 right-0 h-1 overflow-hidden z-10">
              <motion.div className="h-full bg-white w-1/3" animate={{ x: ["-100%", "300%"] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
            </div>
          )}
          <div className="flex items-center p-1.5 sm:p-3 relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={cn("p-3 sm:p-4 transition-all rounded-xl sm:rounded-2xl", isMenuOpen ? "bg-white text-black" : "text-zinc-600 hover:text-white hover:bg-zinc-800")}>
              <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="p-3 sm:p-4 text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all rounded-xl sm:rounded-2xl flex items-center justify-center">
              <FileUp size={20} className="sm:w-6 sm:h-6" />
            </button>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={isUploading ? "Indexing..." : `Ask in ${chatMode}...`} className="flex-1 bg-transparent py-3 sm:py-4 text-sm sm:text-lg font-medium text-white placeholder:text-zinc-700 outline-none" disabled={isUploading} />
            {isLoading ? (
              <button onClick={() => abortControllerRef.current?.abort()} className="p-3 sm:p-4 text-white hover:scale-110 transition-transform"><StopCircle size={20} className="sm:w-6 sm:h-6" /></button>
            ) : (
              <button onClick={() => handleSend()} disabled={!input.trim() || isUploading} className="w-10 h-10 sm:w-12 sm:h-12 bg-white text-black rounded-xl sm:rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-20 transition-all"><ArrowUp size={18} className="sm:w-5 sm:h-5" /></button>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);
};

function ChatContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q");
  const initialFile = searchParams.get("file");
  const initialFileUrl = searchParams.get("fileUrl");
  const initialMode = (searchParams.get("mode") as "pdf" | "web" | "compare") ?? "web";
  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4006";
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
  const [comp1, setComp1] = useState("");
  const [comp2, setComp2] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [showCompareInputs, setShowCompareInputs] = useState(true);
  const [otherCriteria, setOtherCriteria] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);

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

  const handleSend = async (text: string = input, hiddenPrefix?: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: Message = { role: "user", content: text };
    const apiMessage: Message = { 
      role: "user", 
      content: hiddenPrefix ? `${hiddenPrefix}\n\n${text}` : text 
    };
    
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
          messages: [...messages, apiMessage],
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
      <aside className="hidden md:flex w-20 border-r border-zinc-900 flex-col items-center py-8 gap-8 z-[100] bg-black">
        <Link href="/" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:scale-110 transition-transform"><GraduationCap className="text-black w-6 h-6" /></Link>
        <div className="flex flex-col gap-4">
          {[{ icon: Brain, href: "/chat", active: true }, { icon: Newspaper, href: "/news" }, { icon: Trophy, href: "/rankings" }].map((item, i) => (
            <Link key={i} href={item.href} className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", item.active ? "bg-white text-black shadow-xl shadow-white/10" : "text-zinc-600 hover:bg-zinc-900 hover:text-white")}><item.icon size={20} /></Link>
          ))}
        </div>
      </aside>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-lg border-t border-zinc-900 flex items-center justify-around z-[200] px-6">
        {[{ icon: GraduationCap, href: "/" }, { icon: Brain, href: "/chat", active: true }, { icon: Newspaper, href: "/news" }, { icon: Trophy, href: "/rankings" }].map((item, i) => (
          <Link key={i} href={item.href} className={cn("p-3 rounded-xl transition-all", item.active ? "bg-white text-black" : "text-zinc-600")}>
            <item.icon size={20} />
          </Link>
        ))}
      </nav>

      <main className="flex-1 flex flex-col relative bg-[#0a0a0a]">

        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar flex flex-col", 
          messages.length === 0 ? "items-center justify-center md:justify-center py-12 md:py-0" : "pb-20 md:pb-0"
        )}>
          <div className={cn(
            "max-w-3xl w-full mx-auto px-4 sm:px-6", 
            messages.length === 0 ? "space-y-10 sm:space-y-16" : cn("space-y-8 sm:space-y-12 pt-8 sm:pt-12", chatMode === "compare" ? (showCompareInputs ? "pb-[42rem] sm:pb-[36rem]" : "pb-48 sm:pb-56") : "pb-40 sm:pb-48")
          )}>
            {messages.length === 0 && !isLoading && (
              <div className="text-center space-y-6 pt-12 md:pt-0">
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold tracking-tight text-zinc-500 px-4">
                  {chatMode === "compare" ? "Compare your institutions" : "What shall we analyze today?"}
                </h1>
              </div>
            )}
            
            {messages.length > 0 && (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  msg.content.startsWith("ATTACHMENT") ? null : (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                      <div className={cn("max-w-[95%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl text-sm sm:text-[15px] leading-relaxed", msg.role === "user" ? "bg-zinc-900 border border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 text-white font-medium" : "w-full text-zinc-300")}>
                        <div className="prose prose-invert max-w-none prose-premium prose-sm sm:prose-base">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            )}

            {messages.length === 0 && (
              <div className={cn("w-full relative", chatMode !== "compare" && "hidden md:block")}>
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
                  comp1={comp1}
                  setComp1={setComp1}
                  comp2={comp2}
                  setComp2={setComp2}
                  selectedCriteria={selectedCriteria}
                  setSelectedCriteria={setSelectedCriteria}
                  otherCriteria={otherCriteria}
                  setOtherCriteria={setOtherCriteria}
                  showOtherInput={showOtherInput}
                  setShowOtherInput={setShowOtherInput}
                  menuSide="bottom"
                  hasMessages={messages.length > 0}
                  showCompareInputs={showCompareInputs}
                  setShowCompareInputs={setShowCompareInputs}
                />
              </div>
            )}
            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {(messages.length > 0 || chatMode !== "compare") && (
          <div className={cn(
            "absolute bottom-16 md:bottom-0 left-0 right-0 p-4 sm:p-8 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-10 sm:pt-20 z-50",
            (messages.length === 0 && chatMode !== "compare") && "md:hidden",
            (messages.length === 0 && chatMode === "compare") && "hidden"
          )}>
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
                comp1={comp1}
                setComp1={setComp1}
                comp2={comp2}
                setComp2={setComp2}
                selectedCriteria={selectedCriteria}
                setSelectedCriteria={setSelectedCriteria}
                otherCriteria={otherCriteria}
                setOtherCriteria={setOtherCriteria}
                showOtherInput={showOtherInput}
                setShowOtherInput={setShowOtherInput}
                menuSide="top"
                hasMessages={messages.length > 0}
                showCompareInputs={showCompareInputs}
                setShowCompareInputs={setShowCompareInputs}
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
